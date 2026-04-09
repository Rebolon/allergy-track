import express from 'express';
import cors from 'cors';
import webpush from 'web-push';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PUSH_PORT || 3001;

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@allergy-track.local';
const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://localhost:8090';
const POCKETBASE_TOKEN = process.env.POCKETBASE_TOKEN || '';
const REMINDER_HOUR = parseInt(process.env.REMINDER_HOUR || '20', 10);

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('ERROR: VAPID keys not configured. Run "npx web-push generate-vapid-keys" and set environment variables.');
  process.exit(1);
}

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

app.use(cors());
app.use(express.json());

const subscriptions = new Map();

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function pocketbaseRequest(endpoint, options = {}) {
  const url = `${POCKETBASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(POCKETBASE_TOKEN && { 'Authorization': `Bearer ${POCKETBASE_TOKEN}` }),
    ...options.headers
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      console.error(`[Push] PocketBase request failed: ${response.status} ${url}`);
      return null;
    }
    if (response.status === 204) return null;
    return response.json();
  } catch (err) {
    console.error(`[Push] PocketBase request error:`, err.message);
    return null;
  }
}

async function getSentNotificationsCount(userId, date, type) {
  const filter = encodeURIComponent(`userId="${userId}" && notificationDate="${date}" && notificationType="${type}"`);
  const result = await pocketbaseRequest(`/api/collections/sent_notifications/records?filter=${filter}&count=true`);
  return result?.count || 0;
}

async function markNotificationSent(userId, date, type, payload = {}) {
  const data = {
    userId,
    notificationDate: date,
    notificationType: type,
    sentAt: new Date().toISOString(),
    payload
  };

  return pocketbaseRequest('/api/collections/sent_notifications/records', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

async function getDailyLogsForDate(date) {
  const filter = encodeURIComponent(`date="${date}"`);
  return pocketbaseRequest(`/api/collections/daily_logs/records?filter=${filter}&perPage=500`);
}

async function getUserSubscriptions(userId) {
  const userSubs = [];
  for (const [key, sub] of subscriptions) {
    if (key.startsWith(`${userId}:`)) {
      userSubs.push(sub);
    }
  }
  return userSubs;
}

async function sendPushNotification(userId, payload) {
  const userSubs = await getUserSubscriptions(userId);

  if (userSubs.length === 0) {
    console.log(`[Scheduler] No subscriptions for user ${userId}`);
    return 0;
  }

  let sentCount = 0;
  for (const sub of userSubs) {
    try {
      await webpush.sendNotification(sub.subscription, JSON.stringify(payload));
      sentCount++;
      console.log(`[Push] Sent to user ${userId}`);
    } catch (err) {
      console.error(`[Push] Failed for user ${userId}:`, err.message);
      if (err.statusCode === 404 || err.statusCode === 410) {
        subscriptions.delete(`${userId}:${sub.subscription.endpoint}`);
      }
    }
  }
  return sentCount;
}

async function checkAndSendDailyReminders() {
  const now = new Date();
  const hour = now.getHours();

  if (hour !== REMINDER_HOUR) {
    return;
  }

  const today = formatDate(now);
  console.log(`[Scheduler] Running daily reminder check for ${today}`);

  const logsResult = await getDailyLogsForDate(today);
  if (!logsResult || !logsResult.items || logsResult.items.length === 0) {
    console.log(`[Scheduler] No logs found for ${today}`);
    return;
  }

  let sentCount = 0;

  for (const log of logsResult.items) {
    const userId = log.updatedBy;
    if (!userId) continue;

    const intakes = typeof log.intakes === 'string' ? JSON.parse(log.intakes) : log.intakes;
    const hasUntaken = intakes && intakes.some(i => !i.taken);

    if (!hasUntaken) {
      console.log(`[Scheduler] User ${userId} has all intakes taken, skipping`);
      continue;
    }

    const alreadySent = await getSentNotificationsCount(userId, today, 'daily_reminder');
    if (alreadySent > 0) {
      console.log(`[Scheduler] Reminder already sent to ${userId} today`);
      continue;
    }

    const payload = {
      title: 'AllergyTrack - Rappel',
      body: "N'oublie pas de prendre tes doses d'allergènes aujourd'hui ! 🥜",
      icon: '/icons/icon-192x192.png'
    };

    const result = await sendPushNotification(userId, payload);
    if (result > 0) {
      await markNotificationSent(userId, today, 'daily_reminder', payload);
      sentCount++;
    }
  }

  console.log(`[Scheduler] Daily reminders completed. Sent: ${sentCount}`);
}

function startScheduler() {
  const ONE_HOUR = 60 * 60 * 1000;
  const CHECK_INTERVAL = ONE_HOUR;

  console.log(`[Scheduler] Starting daily reminder scheduler (hour: ${REMINDER_HOUR}h)`);

  setInterval(checkAndSendDailyReminders, CHECK_INTERVAL);

  setTimeout(() => {
    console.log('[Scheduler] Running initial check...');
    checkAndSendDailyReminders();
  }, 5000);
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', subscriptions: subscriptions.size });
});

app.get('/vapidPublicKey', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

app.post('/subscribe', (req, res) => {
  const { userId, subscription } = req.body;

  if (!userId || !subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'userId and subscription are required' });
  }

  const key = `${userId}:${subscription.endpoint}`;
  subscriptions.set(key, { userId, subscription });

  console.log(`[Push] Subscription registered for user ${userId}. Total: ${subscriptions.size}`);
  res.status(201).json({ success: true });
});

app.post('/unsubscribe', (req, res) => {
  const { userId, endpoint } = req.body;

  if (!userId || !endpoint) {
    return res.status(400).json({ error: 'userId and endpoint are required' });
  }

  const key = `${userId}:${endpoint}`;
  subscriptions.delete(key);

  console.log(`[Push] Unsubscribed user ${userId}. Total: ${subscriptions.size}`);
  res.status(204).send();
});

app.post('/send', (req, res) => {
  const { userId, payload } = req.body;

  if (!userId || !payload) {
    return res.status(400).json({ error: 'userId and payload are required' });
  }

  sendPushNotification(userId, payload)
    .then(sent => {
      res.status(202).json({ sent, total: 1 });
    });
});

app.post('/broadcast', (req, res) => {
  const { payload } = req.body;

  if (!payload) {
    return res.status(400).json({ error: 'payload is required' });
  }

  if (subscriptions.size === 0) {
    return res.status(200).json({ sent: 0 });
  }

  let sentCount = 0;
  const pushPromises = [];

  for (const [key, sub] of subscriptions) {
    pushPromises.push(
      webpush.sendNotification(sub.subscription, JSON.stringify(payload))
        .then(() => sentCount++)
        .catch(err => {
          if (err.statusCode === 404 || err.statusCode === 410) {
            subscriptions.delete(key);
          }
        })
    );
  }

  Promise.all(pushPromises).then(() => {
    console.log(`[Push] Broadcast sent: ${sentCount}/${subscriptions.size}`);
    res.status(202).json({ sent: sentCount, total: subscriptions.size });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Push] Service running on port ${PORT}`);
  console.log(`[Push] VAPID Subject: ${VAPID_SUBJECT}`);
  console.log(`[Push] PocketBase URL: ${POCKETBASE_URL}`);
  startScheduler();
});
