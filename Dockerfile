# ============================================
# PDF Processor - Multi-Stage Dockerfile
# ============================================
# Build completo do projeto em uma única imagem
# Frontend (React) + Backend (Node.js + Express)
# SEM NGINX - Node.js serve frontend e backend
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
# Stage 3: Imagem Final (Node.js Only)
# ============================================
FROM node:20-alpine

LABEL maintainer="seu-email@example.com"
LABEL description="PDF Processor - Processamento em lote de PDFs"
LABEL version="2.2.0"

# Instalar apenas curl para health checks
RUN apk add --no-cache curl

# Criar diretórios
RUN mkdir -p /app/backend

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
# Copiar build do frontend para ser servido pelo Node.js
COPY --from=frontend-builder /app/frontend/dist ./public

# ============================================
# Configurar Variáveis de Ambiente
# ============================================
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

# ============================================
# Expor Porta
# ============================================
# Porta dinâmica (Cloud Run usa $PORT, padrão 3001)
EXPOSE 3001

# ============================================
# Health Check
# ============================================
# Health check na porta que o Node.js está escutando
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3001}/health || exit 1

# ============================================
# Start Application
# ============================================
CMD ["node", "dist/index.js"]
