# --- Build Stage (Angular) ---
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copy package files and install dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Copy frontend source and build
COPY frontend/ .
RUN npm run build -- --configuration production

# --- Production Stage (PocketBase) ---
FROM elestio/pocketbase:latest

# Working directory inside the container
WORKDIR /srv

# Copy built frontend to the public directory
COPY --from=build-stage /app/dist/app/browser /srv/pb_public

# Copy backend files (hooks, migrations, schema)
COPY backend/pb_hooks /srv/pb_hooks
COPY backend/pb_migrations /srv/pb_migrations
COPY backend/schema.json /srv/schema.json

# Expose the default PocketBase port
EXPOSE 8090

# Persistence should be handled via volumes in docker-compose for /srv/pb_data
VOLUME /srv/pb_data

# The elestio image already has an entrypoint or default command,
# but we specify what we need for our structure.
ENTRYPOINT ["/usr/local/bin/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/srv/pb_data", "--publicDir=/srv/pb_public", "--hooksDir=/srv/pb_hooks", "--migrationsDir=/srv/pb_migrations"]
