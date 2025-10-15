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
RUN npm install

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
RUN npm install

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

# Instalar nginx, curl e gettext (para envsubst)
RUN apk add --no-cache nginx curl gettext

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

# Configurar nginx com arquivo template (processado por envsubst em runtime)
COPY nginx.conf /etc/nginx/http.d/default.conf.template

# ============================================
# Configurar Variáveis de Ambiente
# ============================================
ENV NODE_ENV=production
ENV BACKEND_PORT=3001

# ============================================
# Expor Portas
# ============================================
# Porta dinâmica (Cloud Run usa $PORT, padrão 80)
# Backend sempre em 3001
EXPOSE 80 3001

# ============================================
# Health Check
# ============================================
# Health check usa a porta padrão 80 (Cloud Run injeta PORT no runtime)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# ============================================
# Startup Script
# ============================================
# Copiar script de inicialização
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# ============================================
# Start Application
# ============================================
CMD ["/app/start.sh"]
