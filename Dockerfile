# ============================================================
# OASIS Frontend – Multi-stage Dockerfile (Nginx Production)
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Vite incrusta estas URLs al compilar. En el compose todo va por el mismo origen (nginx reenvía /api, /socket.io, /uploads y /media).
ARG VITE_API_URL=http://localhost
ARG VITE_MEDIA_API_URL=http://localhost/media
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_API_URL=$VITE_API_URL VITE_MEDIA_API_URL=$VITE_MEDIA_API_URL VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
RUN npm run build

# ============================================================
# Servidor Web Nginx
# ============================================================
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
