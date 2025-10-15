# 🐳 Guia de Build Docker - PDF Processor

## 📋 Visão Geral

Este projeto agora tem um **Dockerfile unificado** que constrói frontend e backend em uma única imagem!

**Vantagens:**
- ✅ Uma única imagem com tudo incluído
- ✅ Build multi-stage otimizado
- ✅ Frontend + Backend juntos
- ✅ Nginx integrado
- ✅ Health check automático
- ✅ Pronto para produção

---

## 🚀 Quick Start

### Opção 1: Script Automático (Recomendado)

**Windows:**
```bash
build-docker.bat
```

**Linux/Mac:**
```bash
./build-docker.sh
```

### Opção 2: Comando Manual

```bash
docker build -t pdf-processor:latest .
```

---

## 📦 Build da Imagem

### Build Básico

```bash
# Build simples
docker build -t pdf-processor:latest .

# Build com tag de versão
docker build -t pdf-processor:v2.1.0 .

# Build com múltiplas tags
docker build -t pdf-processor:latest -t pdf-processor:v2.1.0 .
```

### Build com Opções

```bash
# Build sem cache (útil para troubleshooting)
docker build --no-cache -t pdf-processor:latest .

# Build com progress detalhado
docker build --progress=plain -t pdf-processor:latest .

# Build com labels
docker build \
  --tag pdf-processor:latest \
  --label "version=2.1.0" \
  --label "description=PDF Processor" \
  .
```

---

## 🏃 Executar a Imagem

### Execução Simples

```bash
# Executar e mapear porta 80
docker run -d -p 80:80 --name pdf-processor pdf-processor:latest

# Acessar em: http://localhost
```

### Execução com Configurações

```bash
# Com variáveis de ambiente
docker run -d \
  -p 80:80 \
  -e NODE_ENV=production \
  -e NODE_OPTIONS="--max-old-space-size=8192" \
  --name pdf-processor \
  pdf-processor:latest

# Com volume para persistência (opcional)
docker run -d \
  -p 80:80 \
  -v pdf-data:/app/data \
  --name pdf-processor \
  pdf-processor:latest

# Com limite de recursos
docker run -d \
  -p 80:80 \
  --memory="2g" \
  --cpus="2" \
  --name pdf-processor \
  pdf-processor:latest
```

---

## 🔍 Gerenciamento do Container

### Comandos Úteis

```bash
# Ver logs
docker logs -f pdf-processor

# Ver logs das últimas 100 linhas
docker logs --tail 100 pdf-processor

# Entrar no container
docker exec -it pdf-processor sh

# Ver estatísticas de uso
docker stats pdf-processor

# Inspecionar container
docker inspect pdf-processor

# Parar container
docker stop pdf-processor

# Iniciar container
docker start pdf-processor

# Reiniciar container
docker restart pdf-processor

# Remover container
docker rm -f pdf-processor
```

### Health Check

```bash
# Verificar health status
docker inspect --format='{{.State.Health.Status}}' pdf-processor

# Ver histórico de health checks
docker inspect --format='{{json .State.Health}}' pdf-processor | jq
```

---

## 🏗️ Arquitetura Multi-Stage

### Stages do Build

O Dockerfile usa **3 stages**:

#### 1. **Frontend Builder**
```dockerfile
FROM node:20-alpine AS frontend-builder
```
- Build do React com Vite
- Output: `/app/frontend/dist`

#### 2. **Backend Builder**
```dockerfile
FROM node:20-alpine AS backend-builder
```
- Compilação do TypeScript
- Output: `/app/backend/dist`

#### 3. **Final Image**
```dockerfile
FROM node:20-alpine
```
- Nginx para servir frontend
- Node.js para executar backend
- Apenas arquivos de produção

**Resultado:**
- ✅ Imagem final menor (~200MB)
- ✅ Sem dependências de dev
- ✅ Tudo otimizado

---

## 📊 Informações da Imagem

### Ver Tamanho

```bash
# Tamanho da imagem
docker images pdf-processor:latest

# Detalhes do build
docker history pdf-processor:latest

# Análise de camadas
docker image inspect pdf-processor:latest
```

### Esperado

```
REPOSITORY       TAG      SIZE
pdf-processor    latest   ~200MB
```

**Comparação:**
- Docker Compose (2 imagens): ~400MB
- Dockerfile único: ~200MB
- **Economia:** 50%!

---

## 🚀 Push para Docker Hub (Opcional)

### 1. Login

```bash
docker login
# Digite username e password/token
```

### 2. Tag com Username

```bash
# Substitua SEU_USUARIO
docker tag pdf-processor:latest SEU_USUARIO/pdf-processor:latest
docker tag pdf-processor:latest SEU_USUARIO/pdf-processor:v2.1.0
```

### 3. Push

```bash
docker push SEU_USUARIO/pdf-processor:latest
docker push SEU_USUARIO/pdf-processor:v2.1.0
```

### 4. Pull (de qualquer lugar)

```bash
docker pull SEU_USUARIO/pdf-processor:latest
docker run -d -p 80:80 SEU_USUARIO/pdf-processor:latest
```

---

## 🔧 Troubleshooting

### Build Falha

**Erro: "npm ci failed"**
```bash
# Limpar cache do Docker
docker builder prune

# Build sem cache
docker build --no-cache -t pdf-processor:latest .
```

**Erro: "sharp installation failed"**
```bash
# O Dockerfile já instala as dependências necessárias
# Se persistir, verifique se está usando node:20-alpine
```

### Container não Inicia

**Ver logs:**
```bash
docker logs pdf-processor
```

**Verificar portas:**
```bash
# Porta 80 já em uso?
netstat -ano | findstr :80

# Use outra porta
docker run -d -p 8080:80 --name pdf-processor pdf-processor:latest
```

### Performance Lenta

**Aumentar recursos:**
```bash
docker run -d \
  -p 80:80 \
  --memory="4g" \
  --cpus="4" \
  -e NODE_OPTIONS="--max-old-space-size=8192" \
  --name pdf-processor \
  pdf-processor:latest
```

---

## 🧪 Testar a Imagem

### 1. Build

```bash
docker build -t pdf-processor:test .
```

### 2. Executar

```bash
docker run -d -p 8080:80 --name pdf-test pdf-processor:test
```

### 3. Testar

```bash
# Health check
curl http://localhost:8080/health

# Frontend
curl http://localhost:8080

# Processar PDF (via interface)
# Abra: http://localhost:8080
```

### 4. Limpar

```bash
docker stop pdf-test
docker rm pdf-test
docker rmi pdf-processor:test
```

---

## 📁 Estrutura da Imagem

```
/app/
├── backend/
│   ├── dist/           # TypeScript compilado
│   ├── node_modules/   # Dependências produção
│   └── package.json
├── start.sh           # Script de inicialização
└── frontend/ (via nginx)
    /usr/share/nginx/html/
    └── dist/          # React build
```

---

## ⚙️ Configurações

### Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `NODE_ENV` | `production` | Ambiente Node.js |
| `PORT` | `3001` | Porta do backend |
| `NODE_OPTIONS` | `--max-old-space-size=4096` | Memória Node.js |

### Portas Expostas

| Porta | Serviço |
|-------|---------|
| `80` | Nginx (Frontend + Proxy) |
| `3001` | Backend API |

### Health Check

- **Intervalo:** 30s
- **Timeout:** 10s
- **Start Period:** 40s
- **Retries:** 3
- **URL:** `http://localhost/health`

---

## 🎯 Comandos Rápidos

```bash
# Build
docker build -t pdf-processor:latest .

# Run
docker run -d -p 80:80 --name pdf-processor pdf-processor:latest

# Logs
docker logs -f pdf-processor

# Stop
docker stop pdf-processor

# Remove
docker rm -f pdf-processor

# Cleanup
docker system prune -a
```

---

## 📊 Comparação: docker-compose vs Dockerfile

| Aspecto | docker-compose | Dockerfile Único |
|---------|----------------|------------------|
| **Imagens** | 2 separadas | 1 unificada |
| **Tamanho** | ~400MB | ~200MB |
| **Complexidade** | Média | Simples |
| **Startup** | 2 containers | 1 container |
| **Networking** | Bridge network | Localhost |
| **Deploy** | docker-compose up | docker run |
| **Produção** | ✅ Bom | ✅ Melhor |

---

## 🚀 Deploy em Produção

### Opção 1: Docker Run Direto

```bash
docker run -d \
  --name pdf-processor \
  --restart unless-stopped \
  -p 80:80 \
  --memory="2g" \
  --cpus="2" \
  pdf-processor:latest
```

### Opção 2: Docker Compose (simples)

```yaml
version: '3.8'
services:
  app:
    image: pdf-processor:latest
    ports:
      - "80:80"
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '2'
```

### Opção 3: Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pdf-processor
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: pdf-processor
        image: pdf-processor:latest
        ports:
        - containerPort: 80
        resources:
          limits:
            memory: "2Gi"
            cpu: "2"
```

---

## ✅ Checklist de Build

- [ ] Docker Desktop rodando
- [ ] Código commitado
- [ ] package.json atualizado
- [ ] Build local testado
- [ ] Script de build executado
- [ ] Imagem testada localmente
- [ ] Health check funcionando
- [ ] (Opcional) Push para Docker Hub
- [ ] Documentação atualizada

---

## 📞 Suporte

Se encontrar problemas:

1. Veja os logs: `docker logs pdf-processor`
2. Teste o health check: `curl http://localhost/health`
3. Verifique recursos: `docker stats`
4. Rebuild sem cache: `docker build --no-cache`

---

**Versão:** 2.1.0
**Última atualização:** 2025-10-15
**Status:** ✅ Pronto para produção
