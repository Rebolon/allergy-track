# AGENTS.md

## Commands

```bash
# Install deps
task install          # npm ci in frontend/

# Build & run
task build           # generates version.ts then ng build
task start           # docker compose up -d (PocketBase + Angular)
task restart         # stop + start
task upsert-admin    # creates/updates PocketBase superuser (admin@allergy-track.local / admin123456)
task reset-db        # destroys pb_data volume and restarts

# Frontend (requires PocketBase running separately via task start)
cd frontend && npm start          # Angular dev server with HMR on :4200, proxies /api to :8090
cd frontend && npm run dev        # same but port 3000, host 0.0.0.0
cd frontend && npm test           # vitest via Angular test runner
cd frontend && npm run lint       # angular-eslint

# Docker
task test-docker     # build, start, healthcheck, stop
task update          # git pull + docker compose up --build (Synology deploy)
```

## Build & Version

- `task build` auto-generates `frontend/src/environments/version.ts` (buildDate + git hash) before calling `ng build`.
- The Dockerfile injects the same via `BUILD_DATE`/`GIT_HASH` build args — do not edit version.ts in the Dockerfile manually.

## Architecture

- **Single container** runs PocketBase, which serves both the REST API and the Angular static bundle (`/srv/pb_public`).
- **Backend** = PocketBase: `pb_hooks/*.pb.js`, `pb_migrations/*.js`, `schema.json`.
- **Frontend** = Angular 21, standalone components, Signals + RxJS, TailwindCSS v4 (no config file — CSS-only).

## Key Constraints

- `intakes` and `treatments` in `daily_logs` must be **non-empty arrays** (enforced by `pb_hooks/validate_daily_logs.pb.js`). `symptoms` must be an array (can be empty).
- PocketBase runs on port **8090**. Angular dev proxy forwards `/api` and `/_`.
- All PocketBase data lives in Docker named volume `pb_data` (not on host filesystem).
- Production builds: `outputHashing: all` — assets have content hashes.

## Style

- Angular component prefix: `app` (kebab-case elements, camelCase attributes).
- ESLint uses flat config (`eslint.config.js`).
- TypeScript strict mode (`strict: true`, `noImplicitOverride`, `strictTemplates`).
- Tests: vitest globals via `tsconfig.spec.json`.

## PocketBase Migrations

Migrations are JS files in `pb_migrations/` (timestamped filename). Schema reference is in `schema.json`. To add a new collection: write a migration JS file + optionally update `schema.json` for documentation.
