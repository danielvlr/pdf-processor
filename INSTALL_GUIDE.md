# Guia Completo de Instalação

Este guia cobre todas as formas de instalar e executar o PDF Processor.

---

## Índice

1. [Instalação Rápida (Docker)](#instalação-rápida-docker)
2. [Instalação para Desenvolvimento](#instalação-para-desenvolvimento)
3. [Instalação em Produção](#instalação-em-produção)
4. [Verificação da Instalação](#verificação-da-instalação)
5. [Solução de Problemas](#solução-de-problemas)

---

## Instalação Rápida (Docker)

### Pré-requisitos

- Docker 20.10 ou superior
- Docker Compose 2.0 ou superior

### Verificar instalação do Docker

```bash
# Linux/Mac
docker --version
docker-compose --version

# Windows (PowerShell)
docker --version
docker compose version
```

### Passos

#### 1. Baixar/Clonar o projeto

```bash
# Se tiver git
git clone <repository-url>
cd pdf-processor

# OU extrair o ZIP manualmente
```

#### 2. Iniciar os containers

```bash
# Build e start
docker-compose up --build

# OU em modo daemon (background)
docker-compose up -d --build
```

#### 3. Aguardar inicialização

```
Aguarde até ver:
✓ Backend: Server running on port 3001
✓ Frontend: ready in XXX ms
```

#### 4. Acessar aplicação

Abra o navegador em: **http://localhost**

#### 5. Parar containers

```bash
# Ctrl+C se estiver em foreground

# OU se estiver em background
docker-compose down
```

### Comandos Docker Úteis

```bash
# Ver logs
docker-compose logs -f

# Ver logs apenas do backend
docker-compose logs -f backend

# Ver logs apenas do frontend
docker-compose logs -f frontend

# Reiniciar containers
docker-compose restart

# Remover tudo (containers + volumes)
docker-compose down -v

# Rebuild completo
docker-compose build --no-cache
docker-compose up
```

---

## Instalação para Desenvolvimento

### Pré-requisitos

- Node.js 20 ou superior
- npm 10 ou superior
- Git (opcional)

### Verificar instalação

```bash
node --version  # deve ser >= 20
npm --version   # deve ser >= 10
```

### Passos

#### 1. Preparar projeto

```bash
cd pdf-processor
```

#### 2. Instalar dependências

**Opção A: Script automático**

```bash
# Linux/Mac
chmod +x setup.sh
./setup.sh

# Windows
setup.bat
```

**Opção B: Manual**

```bash
# Instalar todas as dependências (workspace)
npm run install:all

# OU instalar manualmente
cd backend
npm install
cd ../frontend
npm install
cd ..
```

#### 3. Configurar ambiente

```bash
cd backend
cp .env.example .env
# Editar .env se necessário
cd ..
```

#### 4. Iniciar em modo desenvolvimento

**Terminal 1 - Backend**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```

**OU usar concurrently (em um único terminal)**
```bash
# Na raiz do projeto
npm run dev
```

#### 5. Acessar aplicação

- Frontend: **http://localhost:3000**
- Backend: **http://localhost:3001**
- Health: **http://localhost:3001/health**

---

## Instalação em Produção

### Opção 1: Docker (Recomendado)

Siga [Instalação Rápida (Docker)](#instalação-rápida-docker)

### Opção 2: Build Manual

#### 1. Instalar dependências

```bash
cd backend
npm ci --only=production
cd ../frontend
npm ci
cd ..
```

#### 2. Build

```bash
# Backend
cd backend
npm run build
cd ..

# Frontend
cd frontend
npm run build
cd ..
```

#### 3. Configurar ambiente

```bash
cd backend
cp .env.example .env
# Editar .env:
# NODE_ENV=production
# PORT=3001
cd ..
```

#### 4. Servir frontend

**Com Nginx:**

```nginx
server {
    listen 80;
    root /caminho/para/pdf-processor/frontend/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        client_max_body_size 100M;
    }
}
```

**OU com serve:**

```bash
npm install -g serve
cd frontend/dist
serve -s . -p 80
```

#### 5. Iniciar backend

```bash
cd backend
npm start
```

#### 6. Process Manager (PM2)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar backend
cd backend
pm2 start dist/index.js --name pdf-backend

# Iniciar frontend (se não usar nginx)
cd ../frontend/dist
pm2 serve . 80 --name pdf-frontend --spa

# Salvar configuração
pm2 save

# Auto-start no boot
pm2 startup
```

---

## Verificação da Instalação

### Verificar Backend

```bash
# Health check
curl http://localhost:3001/health

# Deve retornar:
# {"status":"ok","timestamp":"2025-01-15T..."}
```

### Verificar Frontend

1. Abra http://localhost (Docker) ou http://localhost:3000 (dev)
2. Deve ver a interface de upload
3. Campos devem estar visíveis:
   - Upload ZIP
   - Upload Capa
   - Altura do Rodapé

### Teste Completo

1. Crie um PDF de teste:
   - Abra Word/LibreOffice
   - Digite "Teste"
   - Exporte como PDF (teste.pdf)

2. Crie um ZIP:
   ```bash
   # Linux/Mac
   zip teste.zip teste.pdf

   # Windows
   # Clique direito > Enviar para > Pasta compactada
   ```

3. Prepare uma capa:
   - Use o mesmo teste.pdf como capa

4. No navegador:
   - Upload do teste.zip
   - Upload da capa (teste.pdf)
   - Clique em "Processar PDFs"

5. Verificar:
   - Download automático do processed-pdfs.zip
   - Relatório exibido com sucesso

---

## Solução de Problemas

### Problema: Docker não inicia

**Sintoma:**
```
ERROR: Service 'backend' failed to build
```

**Solução:**
```bash
# Limpar cache
docker system prune -a -f

# Rebuild
docker-compose build --no-cache
docker-compose up
```

---

### Problema: Porta já em uso

**Sintoma:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solução:**

```bash
# Descobrir processo usando a porta
# Linux/Mac
lsof -i :3001
kill -9 <PID>

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# OU mudar porta no .env
PORT=3002
```

---

### Problema: npm install falha

**Sintoma:**
```
npm ERR! code ENOENT
```

**Solução:**

```bash
# Limpar cache npm
npm cache clean --force

# Deletar node_modules e package-lock.json
rm -rf node_modules package-lock.json

# Reinstalar
npm install
```

---

### Problema: Sharp falha ao instalar (Windows)

**Sintoma:**
```
Error: Cannot find module 'sharp'
```

**Solução:**

```bash
# Instalar build tools do Windows
npm install --global windows-build-tools

# OU instalar Visual Studio Build Tools manualmente

# Reinstalar sharp
cd backend
npm rebuild sharp
```

---

### Problema: CORS error

**Sintoma:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solução:**

1. Verifique se backend está rodando
2. Verifique configuração do proxy no `vite.config.ts`:
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost:3001',
       changeOrigin: true,
     },
   }
   ```

---

### Problema: Testes falhando

**Sintoma:**
```
FAIL src/services/__tests__/pdf.service.test.ts
```

**Solução:**

```bash
cd backend

# Limpar cache do Jest
npx jest --clearCache

# Reinstalar dependências
rm -rf node_modules
npm install

# Rodar testes
npm test
```

---

### Problema: Docker build lento

**Solução:**

```bash
# Usar cache do Docker
docker-compose build

# Aumentar memória do Docker
# Docker Desktop > Settings > Resources > Memory: 4GB+
```

---

### Problema: Arquivo .env não encontrado

**Sintoma:**
```
Error: Cannot find module 'dotenv'
```

**Solução:**

```bash
cd backend
cp .env.example .env

# Verificar
ls -la | grep .env
```

---

## Portas Utilizadas

| Serviço | Desenvolvimento | Produção (Docker) |
|---------|----------------|-------------------|
| Frontend | 3000 | 80 |
| Backend | 3001 | 3001 (interno) |

---

## Estrutura de Logs

### Docker
```bash
# Todos os logs
docker-compose logs -f

# Apenas erros
docker-compose logs -f | grep ERROR

# Últimas 100 linhas
docker-compose logs --tail=100
```

### Desenvolvimento
```bash
# Backend logs aparecem no terminal
# Frontend logs no console do navegador (F12)
```

---

## Performance e Recursos

### Requisitos Mínimos

- **RAM**: 2GB
- **CPU**: 2 cores
- **Disco**: 1GB livre

### Recomendado

- **RAM**: 4GB+
- **CPU**: 4 cores+
- **Disco**: 5GB+ livre

### Docker Resources

Configurar no Docker Desktop:
- Memory: 4GB
- CPUs: 2
- Swap: 2GB

---

## Próximos Passos

Após instalação bem-sucedida:

1. Leia [QUICK_START.md](QUICK_START.md) para uso básico
2. Veja [EXAMPLES.md](EXAMPLES.md) para exemplos práticos
3. Consulte [README.md](README.md) para documentação completa
4. Explore [ARCHITECTURE.md](ARCHITECTURE.md) para entender a arquitetura

---

## Suporte

- **Issues**: Abra uma issue no GitHub
- **Docs**: Consulte README.md
- **Examples**: Veja EXAMPLES.md
- **Contributing**: Leia CONTRIBUTING.md

---

**Instalação concluída!** 🎉

Acesse http://localhost e comece a processar seus PDFs.
