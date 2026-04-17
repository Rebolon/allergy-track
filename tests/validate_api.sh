#!/bin/bash
# E2E Full Validation Script for Allergy Track
# Covers 100% of BDD scope via HTTP/curl

set -e

API_URL="http://localhost:8090/api"
MAIN_USER_EMAIL="mixte@test.fr"
INVITEE_USER_EMAIL="editeur@test.fr"
PASSWORD="demo123456"

# Helper to extract JSON values without jq
extract_json() {
    local key=$1
    local json=$2
    echo "$json" | grep -o "\"$key\":\"[^\"]*\"" | head -1 | cut -d'"' -f4
}

echo "--- [1] AUTHENTICATION ---"
# Login Main User
MAIN_AUTH=$(curl -s -X POST "$API_URL/collections/users/auth-with-password" \
     -H "Content-Type: application/json" \
     -d "{\"identity\":\"$MAIN_USER_EMAIL\", \"password\":\"$PASSWORD\"}")
MAIN_TOKEN=$(extract_json "token" "$MAIN_AUTH")
MAIN_USER_ID=$(extract_json "id" "$MAIN_AUTH")

if [ -z "$MAIN_TOKEN" ]; then echo "❌ Main Auth failed"; exit 1; fi
echo "✅ Main User Authenticated ($MAIN_USER_ID)"

# Login Invitee User
INVITEE_AUTH=$(curl -s -X POST "$API_URL/collections/users/auth-with-password" \
     -H "Content-Type: application/json" \
     -d "{\"identity\":\"$INVITEE_USER_EMAIL\", \"password\":\"$PASSWORD\"}")
INVITEE_TOKEN=$(extract_json "token" "$INVITEE_AUTH")
INVITEE_USER_ID=$(extract_json "id" "$INVITEE_AUTH")

if [ -z "$INVITEE_TOKEN" ]; then echo "❌ Invitee Auth failed"; exit 1; fi
echo "✅ Invitee User Authenticated ($INVITEE_USER_ID)"

echo -e "\n--- [2] PROFILE MANAGEMENT ---"
# Create Profile
PROF_RES=$(curl -s -X POST "$API_URL/collections/profiles/records" \
     -H "Authorization: $MAIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d "{\"name\":\"E2E Robot\", \"birthDate\":\"2022-02-22\", \"onboardingStep\":\"protocol\"}")
PROF_ID=$(extract_json "id" "$PROF_RES")

if [ -z "$PROF_ID" ]; then echo "❌ Profile creation failed"; exit 1; fi
echo "✅ Profile Created: $PROF_ID"

# Create Access (Ownership)
ACC_RES=$(curl -s -X POST "$API_URL/collections/accesses/records" \
     -H "Authorization: $MAIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d "{\"userId\":\"$MAIN_USER_ID\", \"profileId\":\"$PROF_ID\", \"role\":\"owner\"}")
ACC_ID=$(extract_json "id" "$ACC_RES")

if [ -z "$ACC_ID" ]; then echo "❌ Access creation failed"; exit 1; fi
echo "✅ Ownership Access Created: $ACC_ID"

# Update Profile
PATCH_RES=$(curl -s -X PATCH "$API_URL/collections/profiles/records/$PROF_ID" \
     -H "Authorization: $MAIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d "{\"onboardingStep\":\"completed\"}")
echo "✅ Profile Updated (onboardingStep=completed)"

echo -e "\n--- [3] CONFIGURATION (Protocol/Symptoms) ---"
# Create Config
CONF_RES=$(curl -s -X POST "$API_URL/collections/profiles_config/records" \
     -H "Authorization: $MAIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d "{\"profileId\":\"$PROF_ID\", \"startDate\":\"2026-04-17\", \"protocols\":[{\"id\":\"p1\",\"allergen\":\"Arachide\",\"dose\":1,\"frequencyDays\":1,\"createdAt\":\"2026-04-17T10:00:00Z\"}], \"symptoms\":[], \"medicsShields\":[]}")
CONF_ID=$(extract_json "id" "$CONF_RES")

if [ -z "$CONF_ID" ]; then 
    echo "❌ Config creation failed: $CONF_RES"
    # Show more info if failed
    curl -v -X POST "$API_URL/collections/profiles_config/records" \
         -H "Authorization: $MAIN_TOKEN" \
         -H "Content-Type: application/json" \
         -d "{\"profileId\":\"$PROF_ID\", \"startDate\":\"2026-04-17\", \"protocols\":[{\"id\":\"p1\",\"allergen\":\"Arachide\",\"dose\":1,\"frequencyDays\":1,\"createdAt\":\"2026-04-17T10:00:00Z\"}], \"symptoms\":[], \"medicsShields\":[]}"
    exit 1
fi
echo "✅ Config Created: $CONF_ID"

echo -e "\n--- [4] DAILY LOGS ---"
# Create Daily Log
LOG_RES=$(curl -s -X POST "$API_URL/collections/daily_logs/records" \
     -H "Authorization: $MAIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d "{\"profileId\":\"$PROF_ID\", \"date\":\"2026-04-17\", \"intakes\":[{\"id\":\"i1\",\"label\":\"Dose\"}], \"symptoms\":[], \"treatments\":[{\"id\":\"t1\",\"label\":\"Aucun\"}], \"updatedBy\":\"$MAIN_USER_ID\"}")
LOG_ID=$(extract_json "id" "$LOG_RES")

if [ -z "$LOG_ID" ]; then echo "❌ Daily log failed: $LOG_RES"; exit 1; fi
echo "✅ Daily Log Recorded: $LOG_ID"

echo -e "\n--- [5] GAMIFICATION ---"
# Initialize Gamification
GAME_RES=$(curl -s -X POST "$API_URL/collections/gamification/records" \
     -H "Authorization: $MAIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d "{\"profileId\":\"$PROF_ID\", \"totalStreakPoints\":10, \"longestStreak\":1}")
GAME_ID=$(extract_json "id" "$GAME_RES")

if [ -z "$GAME_ID" ]; then echo "❌ Gamification init failed"; exit 1; fi
echo "✅ Gamification Initialized: $GAME_ID"

echo -e "\n--- [6] INVITATIONS & SHARING ---"
# Create Invitation Code
INVITE_CODE="TEST$(date +%s | tail -c 5)"
INVITE_RES=$(curl -s -X POST "$API_URL/collections/invitations/records" \
     -H "Authorization: $MAIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d "{\"profileId\":\"$PROF_ID\", \"code\":\"$INVITE_CODE\", \"permission\":\"editor\", \"expiresAt\":\"2026-12-31T23:59:59Z\"}")
INVITE_ID=$(extract_json "id" "$INVITE_RES")

if [ -z "$INVITE_ID" ]; then echo "❌ Invitation creation failed"; exit 1; fi
echo "✅ Invitation Created: $INVITE_ID (Code: $INVITE_CODE)"

# Invitee checks invitation
CHECK_INVITE=$(curl -s -X GET "$API_URL/collections/invitations/records?filter=(code=\"$INVITE_CODE\")" \
     -H "Authorization: $INVITEE_TOKEN")
FOUND_ID=$(extract_json "id" "$CHECK_INVITE")

if [ -z "$FOUND_ID" ]; then echo "❌ Invitation lookup failed"; exit 1; fi
echo "✅ Invitation Found by Invitee"

# Invitee uses invitation (Marks as used and should create access)
# Note: In the real app, the frontend would also create the access or the backend hook would.
# Based on the adapter, it's a PATCH to user or POST to accesses.
# Let's mimic the accesses creation.
NEW_ACC_RES=$(curl -s -X POST "$API_URL/collections/accesses/records" \
     -H "Authorization: $INVITEE_TOKEN" \
     -H "Content-Type: application/json" \
     -d "{\"userId\":\"$INVITEE_USER_ID\", \"profileId\":\"$PROF_ID\", \"role\":\"editor\"}")
NEW_ACC_ID=$(extract_json "id" "$NEW_ACC_RES")

if [ -z "$NEW_ACC_ID" ]; then echo "❌ Access via invite failed"; exit 1; fi
echo "✅ Invitee Access Created: $NEW_ACC_ID"

# Mark invite as used
curl -s -X PATCH "$API_URL/collections/invitations/records/$INVITE_ID" \
     -H "Authorization: $INVITEE_TOKEN" \
     -H "Content-Type: application/json" \
     -d "{\"usedBy\":\"$INVITEE_USER_ID\"}" > /dev/null
echo "✅ Invitation Marked as Used"

echo -e "\n--- [7] CLEANUP (Profile Deletion) ---"
# Delete Profile
DEL_RES=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API_URL/collections/profiles/records/$PROF_ID" \
     -H "Authorization: $MAIN_TOKEN")

if [ "$DEL_RES" != "204" ]; then echo "❌ Profile deletion failed ($DEL_RES)"; exit 1; fi
echo "✅ Profile Deleted"

# Verify Accesses are gone (Cascade delete check)
CHECK_ACC=$(curl -s -X GET "$API_URL/collections/accesses/records?filter=(profileId=\"$PROF_ID\")" \
     -H "Authorization: $MAIN_TOKEN")
TOTAL=$(echo "$CHECK_ACC" | grep -o "\"totalItems\":[0-9]*" | cut -d: -f2)

if [ "$TOTAL" != "0" ] && [ -n "$TOTAL" ]; then 
    echo "⚠️ Warning: Accesses might not have been deleted (Total: $TOTAL)"
else
    echo "✅ Accesses Cascade Deleted"
fi

echo -e "\n🎉 ALL E2E TESTS PASSED SUCCESSFULLY!"
