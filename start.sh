#!/bin/sh
set -e

# Cloud Run e outros ambientes podem definir PORT
PORT=${PORT:-80}

echo "================================"
echo "🚀 Starting PDF Processor v2.1.0"
echo "================================"
echo "Port: $PORT"
echo ""

# Função para verificar se um serviço está respondendo
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=1

    echo "⏳ Waiting for $name to be ready..."

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo "✅ $name is ready!"
            return 0
        fi

        echo "   Attempt $attempt/$max_attempts..."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo "❌ $name failed to start after $max_attempts attempts"
    return 1
}

# ============================================
# 1. Configurar e Iniciar Nginx
# ============================================
echo "📝 Configuring Nginx for port $PORT..."

# Processar template do nginx.conf com envsubst
export PORT
envsubst '${PORT}' < /etc/nginx/http.d/default.conf.template > /etc/nginx/http.d/default.conf

echo "📡 Starting Nginx on port $PORT..."
nginx -t && nginx || {
    echo "❌ Nginx configuration test failed"
    cat /etc/nginx/http.d/default.conf
    exit 1
}
echo "✅ Nginx started on port $PORT"
echo ""

# ============================================
# 2. Iniciar Backend
# ============================================
echo "⚙️  Starting Backend (Node.js)..."
cd /app/backend

# Verificar se os arquivos existem
if [ ! -f "dist/index.js" ]; then
    echo "❌ Backend build not found at dist/index.js"
    exit 1
fi

# Iniciar o backend em background
node dist/index.js &
BACKEND_PID=$!

echo "   Backend PID: $BACKEND_PID"
echo "✅ Backend started"
echo ""

# ============================================
# 3. Aguardar serviços ficarem prontos
# ============================================
echo "🔍 Checking services health..."
echo ""

# Aguardar backend estar pronto
if ! wait_for_service "http://localhost:3001/health" "Backend API"; then
    echo "❌ Backend health check failed"
    echo "📋 Checking backend logs:"
    ps aux | grep node
    exit 1
fi

echo ""

# Aguardar frontend estar acessível via nginx
if ! wait_for_service "http://localhost:$PORT/" "Frontend (Nginx)"; then
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
echo "   Frontend:  http://localhost:$PORT"
echo "   Backend:   http://localhost:3001"
echo "   Health:    http://localhost:$PORT/health"
echo ""
echo "🐳 Container is ready to accept connections"
echo "   Listening on port: $PORT"
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
