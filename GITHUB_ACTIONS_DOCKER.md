# 🤖 GitHub Actions + Docker - Guia Completo

## 📋 Visão Geral

O PDF Processor tem **3 workflows** configurados para build e publicação automática do Docker:

1. **CI/CD Pipeline** - Build e teste em cada push
2. **Docker Publish** - Publicação automática no Docker Hub
3. **Docker Build Test** - Teste semanal do docker-compose

---

## 🚀 Workflows Configurados

### 1. CI/CD Pipeline (`ci.yml`)

**Trigger:** Push ou PR em `main` ou `develop`

**O que faz:**
- ✅ Build do Backend (TypeScript)
- ✅ Testes unitários
- ✅ Build do Frontend (React)
- ✅ **Build do Dockerfile unificado** ⭐
- ✅ **Testa a imagem Docker** (health check)
- ✅ Mostra informações da imagem

**Novo:** Agora usa o Dockerfile unificado em vez de 2 imagens separadas!

```yaml
# Build da imagem unificada
- name: 🔨 Build Unified Docker Image
  uses: docker/build-push-action@v5
  with:
    context: .
    file: ./Dockerfile
    tags: |
      pdf-processor:latest
      pdf-processor:v2.1.0
      pdf-processor:${{ github.sha }}
```

---

### 2. Docker Publish (`docker-publish.yml`) ⭐ NOVO!

**Trigger:**
- Push na branch `main`
- Criação de tag `v*.*.*`
- Release publicado
- Manual (workflow_dispatch)

**O que faz:**
- 🐳 Build da imagem Docker unificada
- 📤 Push para **Docker Hub** (se configurado)
- 📦 Push para **GitHub Container Registry** (sempre)
- 🔒 Security scan com Trivy
- 📊 Relatório detalhado

**Plataformas suportadas:**
- `linux/amd64`
- `linux/arm64`

---

### 3. Docker Build Test (`docker-build-test.yml`)

**Trigger:**
- Toda segunda-feira às 9h UTC
- Manual (workflow_dispatch)

**O que faz:**
- 🐳 Testa o docker-compose completo
- 🚀 Inicia todos os serviços
- 🔍 Verifica health checks
- 📊 Valida acessibilidade

---

## 🔐 Configurar Secrets (Para Docker Hub)

### Passo 1: Criar Token no Docker Hub

1. Login no Docker Hub: https://hub.docker.com/
2. Account Settings → Security
3. New Access Token
4. Nome: `GitHub Actions`
5. Permissions: Read, Write, Delete
6. Copie o token

### Passo 2: Adicionar Secrets no GitHub

1. Vá no seu repositório
2. Settings → Secrets and variables → Actions
3. New repository secret

**Adicione 2 secrets:**

| Nome | Valor |
|------|-------|
| `DOCKER_USERNAME` | Seu username do Docker Hub |
| `DOCKER_PASSWORD` | O token que você copiou |

---

## 📊 Fluxo de Trabalho

### Cenário 1: Push Normal

```bash
git push origin main
```

**O que acontece:**
1. ✅ CI/CD rodará automaticamente
2. ✅ Build do backend + testes
3. ✅ Build do frontend
4. ✅ Build da imagem Docker
5. ✅ Teste da imagem (health check)
6. ✅ Relatório no GitHub Actions

**Se secrets configurados:**
7. 🐳 Push para Docker Hub
8. 📦 Push para GHCR

---

### Cenário 2: Release com Tag

```bash
# Criar release
git tag -a v2.1.0 -m "Release v2.1.0"
git push origin v2.1.0
```

**O que acontece:**
1. ✅ Tudo do Cenário 1
2. 🎉 GitHub Release criado automaticamente
3. 🐳 Imagem publicada com múltiplas tags:
   - `latest`
   - `v2.1.0`
   - `v2.1`
   - `v2`
   - `main-<sha>`

---

### Cenário 3: Manual Trigger

1. Vá em: Actions → Docker Publish
2. Clique em: Run workflow
3. Selecione branch: `main`
4. Clique em: Run workflow

**Útil para:**
- Republicar imagem
- Testar publicação
- Forçar rebuild

---

## 🐳 Onde a Imagem é Publicada

### 1. Docker Hub (se configurado)

```bash
docker pull SEU_USUARIO/pdf-processor:latest
```

**URL:** https://hub.docker.com/r/SEU_USUARIO/pdf-processor

---

### 2. GitHub Container Registry (sempre)

```bash
docker pull ghcr.io/SEU_USUARIO/pdf-processor:latest
```

**URL:** https://github.com/SEU_USUARIO/pdf-processor/pkgs/container/pdf-processor

**Vantagens do GHCR:**
- ✅ Gratuito
- ✅ Integrado ao GitHub
- ✅ Sem limite de pulls
- ✅ Automático (não precisa secrets)

---

## 📈 Ver Resultados

### No GitHub Actions

1. Vá em: Actions tab
2. Selecione um workflow
3. Veja o status:
   - 🟢 Verde = Sucesso
   - 🔴 Vermelho = Falhou
   - 🟡 Amarelo = Em andamento

### Logs Detalhados

1. Clique no workflow
2. Clique no job
3. Veja logs de cada step

### Artifacts

- Build do frontend salvo por 7 dias
- Disponível para download

---

## 🎯 Tags Automáticas

O workflow gera tags automaticamente:

| Tipo | Exemplo | Quando |
|------|---------|--------|
| Latest | `latest` | Push em main |
| Version | `v2.1.0` | Tag `v2.1.0` |
| Major.Minor | `v2.1` | Tag `v2.1.0` |
| Major | `v2` | Tag `v2.1.0` |
| SHA | `main-abc123` | Cada commit |

---

## 🔒 Security Scan

O workflow inclui scan de segurança com Trivy:

**O que faz:**
- 🔍 Escaneia vulnerabilidades
- 📊 Identifica CRITICAL e HIGH
- 📤 Upload para GitHub Security tab
- ⚠️ Alerta se encontrar problemas

**Ver resultados:**
1. Security tab no GitHub
2. Code scanning alerts
3. Veja detalhes das vulnerabilidades

---

## ⚡ Performance e Cache

### Cache do GitHub Actions

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

**Benefícios:**
- ✅ Builds subsequentes mais rápidos
- ✅ Reutiliza layers do Docker
- ✅ Economiza tempo e recursos

**Primeira vez:** ~5-8 minutos
**Com cache:** ~2-3 minutos

---

## 🎨 Badges no README

Adicione no seu README.md:

```markdown
![CI/CD](https://github.com/SEU_USUARIO/pdf-processor/actions/workflows/ci.yml/badge.svg)
![Docker Publish](https://github.com/SEU_USUARIO/pdf-processor/actions/workflows/docker-publish.yml/badge.svg)
![Docker Image Size](https://img.shields.io/docker/image-size/SEU_USUARIO/pdf-processor/latest)
![Docker Pulls](https://img.shields.io/docker/pulls/SEU_USUARIO/pdf-processor)
```

**Substitua `SEU_USUARIO`** pelo seu username!

---

## 🐛 Troubleshooting

### "Secrets not found"

**Problema:** DOCKER_USERNAME ou DOCKER_PASSWORD não configurados

**Solução:**
1. Settings → Secrets → Actions
2. Adicione os secrets
3. Ou: O workflow funcionará sem publicar no Docker Hub (só GHCR)

---

### "Docker build failed"

**Problema:** Erro no Dockerfile ou dependências

**Solução:**
1. Veja os logs do job
2. Teste localmente: `./build-docker.sh`
3. Verifique package-lock.json atualizado
4. Commit e push novamente

---

### "Health check failed"

**Problema:** Aplicação não respondendo

**Solução:**
1. Veja logs do container no workflow
2. Teste localmente
3. Verifique se porta 8080 está livre
4. Aumente o sleep time no workflow

---

### "Push to registry failed"

**Problema:** Credenciais inválidas ou permissões

**Solução:**
1. Verifique secrets no GitHub
2. Regenere token do Docker Hub
3. Verifique permissões do token
4. Teste login local: `docker login`

---

## 📊 Exemplo de Workflow Run

### Sucesso Completo ✅

```
✅ Backend Build & Test (2m 15s)
✅ Frontend Build (1m 45s)
✅ Docker Build (3m 30s)
   - Build: 2m 50s
   - Test: 20s
   - Info: 5s
✅ Docker Hub Push (2m 10s)
✅ GHCR Push (1m 55s)
✅ Security Scan (1m 30s)

Total: ~8 minutos
```

### Com Cache ⚡

```
✅ Backend Build & Test (1m 10s)
✅ Frontend Build (45s)
✅ Docker Build (1m 20s)
✅ Docker Hub Push (50s)
✅ GHCR Push (45s)
✅ Security Scan (1m 00s)

Total: ~4 minutos
```

---

## 🚀 Usar a Imagem Publicada

### Do Docker Hub

```bash
# Pull
docker pull SEU_USUARIO/pdf-processor:latest

# Run
docker run -d -p 80:80 SEU_USUARIO/pdf-processor:latest
```

### Do GitHub Container Registry

```bash
# Pull (pode precisar de autenticação)
docker pull ghcr.io/SEU_USUARIO/pdf-processor:latest

# Run
docker run -d -p 80:80 ghcr.io/SEU_USUARIO/pdf-processor:latest
```

---

## ✅ Checklist de Setup

- [ ] Workflows commitados no `.github/workflows/`
- [ ] Push para o GitHub feito
- [ ] CI/CD rodou com sucesso
- [ ] (Opcional) Secrets do Docker Hub configurados
- [ ] Imagem publicada no GHCR
- [ ] (Opcional) Imagem publicada no Docker Hub
- [ ] Badges adicionados no README
- [ ] Security scan passando

---

## 📚 Recursos

- [GitHub Actions Docs](https://docs.github.com/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [GHCR Docs](https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Trivy Scanner](https://github.com/aquasecurity/trivy)

---

## 🎉 Resultado Final

Com essa configuração você tem:

- ✅ Build automático em cada push
- ✅ Testes em cada PR
- ✅ Publicação automática de imagens
- ✅ Multi-platform (amd64 + arm64)
- ✅ Security scanning
- ✅ Cache para builds rápidos
- ✅ Badges profissionais
- ✅ 100% automatizado!

**Seu projeto está com CI/CD nível profissional!** 🚀

---

**Versão:** 2.1.0
**Última atualização:** 2025-10-15
**Status:** ✅ Configurado e funcionando
