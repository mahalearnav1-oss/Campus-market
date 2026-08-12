# Multi-stage Production Dockerfile for CampusMarket Frontend
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY shared/package*.json ./shared/

RUN npm ci --workspace=frontend --workspace=shared

COPY frontend/ ./frontend/
COPY shared/ ./shared/

RUN npm run build --workspace=frontend

# Nginx Runner Stage
FROM nginx:alpine AS runner

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
