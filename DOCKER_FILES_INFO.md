# 📁 Arquivos Docker - Documentação

## 📋 Visão Geral

O Dockerfile foi refatorado para usar arquivos de configuração externos, facilitando a manutenção e personalização.

---

## 📂 Estrutura de Arquivos

```
pdf-processor/
├── Dockerfile          # Build multi-stage principal
├── nginx.conf          # Configuração do Nginx
├── start.sh            # Script de inicialização
├── .dockerignore       # Arquivos ignorados no build
└── docker-compose.yml  # Orquestração (opcional)
```

---

## 📄 Arquivo: `Dockerfile`

**Localização:** `./Dockerfile`

### O que faz:
- Build multi-stage (3 stages)
- Frontend: React + Vite
- Backend: Node.js + TypeScript
- Imagem final: ~200MB

### Stages:
1. **frontend-builder**: Build do React
2. **backend-builder**: Build do TypeScript
3. **Final**: Nginx + Node.js + arquivos de produção

### Principais comandos:
```dockerfile
# Instala gettext para suporte a envsubst (substituição de variáveis)
RUN apk add --no-cache nginx curl gettext

# Copia configuração do Nginx como template (processado em runtime)
COPY nginx.conf /etc/nginx/http.d/default.conf.template

# Copia script de inicialização
COPY start.sh /app/start.sh
```

### Suporte a Cloud Run:
- Porta dinâmica via `$PORT` environment variable
- Template nginx.conf processado com envsubst
- Health check usa `${PORT:-80}`
- Compatível com qualquer plataforma cloud

---

## 🌐 Arquivo: `nginx.conf`

**Localização:** `./nginx.conf`

### O que faz:
Configura o Nginx como:
- Servidor web para o frontend
- Proxy reverso para o backend
- Gateway único com porta dinâmica (`${PORT:-80}`)
- Template processado por envsubst no start.sh

### Rotas configuradas:

#### 1. Frontend (`/`)
```nginx
location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
}
```
- Serve arquivos estáticos do React
- SPA fallback para `index.html`
- No-cache headers para HTML

#### 2. Backend API (`/api/`)
```nginx
location /api/ {
    proxy_pass http://localhost:3001/api/;
    client_max_body_size 100M;
    # ... timeouts otimizados
}
```
- Proxy para `http://localhost:3001`
- Upload de até 100MB (PDFs grandes)
- Timeouts de 600s (10 min)

#### 3. Health Check (`/health`)
```nginx
location /health {
    proxy_pass http://localhost:3001/health;
    access_log off;
}
```
- Verifica saúde do backend
- Não gera logs (menos ruído)

### Personalizar:

**Mudar tamanho máximo de upload:**
```nginx
client_max_body_size 200M;  # Padrão: 100M
```

**Mudar timeouts:**
```nginx
proxy_read_timeout 1200;  # Padrão: 600s
```

**Adicionar CORS:**
```nginx
add_header Access-Control-Allow-Origin *;
```

---

## 🚀 Arquivo: `start.sh`

**Localização:** `./start.sh`

### O que faz:
Script de inicialização que:
1. Inicia o Nginx
2. Inicia o Backend (Node.js)
3. Aguarda serviços ficarem prontos
4. Faz health checks
5. Exibe logs em tempo real

### Fluxo de execução:

```
┌─────────────────────┐
│  1. Iniciar Nginx   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 2. Iniciar Backend  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 3. Wait for Service │ ← Retry 30x
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  4. Health Checks   │ ← Backend + Frontend
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   5. Show Logs      │ ← tail -f logs
└─────────────────────┘
```

### Features:

#### 0. Suporte a Porta Dinâmica (Cloud Run)
```bash
# Cloud Run e outros ambientes podem definir PORT
PORT=${PORT:-80}

# Processar template do nginx.conf com envsubst
export PORT
envsubst '${PORT}' < /etc/nginx/http.d/default.conf.template > /etc/nginx/http.d/default.conf
```
- Aceita `$PORT` do ambiente (Cloud Run, Heroku, etc.)
- Fallback para porta 80 se não definida
- Gera nginx.conf final em runtime

#### 1. Health Checks Automáticos
```bash
wait_for_service "http://localhost:3001/health" "Backend API"
```
- Tenta 30x com intervalo de 2s
- Total: 60 segundos de espera
- Falha se não responder

#### 2. Graceful Shutdown
```bash
trap cleanup SIGTERM SIGINT SIGQUIT
```
- Captura sinais de parada
- Para serviços ordenadamente
- Nginx → quit (graceful)
- Backend → kill PID

#### 3. Logs Formatados
```
================================
🚀 Starting PDF Processor v2.1.0
================================

📡 Starting Nginx...
✅ Nginx started

⚙️  Starting Backend (Node.js)...
   Backend PID: 123
✅ Backend started

⏳ Waiting for Backend API to be ready...
✅ Backend API is ready!

⏳ Waiting for Frontend (Nginx) to be ready...
✅ Frontend (Nginx) is ready!

================================
✅ All services are running!
================================
```

### Personalizar:

**Mudar retry attempts:**
```bash
local max_attempts=60  # Padrão: 30
```

**Mudar sleep interval:**
```bash
sleep 5  # Padrão: 2
```

**Adicionar mais checks:**
```bash
wait_for_service "http://localhost:3001/api/another" "Another API"
```

---

## 🔧 Editar Configurações

### Método 1: Editar Arquivo Localmente

```bash
# Editar nginx.conf
vim nginx.conf

# Rebuild imagem
docker build -t pdf-processor:latest .

# Testar
docker run -d -p 80:80 pdf-processor:latest
```

### Método 2: Override com Volume (Desenvolvimento)

```bash
# Criar arquivo customizado
cp nginx.conf nginx.custom.conf
# ... editar nginx.custom.conf

# Montar como volume
docker run -d \
  -p 80:80 \
  -v $(pwd)/nginx.custom.conf:/etc/nginx/http.d/default.conf \
  pdf-processor:latest
```

### Método 3: Dockerfile Customizado

```dockerfile
# Dockerfile.custom
FROM pdf-processor:latest

# Substituir configurações
COPY my-nginx.conf /etc/nginx/http.d/default.conf
COPY my-start.sh /app/start.sh
RUN chmod +x /app/start.sh
```

---

## 🐛 Debug

### Ver logs do Nginx

```bash
# Dentro do container
docker exec -it pdf-processor cat /var/log/nginx/error.log
docker exec -it pdf-processor cat /var/log/nginx/access.log
```

### Testar configuração do Nginx

```bash
docker exec -it pdf-processor nginx -t
```

### Ver processo do Backend

```bash
docker exec -it pdf-processor ps aux | grep node
```

### Entrar no container

```bash
docker exec -it pdf-processor sh
```

---

## 📊 Comparação: Antes vs Depois

### Antes (Inline)

```dockerfile
COPY <<EOF /etc/nginx/http.d/default.conf
server {
    listen 80;
    # ... 30 linhas de configuração
}
EOF

COPY <<'EOF' /app/start.sh
#!/bin/sh
# ... 40 linhas de script
EOF
```

**Problemas:**
- ❌ Difícil de editar
- ❌ Syntax highlighting ruim
- ❌ Não versionável separadamente
- ❌ Difícil de testar isoladamente

### Depois (Arquivos Externos)

```dockerfile
COPY nginx.conf /etc/nginx/http.d/default.conf
COPY start.sh /app/start.sh
```

**Benefícios:**
- ✅ Fácil de editar
- ✅ Syntax highlighting completo
- ✅ Versionamento independente
- ✅ Testes isolados
- ✅ Reutilizável em outros projetos

---

## 🎯 Casos de Uso

### 1. Mudar Porta do Backend

**Edite `nginx.conf`:**
```nginx
proxy_pass http://localhost:3002/api/;  # Era 3001
```

**Edite `start.sh`:**
```bash
export PORT=3002  # Adicionar antes de iniciar backend
```

**Rebuild:**
```bash
docker build -t pdf-processor:latest .
```

---

### 2. Adicionar HTTPS

**Edite `nginx.conf`:**
```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... resto da configuração
}
```

**Edite `Dockerfile`:**
```dockerfile
COPY ssl/ /etc/nginx/ssl/
```

---

### 3. Adicionar Mais Endpoints

**Edite `nginx.conf`:**
```nginx
location /admin/ {
    proxy_pass http://localhost:3002/;
}
```

---

## ✅ Checklist de Build

Após editar os arquivos:

- [ ] `nginx.conf` - Configuração válida
  ```bash
  nginx -t -c nginx.conf
  ```

- [ ] `start.sh` - Executável e sem erros de sintaxe
  ```bash
  chmod +x start.sh
  shellcheck start.sh  # Opcional
  ```

- [ ] `Dockerfile` - Build sem erros
  ```bash
  docker build -t pdf-processor:test .
  ```

- [ ] Testar imagem
  ```bash
  docker run -d -p 8080:80 pdf-processor:test
  curl http://localhost:8080/health
  ```

---

## 📚 Recursos

- [Nginx Docs](https://nginx.org/en/docs/)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Shell Scripting Best Practices](https://google.github.io/styleguide/shellguide.html)

---

**Versão:** 2.1.0
**Última atualização:** 2025-10-15
