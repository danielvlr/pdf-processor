# 🚀 Como Usar o Docker - PDF Processor

## ⚡ Quick Start (2 Comandos)

```bash
# 1. Build da imagem
./build-docker.sh

# 2. Executar
docker run -d -p 80:80 --name pdf-processor pdf-processor:latest

# 3. Acessar
# http://localhost
```

**Pronto!** Em menos de 5 minutos você tem tudo rodando! 🎉

---

## 🐳 Opções de Build

### Opção 1: Script Automático (Mais Fácil) ⭐

**Windows:**
```bash
build-docker.bat
```

**Linux/Mac:**
```bash
./build-docker.sh
```

**O que o script faz:**
- ✅ Verifica se Docker está rodando
- ✅ Build da imagem com tags
- ✅ Mostra informações da imagem
- ✅ Dá instruções de como usar

---

### Opção 2: Comando Manual

```bash
docker build -t pdf-processor:latest .
```

---

## 🏃 Como Executar

### Execução Básica

```bash
# Executar em background
docker run -d -p 80:80 --name pdf-processor pdf-processor:latest

# Acessar
http://localhost
```

### Com Mais Memória (Para Muitos PDFs)

```bash
docker run -d \
  -p 80:80 \
  --memory="4g" \
  -e NODE_OPTIONS="--max-old-space-size=8192" \
  --name pdf-processor \
  pdf-processor:latest
```

### Com Restart Automático

```bash
docker run -d \
  -p 80:80 \
  --restart unless-stopped \
  --name pdf-processor \
  pdf-processor:latest
```

---

## 🔍 Comandos Úteis

### Ver Logs

```bash
# Ver logs em tempo real
docker logs -f pdf-processor

# Ver últimas 100 linhas
docker logs --tail 100 pdf-processor
```

### Gerenciar Container

```bash
# Parar
docker stop pdf-processor

# Iniciar
docker start pdf-processor

# Reiniciar
docker restart pdf-processor

# Remover
docker rm -f pdf-processor
```

### Ver Status

```bash
# Status do container
docker ps

# Uso de recursos
docker stats pdf-processor

# Health check
docker inspect --format='{{.State.Health.Status}}' pdf-processor
```

---

## 🎯 Cenários Comuns

### Cenário 1: Primeira Vez

```bash
# 1. Build
./build-docker.sh

# 2. Executar
docker run -d -p 80:80 --name pdf-processor pdf-processor:latest

# 3. Testar
curl http://localhost/health

# 4. Usar
# Abra http://localhost no navegador
```

---

### Cenário 2: Atualizar Código

```bash
# 1. Parar container antigo
docker stop pdf-processor
docker rm pdf-processor

# 2. Rebuild
./build-docker.sh

# 3. Executar nova versão
docker run -d -p 80:80 --name pdf-processor pdf-processor:latest
```

---

### Cenário 3: Mudar Porta

```bash
# Usar porta 8080 em vez de 80
docker run -d -p 8080:80 --name pdf-processor pdf-processor:latest

# Acessar em: http://localhost:8080
```

---

### Cenário 4: Desenvolvimento

```bash
# Build com tag de dev
docker build -t pdf-processor:dev .

# Executar em outra porta
docker run -d -p 8080:80 --name pdf-dev pdf-processor:dev

# Logs em tempo real
docker logs -f pdf-dev
```

---

## 📊 Comparação: docker-compose vs Dockerfile

### docker-compose (Antigo)

```bash
# Precisa de 2 comandos
docker-compose build
docker-compose up -d

# 2 containers
# Backend + Frontend separados
```

### Dockerfile Único (Novo) ⭐

```bash
# 1 comando de build
./build-docker.sh

# 1 comando de run
docker run -d -p 80:80 pdf-processor:latest

# 1 container
# Tudo junto, otimizado
```

**Vantagens do Dockerfile único:**
- ✅ 50% menor (200MB vs 400MB)
- ✅ Mais simples de usar
- ✅ Startup mais rápido
- ✅ Ideal para produção

---

## 🚀 Deploy em Produção

### Servidor VPS/Cloud

```bash
# 1. No servidor, instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 2. Copiar projeto
git clone https://github.com/SEU_USUARIO/pdf-processor.git
cd pdf-processor

# 3. Build
./build-docker.sh

# 4. Executar
docker run -d \
  -p 80:80 \
  --restart unless-stopped \
  --memory="2g" \
  --name pdf-processor \
  pdf-processor:latest

# 5. Verificar
curl http://localhost/health
```

---

### Docker Hub

```bash
# 1. Build com seu username
docker build -t SEU_USUARIO/pdf-processor:latest .

# 2. Login
docker login

# 3. Push
docker push SEU_USUARIO/pdf-processor:latest

# 4. Em qualquer servidor
docker pull SEU_USUARIO/pdf-processor:latest
docker run -d -p 80:80 SEU_USUARIO/pdf-processor:latest
```

---

## 🐛 Problemas Comuns

### "Port 80 already in use"

```bash
# Use outra porta
docker run -d -p 8080:80 --name pdf-processor pdf-processor:latest

# Ou descubra o que está usando porta 80
# Windows:
netstat -ano | findstr :80

# Linux:
sudo lsof -i :80
```

---

### "Container keeps restarting"

```bash
# Ver logs para descobrir o problema
docker logs pdf-processor

# Remover e recriar
docker rm -f pdf-processor
docker run -d -p 80:80 --name pdf-processor pdf-processor:latest
```

---

### "Out of memory"

```bash
# Aumentar memória disponível
docker run -d \
  -p 80:80 \
  --memory="4g" \
  -e NODE_OPTIONS="--max-old-space-size=8192" \
  --name pdf-processor \
  pdf-processor:latest
```

---

### "Build failed"

```bash
# Limpar cache do Docker
docker builder prune

# Build novamente sem cache
docker build --no-cache -t pdf-processor:latest .
```

---

## ✅ Checklist

- [ ] Docker Desktop instalado e rodando
- [ ] Código do projeto baixado
- [ ] Build executado com sucesso
- [ ] Container rodando (`docker ps`)
- [ ] Acesso funcionando (http://localhost)
- [ ] Health check OK (`curl http://localhost/health`)
- [ ] PDFs processando corretamente

---

## 📚 Documentação Completa

Para informações detalhadas:
- [DOCKER_BUILD_GUIDE.md](DOCKER_BUILD_GUIDE.md) - Guia completo
- [README.md](README.md) - Documentação geral
- [FIRST_RUN.md](FIRST_RUN.md) - Primeiro uso

---

## 🎯 Comandos de Referência Rápida

```bash
# Build
./build-docker.sh                                              # Script automático
docker build -t pdf-processor:latest .                         # Manual

# Run
docker run -d -p 80:80 --name pdf-processor pdf-processor:latest  # Básico
docker run -d -p 80:80 --restart unless-stopped --name pdf-processor pdf-processor:latest  # Produção

# Gerenciar
docker ps                                                      # Ver containers
docker logs -f pdf-processor                                   # Ver logs
docker stop pdf-processor                                      # Parar
docker start pdf-processor                                     # Iniciar
docker restart pdf-processor                                   # Reiniciar
docker rm -f pdf-processor                                     # Remover

# Info
docker images                                                  # Ver imagens
docker stats pdf-processor                                     # Ver uso de recursos
curl http://localhost/health                                   # Health check

# Cleanup
docker system prune -a                                         # Limpar tudo (cuidado!)
```

---

## 🎉 Pronto!

Agora você sabe como:
- ✅ Build da imagem Docker
- ✅ Executar o container
- ✅ Gerenciar e monitorar
- ✅ Deploy em produção
- ✅ Resolver problemas comuns

**Boa sorte com seu PDF Processor!** 🚀

---

**Versão:** 2.1.0
**Última atualização:** 2025-10-15
