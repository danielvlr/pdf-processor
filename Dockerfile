# ============================================
# PDF Processor - Multi-Stage Dockerfile
# ============================================
# Build completo do projeto em uma única imagem
# Frontend (React) + Backend (Node.js + Express)
# ============================================

# ============================================
# Stage 1: Build do Frontend
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copiar package files
COPY frontend/package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY frontend/ ./

# Build do frontend
RUN npm run build

# ============================================
# Stage 2: Build do Backend
# ============================================
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Instalar dependências de compilação para sharp
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

# Copiar package files
COPY backend/package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY backend/ ./

# Build do TypeScript
RUN npm run build

# ============================================
# Stage 3: Imagem Final (Multi-Service)
# ============================================
FROM node:20-alpine

LABEL maintainer="seu-email@example.com"
LABEL description="PDF Processor - Processamento em lote de PDFs"
LABEL version="2.1.0"

# Instalar nginx para servir frontend
RUN apk add --no-cache nginx

# Criar diretórios
RUN mkdir -p /app/backend /app/frontend /run/nginx /var/log/nginx

# ============================================
# Configurar Backend
# ============================================
WORKDIR /app/backend

# Instalar dependências runtime do sharp
RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    giflib

# Copiar do stage de build do backend
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package*.json ./

# ============================================
# Configurar Frontend
# ============================================
# Copiar build do frontend
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Configurar nginx
COPY <<EOF /etc/nginx/http.d/default.conf
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /usr/share/nginx/html;
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        client_max_body_size 100M;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }
}
EOF

# ============================================
# Configurar Variáveis de Ambiente
# ============================================
ENV NODE_ENV=production
ENV PORT=3001
ENV NODE_OPTIONS="--max-old-space-size=4096"

# ============================================
# Expor Portas
# ============================================
EXPOSE 80 3001

# ============================================
# Health Check
# ============================================
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# ============================================
# Startup Script
# ============================================
COPY <<'EOF' /app/start.sh
#!/bin/sh
set -e

echo "🚀 Starting PDF Processor..."

# Start nginx
echo "📡 Starting nginx..."
nginx

# Start backend
echo "⚙️  Starting backend..."
cd /app/backend
node dist/index.js &

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are running
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Services are ready!"
else
    echo "❌ Services failed to start"
    exit 1
fi

# Keep container running and show logs
echo "📊 Application running. Logs:"
tail -f /var/log/nginx/access.log
EOF

RUN chmod +x /app/start.sh

# ============================================
# Start Application
# ============================================
CMD ["/app/start.sh"]
