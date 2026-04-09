FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY index.js ./

ENV NODE_ENV=production
ENV PUSH_PORT=3001

EXPOSE 3001

CMD ["node", "index.js"]
