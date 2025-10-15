# 🔄 GitHub Actions Workflows

Este diretório contém os workflows de CI/CD para automatizar builds, testes e deploys.

---

## 📋 Workflows Disponíveis

### 1. **CI/CD Pipeline** (`ci.yml`)

**Trigger:** Push ou Pull Request nas branches `main` e `develop`

**O que faz:**
- ✅ Build do Backend (TypeScript → JavaScript)
- ✅ Testes automatizados do Backend
- ✅ Build do Frontend (React + Vite)
- ✅ Build das imagens Docker
- ✅ Code quality checks
- ✅ Upload de coverage e artifacts

**Jobs:**
1. **Backend Build & Test** - Compila e testa o backend
2. **Frontend Build** - Compila o frontend
3. **Docker Build** - Cria imagens Docker
4. **Code Quality** - Verifica qualidade do código
5. **Build Summary** - Resume os resultados

**Duração esperada:** ~5-8 minutos

---

### 2. **Release & Deploy** (`release.yml`)

**Trigger:**
- Push de tag `v*.*.*` (ex: `v2.1.0`)
- Manual via workflow_dispatch

**O que faz:**
- 🎉 Cria GitHub Release automaticamente
- 📝 Gera changelog baseado em commits
- 🐳 Build e push de imagens Docker (opcional)
- 📦 Cria artifacts de build (.tar.gz)
- 📤 Upload de assets no release

**Como usar:**
```bash
# Criar tag e push
git tag -a v2.1.0 -m "Release v2.1.0"
git push origin v2.1.0

# O workflow será executado automaticamente
```

---

### 3. **Docker Build Test** (`docker-build-test.yml`)

**Trigger:**
- Agendado: Toda segunda-feira às 9h UTC
- Manual via workflow_dispatch

**O que faz:**
- 🐳 Testa build completo com docker-compose
- 🚀 Inicia todos os services
- 🔍 Verifica health checks
- 📊 Valida que a aplicação está acessível

**Útil para:**
- Garantir que o docker-compose sempre funciona
- Detectar problemas de compatibilidade
- Validar configurações de deploy

---

## 🚀 Como Usar

### Executar CI automaticamente

Simplesmente faça push ou crie um Pull Request:

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

O workflow CI será executado automaticamente! ✨

---

### Criar um Release

```bash
# 1. Atualize a versão no package.json
# 2. Commit as mudanças
git add .
git commit -m "chore: bump version to 2.1.0"

# 3. Crie e push a tag
git tag -a v2.1.0 -m "Release v2.1.0: Header removal feature"
git push origin v2.1.0

# 4. O release será criado automaticamente no GitHub!
```

---

### Executar workflow manualmente

1. Vá em: `Actions` no GitHub
2. Selecione o workflow
3. Clique em `Run workflow`
4. Escolha a branch/versão
5. Clique em `Run workflow` (botão verde)

---

## 📊 Ver Resultados

### No GitHub

1. Vá em: **Actions** tab no seu repositório
2. Veja o status de cada workflow
3. Clique em um workflow para ver detalhes
4. Veja logs de cada job

### Badges no README

Adicione no topo do README.md:

```markdown
![CI](https://github.com/SEU_USUARIO/pdf-processor/actions/workflows/ci.yml/badge.svg)
![Docker](https://github.com/SEU_USUARIO/pdf-processor/actions/workflows/docker-build-test.yml/badge.svg)
```

---

## 🔐 Secrets Necessários (Opcional)

Para funcionalidades avançadas, configure no GitHub:
**Settings → Secrets and variables → Actions**

### Para Docker Hub (opcional):

- `DOCKER_USERNAME` - Seu username do Docker Hub
- `DOCKER_PASSWORD` - Seu password/token do Docker Hub

**Como adicionar:**
1. Vá em: Settings → Secrets and variables → Actions
2. Clique em "New repository secret"
3. Adicione cada secret

**Nota:** Se não configurar, os workflows funcionarão normalmente, apenas não farão push para Docker Hub.

---

## 🎯 Status dos Workflows

### ✅ Sucesso
- Verde: Tudo funcionou perfeitamente
- Todas as checks passaram

### ⚠️ Warning
- Amarelo: Funcionou mas com avisos
- Não bloqueia o merge

### ❌ Falha
- Vermelho: Algo deu errado
- Veja os logs para debug

---

## 📈 Otimizações Implementadas

1. **Cache de dependências**
   - NPM cache para instalar dependências mais rápido
   - Docker cache para builds incrementais

2. **Matrix strategy**
   - Testa em múltiplas versões do Node.js
   - Garante compatibilidade

3. **Parallel jobs**
   - Backend e Frontend em paralelo
   - Reduz tempo total de build

4. **Artifacts**
   - Salva builds por 7 dias
   - Útil para debug

---

## 🔧 Personalização

### Adicionar mais Node versions

Edite `ci.yml`:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 21.x]
```

### Mudar branches monitoradas

Edite `ci.yml`:

```yaml
on:
  push:
    branches: [main, develop, staging]
```

### Adicionar mais testes

No job `backend`, adicione:

```yaml
- name: 🧪 E2E Tests
  run: npm run test:e2e
```

---

## 🐛 Troubleshooting

### "npm ci" falha

**Problema:** package-lock.json desatualizado

**Solução:**
```bash
cd backend
npm install
git add package-lock.json
git commit -m "chore: update package-lock"
```

### Docker build falha

**Problema:** Dockerfile ou dependências

**Solução:**
1. Teste localmente: `docker-compose build`
2. Verifique logs no GitHub Actions
3. Corrija e faça push novamente

### Workflow não executa

**Problema:** Branch incorreta ou .yml com erro

**Solução:**
1. Verifique sintaxe YAML: https://www.yamllint.com/
2. Confirme que está na branch correta
3. Verifique se workflow está ativado

---

## 📚 Recursos

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)

---

## 🎉 Resultado Final

Com esses workflows, você tem:

- ✅ **CI/CD completo** - Build e teste automáticos
- ✅ **Releases automatizados** - Com changelog e artifacts
- ✅ **Docker builds** - Testados e validados
- ✅ **Quality checks** - Código sempre revisado
- ✅ **Artifacts** - Builds salvos para download

**Totalmente automatizado!** 🚀

---

**Última atualização:** 2025-10-15
