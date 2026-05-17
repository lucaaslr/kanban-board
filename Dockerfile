# Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY server ./server
COPY tsconfig.server.json ./

# Data directory for the JSON database
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["npx", "tsx", "server/index.ts"]
