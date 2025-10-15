#!/bin/sh
set -e

# Cloud Run injeta PORT para o Nginx (porta pública)
# Backend usa porta fixa 3001 (interna)
NGINX_PORT=${PORT:-80}
BACKEND_PORT=3001

echo "================================"
echo "🚀 Starting PDF Processor v2.1.0"
echo "================================"
echo "Nginx Port: $NGINX_PORT"
echo "Backend Port: $BACKEND_PORT"
echo ""

# Função para verificar se um serviço está respondendo
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=15
    local attempt=1

    echo "⏳ Waiting for $name to be ready..."

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo "✅ $name is ready!"
            return 0
        fi

        echo "   Attempt $attempt/$max_attempts..."
        sleep 1
        attempt=$((attempt + 1))
    done

    echo "❌ $name failed to start after $max_attempts attempts"
    return 1
}

# ============================================
# 1. Configurar e Iniciar Nginx
# ============================================
echo "📝 Configuring Nginx for port $NGINX_PORT..."

# Processar template do nginx.conf com envsubst
export PORT=$NGINX_PORT
envsubst '${PORT}' < /etc/nginx/http.d/default.conf.template > /etc/nginx/http.d/default.conf

echo "📡 Starting Nginx on port $NGINX_PORT..."
nginx -t && nginx || {
    echo "❌ Nginx configuration test failed"
    cat /etc/nginx/http.d/default.conf
    exit 1
}
echo "✅ Nginx started on port $NGINX_PORT"
echo ""

# ============================================
# 2. Iniciar Backend
# ============================================
echo "⚙️  Starting Backend (Node.js) on port $BACKEND_PORT..."
cd /app/backend

# Verificar se os arquivos existem
if [ ! -f "dist/index.js" ]; then
    echo "❌ Backend build not found at dist/index.js"
    exit 1
fi

# Iniciar o backend em background com PORT=3001
PORT=$BACKEND_PORT node dist/index.js &
BACKEND_PID=$!

echo "   Backend PID: $BACKEND_PID"
echo "✅ Backend started on port $BACKEND_PORT"
echo ""

# ============================================
# 3. Aguardar serviços ficarem prontos
# ============================================
echo "🔍 Checking services health..."
echo ""

# Aguardar backend estar pronto
if ! wait_for_service "http://localhost:$BACKEND_PORT/health" "Backend API"; then
    echo "❌ Backend health check failed"
    echo "📋 Checking backend logs:"
    ps aux | grep node
    exit 1
fi

echo ""

# Aguardar frontend estar acessível via nginx
if ! wait_for_service "http://localhost:$NGINX_PORT/" "Frontend (Nginx)"; then
    echo "❌ Frontend health check failed"
    echo "📋 Nginx status:"
    nginx -t
    exit 1
fi

echo ""

# ============================================
# 4. Mostrar informações
# ============================================
echo "================================"
echo "✅ All services are running!"
echo "================================"
echo ""
echo "📊 Service Information:"
echo "   Frontend:  http://localhost:$NGINX_PORT"
echo "   Backend:   http://localhost:$BACKEND_PORT"
echo "   Health:    http://localhost:$NGINX_PORT/health"
echo ""
echo "🐳 Container is ready to accept connections"
echo "   Public Port: $NGINX_PORT (Nginx)"
echo "   Backend Port: $BACKEND_PORT (Node.js)"
echo ""
echo "================================"
echo "📋 Logs:"
echo "================================"
echo ""

# ============================================
# 5. Seguir logs e manter container rodando
# ============================================

# Criar função para cleanup
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."

    # Parar backend
    if [ ! -z "$BACKEND_PID" ]; then
        echo "   Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
    fi

    # Parar nginx
    echo "   Stopping nginx..."
    nginx -s quit 2>/dev/null || true

    echo "✅ Shutdown complete"
    exit 0
}

# Registrar handler para sinais
trap cleanup SIGTERM SIGINT SIGQUIT

# Seguir logs do nginx (e manter container rodando)
tail -f /var/log/nginx/access.log &

# Aguardar o backend terminar (mantém container rodando)
wait $BACKEND_PID
