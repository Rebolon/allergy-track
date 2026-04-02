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

# Copy built frontend to the public directory
# Note: check if output is dist/app/browser or dist/app
COPY --from=build-stage /app/dist/app/browser /pb_public

# Copy backend files (hooks, migrations, schema)
COPY backend/pb_hooks /pb_hooks
COPY backend/pb_migrations /pb_migrations
COPY backend/schema.json /pb_schema.json

# Expose the default PocketBase port
EXPOSE 8090

# Persistence should be handled via volumes in docker-compose for /pb_data
VOLUME /pb_data

# The elestio image already has an entrypoint or default command,
# but we specify what we need for our structure.
ENTRYPOINT ["/usr/local/bin/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb_data", "--publicDir=/pb_public", "--hooksDir=/pb_hooks", "--migrationsDir=/pb_migrations"]
