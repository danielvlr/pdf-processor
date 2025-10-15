# 🤖 GitHub Actions - Guia de Setup

## ✅ O que foi configurado

Criei **3 workflows automáticos** para seu projeto:

### 1. **CI/CD Pipeline** 🔄
- Executa em **todo push** e **pull request**
- Build do backend + frontend
- Testes automatizados
- Docker builds
- **Duração:** ~5-8 minutos

### 2. **Release & Deploy** 🎉
- Executa quando você cria uma **tag** (ex: `v2.1.0`)
- Cria release no GitHub automaticamente
- Gera changelog
- Build e upload de artifacts
- (Opcional) Push para Docker Hub

### 3. **Docker Build Test** 🐳
- Executa **toda segunda-feira**
- Testa o `docker-compose` completo
- Valida que tudo funciona
- Pode executar manualmente também

---

## 🚀 Como Ativar (Após Push para GitHub)

### Passo 1: Fazer Push dos Workflows

```bash
# Adicionar os novos arquivos
git add .github/

# Commit
git commit -m "ci: add GitHub Actions workflows for CI/CD"

# Push para GitHub
git push origin main
```

### Passo 2: Verificar no GitHub

1. Vá no seu repositório: `https://github.com/SEU_USUARIO/pdf-processor`
2. Clique na aba **"Actions"**
3. Você verá os workflows disponíveis! ✨

---

## 📊 O Que Acontece Automaticamente

### Quando você faz um push:

```bash
git push origin main
```

**GitHub Actions vai:**
1. ✅ Instalar dependências
2. ✅ Build do backend (TypeScript → JavaScript)
3. ✅ Executar todos os testes
4. ✅ Build do frontend (React)
5. ✅ Build das imagens Docker
6. ✅ Mostrar resumo dos resultados

**Tempo total:** ~5-8 minutos

**Você receberá:**
- ✅ Email se o build passar
- ❌ Email se algo falhar (com logs)

---

## 🎉 Como Criar um Release

### Método 1: Via Tag (Recomendado)

```bash
# 1. Criar tag com versão
git tag -a v2.1.0 -m "Release v2.1.0 - Header removal feature"

# 2. Push da tag
git push origin v2.1.0

# 3. Aguarde 2-3 minutos
# 4. Vá em: https://github.com/SEU_USUARIO/pdf-processor/releases
# 5. O release foi criado automaticamente! 🎉
```

### Método 2: Via Interface do GitHub

1. Vá em: **Actions** → **Release & Deploy**
2. Clique em: **Run workflow**
3. Digite a versão: `v2.1.0`
4. Clique em: **Run workflow** (botão verde)

---

## 📱 Adicionar Badges no README

Mostre o status dos builds no seu README! Adicione no topo:

```markdown
# PDF Processor

![CI](https://github.com/SEU_USUARIO/pdf-processor/actions/workflows/ci.yml/badge.svg)
![Docker](https://github.com/SEU_USUARIO/pdf-processor/actions/workflows/docker-build-test.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)
```

**Substitua `SEU_USUARIO`** pelo seu username do GitHub!

**Resultado:**
- ✅ Badge verde = Build passando
- ❌ Badge vermelha = Build falhando

---

## 🔐 Secrets Opcionais (Docker Hub)

Se quiser fazer push automático para Docker Hub:

### 1. Criar conta no Docker Hub
- Vá em: https://hub.docker.com/signup
- Crie sua conta grátis

### 2. Criar Access Token
1. Login no Docker Hub
2. Account Settings → Security
3. New Access Token
4. Nome: `GitHub Actions`
5. Copie o token

### 3. Adicionar no GitHub
1. Vá no seu repo → **Settings**
2. **Secrets and variables** → **Actions**
3. **New repository secret**
4. Adicione:
   - Nome: `DOCKER_USERNAME` | Valor: seu username
   - Nome: `DOCKER_PASSWORD` | Valor: o token copiado

**Nota:** Isso é **opcional**! Os workflows funcionam sem isso também.

---

## 📊 Ver Resultados dos Builds

### No GitHub

1. **Actions** tab
2. Clique em um workflow para ver detalhes
3. Veja logs de cada step
4. Download de artifacts (se houver)

### Por Email

Você receberá emails automáticos:
- ✅ Quando builds passarem
- ❌ Quando falharem (com link para logs)

---

## 🎯 Exemplos Práticos

### Exemplo 1: Feature Nova

```bash
# Criar branch
git checkout -b feature/nova-funcionalidade

# Fazer mudanças
# ... código ...

# Commit e push
git add .
git commit -m "feat: adicionar exportação em Excel"
git push origin feature/nova-funcionalidade

# Criar Pull Request no GitHub
# → CI rodará automaticamente!
# → Você verá status verde/vermelho no PR
```

### Exemplo 2: Hotfix em Produção

```bash
# Criar branch de hotfix
git checkout -b hotfix/bug-critico

# Corrigir bug
# ... código ...

# Commit
git add .
git commit -m "fix: corrigir erro de validação"
git push origin hotfix/bug-critico

# Merge para main via PR
# → CI testa automaticamente

# Após merge, criar release:
git checkout main
git pull
git tag -a v2.1.1 -m "Hotfix: validation bug"
git push origin v2.1.1

# → Release criado automaticamente!
```

### Exemplo 3: Testar Docker Manualmente

1. Vá em: **Actions** → **Docker Build Test**
2. Clique em: **Run workflow**
3. Selecione branch: `main`
4. Clique em: **Run workflow**
5. Aguarde ~5 minutos
6. Veja o resultado! ✅

---

## 🐛 Troubleshooting

### "Workflow não aparece no Actions"

**Causa:** Arquivos .yml não estão na branch main

**Solução:**
```bash
git add .github/
git commit -m "ci: add workflows"
git push origin main
```

---

### "Build falhou: npm ci error"

**Causa:** package-lock.json desatualizado

**Solução:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "chore: update package-lock"
git push
```

---

### "Docker build timeout"

**Causa:** Build muito lento no GitHub

**Solução:** Já implementamos cache! Segundo build será mais rápido.

---

### "Permission denied"

**Causa:** Workflows desabilitados

**Solução:**
1. Settings → Actions → General
2. Selecione: "Allow all actions and reusable workflows"
3. Salve

---

## 📈 Métricas e Insights

Após alguns builds, você verá:

### No GitHub Actions:
- ⏱️ Tempo médio de build
- 📊 Taxa de sucesso/falha
- 📈 Histórico de execuções

### Na aba Actions:
- 🟢 Workflows ativos
- 📅 Últimas execuções
- 💰 Uso de minutos (gratuito para repos públicos!)

---

## 🎓 Próximos Passos

### Nível Avançado (opcional):

1. **Adicionar mais testes**
   - E2E tests com Playwright/Cypress
   - Integration tests

2. **Deploy automático**
   - Para Heroku, AWS, Digital Ocean
   - Via workflow de deploy

3. **Code coverage reports**
   - Com Codecov ou Coveralls
   - Badge de coverage no README

4. **Semantic Release**
   - Versionamento automático
   - Changelog gerado automaticamente

5. **Dependabot**
   - Atualização automática de dependências
   - PRs automáticos de segurança

---

## ✅ Checklist Final

Após fazer push, verifique:

- [ ] Workflows aparecem na aba Actions
- [ ] CI executa em push/PR
- [ ] Builds passam com sucesso ✅
- [ ] Badges adicionados no README (opcional)
- [ ] Secrets configurados (se usar Docker Hub)
- [ ] Email de notificação configurado

---

## 🎉 Pronto!

Seu projeto agora tem CI/CD profissional! 🚀

**Benefícios:**
- ✅ Builds automáticos
- ✅ Testes em todo push
- ✅ Releases automatizados
- ✅ Docker validado continuamente
- ✅ Feedback instantâneo
- ✅ Qualidade garantida

**Tudo isso de graça no GitHub!** 💚

---

## 📞 Precisa de Ajuda?

1. Veja logs detalhados no Actions
2. Consulte: [.github/workflows/README.md](.github/workflows/README.md)
3. GitHub Actions Docs: https://docs.github.com/actions

---

**Configurado em:** 2025-10-15
**Status:** ✅ Pronto para usar!
