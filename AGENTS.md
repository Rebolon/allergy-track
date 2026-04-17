# AGENTS.md

## Maintenance du Modèle de Données
- **IMPORTANT** : Toute modification apportée aux collections PocketBase (champs, relations, règles) DOIT être systématiquement répercutée dans le fichier [MCD.md](file:///home/brichard/apps-demo/allergy-track/MCD.md) via un diagramme Mermaid à jour.
- **VALIDATION OBLIGATOIRE** : Après toute modification du backend (migrations, hooks, schéma), tu DOIS impérativement tester que le conteneur démarre sans erreur. Utilise `task start` ou `task test-docker` et vérifie les logs pour t'assurer qu'aucune migration ne plante (ex: `ReferenceError`).
- **PARITÉ DES ADAPTATEURS** : Tout changement dans la structure de la base de données (PocketBase) DOIT être répercuté à la fois sur l'adaptateur `PocketBase` ET sur l'adaptateur `LocalStorage` (Mock) pour garantir une expérience identique dans les deux modes.

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

## Angular Guidelines (v21+)

- **Standalone** : All components, directives, and pipes must be `standalone: true`. Modules are forbidden.
- **Signals** : Use Signals for state management and UI-bound data. Use `signal()`, `computed()`, and `effect()`. Prefer Signal inputs/outputs over traditional `@Input()`/`@Output()`. Use effect only if there is no other way to achieve the desired result.
- **Dependency Injection** : Use the `inject()` function for and services instead of constructor injection.
- **Components** : Use `changeDetection: ChangeDetectionStrategy.OnPush` by default.
- **Styles** : Use TailwindCSS v4 features. Components should use `styleUrl` or `styles: [...]` (prefer CSS-only Tailwind).
- **Control Flow** : Use the new `@if`, `@for`, `@switch` syntax.
- **Guards & Interceptors** : Use functional forms exclusively.
- **Asynchrony** : Do not use `async`/`await` except in `Adapter` type classes. Prefer RxJS (Observables) and Signals for state and data flow.
- **API** : Prefer the Angular `HttpClient` for all external service communication.
- **Logic Separation** : Les composants ne doivent agir que sur l'UI. Tout code métier ou formulaire doit être externalisé dans des fichiers de service ou de form.

## PocketBase Migrations & API

- **Version** : v0.36+
- **Core API** : Use `$app` (global) or `app` (argument) instead of the deprecated `Dao` global.
- **Collections** : Access fields via `collection.fields` (array) instead of `collection.schema`.
- **Saving** : Use `app.save(collection)` or `app.save(record)` instead of `saveCollection` or `saveRecord`.
- **Fields** : Use typed constructors like `new TextField()`, `new SelectField()`, `new RelationField()`, etc., and `push()` them into `collection.fields`.
- **Environment** : Access variables via `$os.getenv("VAR")` instead of `process.env`.
- Migrations are JS files in `pb_migrations/` (timestamped filename). Schema reference is in `schema.json`. To add a new collection: write a migration JS file + optionally update `schema.json` for documentation.
