# Multi-stage Production Dockerfile for CampusMarket Backend API
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root monorepo files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm ci --workspace=backend --workspace=shared

# Copy source code
COPY backend/ ./backend/
COPY shared/ ./shared/

# Build backend and generate Prisma Client
RUN npm run prisma:generate --workspace=backend
RUN npm run build --workspace=backend

# Production Image Stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

EXPOSE 5000

CMD ["node", "backend/dist/server.js"]
