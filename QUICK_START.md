# Quick Start Guide - PDF Processor

## Início Rápido com Docker (Recomendado)

### 1. Pré-requisitos
- Docker instalado
- Docker Compose instalado

### 2. Iniciar aplicação (3 comandos)

```bash
# 1. Entre no diretório do projeto
cd pdf-processor

# 2. Build e inicie os containers
docker-compose up --build

# 3. Acesse no navegador
# http://localhost
```

Pronto! A aplicação estará rodando.

---

## Início Rápido - Desenvolvimento Local

### 1. Pré-requisitos
- Node.js 20+
- npm 10+

### 2. Instalação e execução

```bash
# 1. Instalar dependências
npm run install:all

# 2. Configurar variáveis de ambiente
cd backend
cp .env.example .env
cd ..

# 3. Iniciar backend e frontend
npm run dev
```

### 3. Acessar aplicação
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## Como Usar

1. **Prepare os arquivos:**
   - Crie um `.zip` com seus PDFs
   - Tenha uma capa (PDF ou imagem PNG/JPG/SVG)

2. **Na interface web:**
   - Faça upload do ZIP
   - Faça upload da capa
   - Configure altura do rodapé (opcional, padrão: 10px)
   - Clique em "Processar PDFs"

3. **Resultado:**
   - Download automático do ZIP processado
   - Relatório exibido na tela

---

## Estrutura dos Arquivos Processados

### Entrada
```
meus-pdfs.zip
├── documento1.pdf  (5 páginas)
├── documento2.pdf  (3 páginas)
└── documento3.pdf  (2 páginas)

capa.pdf (ou capa.png)
```

### Saída
```
processed-pdfs.zip
├── documento1.pdf  (4 páginas: capa + 3 páginas sem rodapé)
├── documento2.pdf  (2 páginas: capa + 1 página sem rodapé)
└── documento3.pdf  (1 página: apenas capa)
```

---

## O que o processamento faz?

Para cada PDF:

1. ✅ **Substitui a primeira página** pela capa fornecida
2. ✅ **Remove rodapé** de todas as páginas intermediárias (cria área branca no final)
3. ✅ **Remove a última página** do documento

---

## Comandos Úteis

### Docker
```bash
# Iniciar
docker-compose up

# Parar
docker-compose down

# Ver logs
docker-compose logs -f

# Rebuild
docker-compose up --build
```

### Desenvolvimento
```bash
# Rodar testes
npm test

# Build de produção
npm run build

# Apenas backend
cd backend && npm run dev

# Apenas frontend
cd frontend && npm run dev
```

---

## Solução de Problemas Rápida

### Porta já em uso
```bash
# Mudar porta do backend em backend/.env
PORT=3002

# Mudar porta do frontend em frontend/vite.config.ts
server: { port: 3005 }
```

### Containers não iniciam
```bash
# Limpar tudo e reconstruir
docker-compose down -v
docker system prune -f
docker-compose up --build
```

### Erro ao processar PDF
- Verifique se o PDF não está corrompido
- Verifique se o PDF não está criptografado/protegido
- Tamanho máximo: 100MB

---

## Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| `docker-compose.yml` | Configuração Docker |
| `backend/src/services/pdf.service.ts` | Lógica de processamento |
| `frontend/src/App.tsx` | Interface do usuário |
| `README.md` | Documentação completa |

---

## Próximos Passos

- Leia o [README.md](README.md) completo para documentação detalhada
- Veja os testes em `backend/src/**/__tests__/`
- Customize a interface em `frontend/src/App.css`
- Ajuste configurações em `backend/.env`

---

**Dúvidas?** Consulte o README.md ou abra uma issue.
