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
RUN npm run install
