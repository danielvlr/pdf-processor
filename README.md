# PDF Processor

Aplicação full-stack para processamento em lote de arquivos PDF, permitindo substituição de capa, remoção de rodapé e exclusão da última página.

> 📘 **Navegação da Documentação**: Veja [INDEX.md](INDEX.md) para um guia completo de toda a documentação disponível.
>
> 🚀 **Primeiro Uso?** Comece com [FIRST_RUN.md](FIRST_RUN.md) para um guia passo-a-passo.
>
> ⚡ **Início Rápido?** Veja [QUICK_START.md](QUICK_START.md).

## Funcionalidades

- Upload de arquivo ZIP contendo múltiplos PDFs
- Upload de arquivo de capa (PDF ou imagem: PNG, JPG, SVG)
- Substituição automática da primeira página de cada PDF pela capa fornecida
- Remoção de rodapé (área branca personalizável) de todas as páginas (exceto primeira)
- Exclusão da última página de cada PDF
- Download do ZIP processado
- Relatório detalhado do processamento por arquivo
- Suporte para PDFs com diferentes tamanhos e orientações
- Interface web moderna e responsiva

## Estrutura do Projeto

```
pdf-processor/
├── backend/                 # API Node.js + TypeScript
│   ├── src/
│   │   ├── controllers/    # Controladores da API
│   │   ├── routes/         # Rotas Express
│   │   ├── services/       # Lógica de negócio (PDF, imagem)
│   │   ├── middleware/     # Middlewares (error handling)
│   │   └── index.ts        # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx        # Componente principal
│   │   ├── App.css        # Estilos
│   │   └── main.tsx       # Entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml      # Orquestração dos containers
└── package.json           # Root workspace
```

## Tecnologias Utilizadas

### Backend
- **Node.js** + **TypeScript**
- **Express** - Framework web
- **pdf-lib** - Manipulação de PDFs
- **sharp** - Processamento de imagens
- **jszip** - Manipulação de arquivos ZIP
- **multer** - Upload de arquivos
- **Jest** + **Supertest** - Testes

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Axios** - Cliente HTTP
- **CSS3** - Estilização

### DevOps
- **Docker** + **Docker Compose**
- **Nginx** - Servidor web (produção)

## Pré-requisitos

### Opção 1: Docker (Recomendado)
- Docker 20.10+
- Docker Compose 2.0+

### Opção 2: Instalação Local
- Node.js 20+
- npm 10+

## Instalação e Execução

### Com Docker (Produção)

1. **Clone o repositório**
```bash
git clone <repository-url>
cd pdf-processor
```

2. **Build e inicie os containers**
```bash
docker-compose up --build
```

3. **Acesse a aplicação**
- Frontend: http://localhost
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

### Sem Docker (Desenvolvimento)

1. **Instale as dependências**
```bash
# Instalar dependências de todos os workspaces
npm run install:all

# OU instalar manualmente
cd backend && npm install
cd ../frontend && npm install
```

2. **Configure as variáveis de ambiente**
```bash
cd backend
cp .env.example .env
```

3. **Inicie o backend**
```bash
cd backend
npm run dev
```

4. **Em outro terminal, inicie o frontend**
```bash
cd frontend
npm run dev
```

5. **Acesse a aplicação**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Comandos Disponíveis

### Root (workspace)
```bash
npm run install:all      # Instalar todas as dependências
npm run dev              # Iniciar backend + frontend em paralelo
npm run build            # Build de produção (backend + frontend)
npm run test             # Executar testes do backend
npm run docker:build     # Build dos containers Docker
npm run docker:up        # Iniciar containers Docker
npm run docker:down      # Parar containers Docker
```

### Backend
```bash
npm run dev              # Modo desenvolvimento (hot reload)
npm run build            # Build TypeScript
npm start                # Iniciar servidor (produção)
npm test                 # Executar testes
npm run test:watch       # Testes em modo watch
```

### Frontend
```bash
npm run dev              # Servidor de desenvolvimento
npm run build            # Build de produção
npm run preview          # Preview do build de produção
npm run lint             # Executar ESLint
```

## Uso da Aplicação

1. **Prepare seus arquivos**
   - Crie um arquivo ZIP contendo os PDFs a serem processados
   - Prepare um arquivo de capa (PDF ou imagem PNG/JPG/SVG)

2. **Acesse a interface web**
   - Abra http://localhost (Docker) ou http://localhost:3000 (local)

3. **Upload dos arquivos**
   - Selecione o ZIP com os PDFs
   - Selecione o arquivo de capa
   - (Opcional) Ajuste a altura do rodapé em pixels (padrão: 10px)

4. **Processar**
   - Clique em "Processar PDFs"
   - Aguarde o processamento

5. **Download**
   - O download do ZIP processado iniciará automaticamente
   - Visualize o relatório de processamento na tela

## API Reference

### POST /api/process

Processa um ZIP de PDFs aplicando capa, removendo rodapé e última página.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `filesZip` (file, required): ZIP contendo PDFs
  - `cover` (file, required): Arquivo de capa (PDF/PNG/JPG/SVG)
  - `footerHeightPx` (number, optional): Altura do rodapé em pixels (padrão: 10)

**Response:**
- Content-Type: `application/zip`
- Headers:
  - `X-Process-Report`: JSON com relatório de processamento
- Body: ZIP com PDFs processados

**Exemplo de relatório:**
```json
[
  {
    "name": "document1.pdf",
    "originalPages": 5,
    "finalPages": 4,
    "success": true
  },
  {
    "name": "document2.pdf",
    "originalPages": 0,
    "finalPages": 0,
    "success": false,
    "error": "Invalid PDF format"
  }
]
```

## Regras de Processamento

### PDFs com 1 página
- Substitui a única página pela capa
- Resultado: 1 página (capa)

### PDFs com 2 páginas
- Substitui primeira página pela capa
- Remove última página
- Resultado: 1 página (capa)

### PDFs com 3+ páginas
- Substitui primeira página pela capa
- Remove rodapé das páginas intermediárias
- Remove última página
- Resultado: N-1 páginas

### Tratamento de Capa

**Capa em PDF:**
- Usa a primeira página do PDF de capa
- Redimensiona para tamanho da página 1 original

**Capa em Imagem:**
- Converte para PDF
- Dimensiona mantendo proporção
- Centraliza em página A4 (ou tamanho original)
- Preenche com branco quando necessário

### Arquivos Ignorados
- Arquivos que não sejam `.pdf` dentro do ZIP são ignorados
- Reportados no log de processamento

## Testes

O projeto inclui testes unitários e de integração:

```bash
cd backend
npm test
```

**Cobertura de testes:**
- Serviço de processamento PDF
- Serviço de conversão de imagens
- Controller de processamento
- Casos extremos (1 página, 2 páginas, PDFs corrompidos)

## Limitações e Considerações

- Tamanho máximo de upload: 100MB por request
- Tipos de imagem suportados: PNG, JPG, JPEG, SVG
- A remoção de rodapé é feita por sobreposição com retângulo branco
- PDFs criptografados podem não funcionar
- Processamento síncrono (para grandes volumes, considere fila assíncrona)

## Estrutura de Diretórios Completa

```
pdf-processor/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── __tests__/
│   │   │   │   └── process.controller.test.ts
│   │   │   └── process.controller.ts
│   │   ├── routes/
│   │   │   └── process.route.ts
│   │   ├── services/
│   │   │   ├── __tests__/
│   │   │   │   ├── pdf.service.test.ts
│   │   │   │   └── image.service.test.ts
│   │   │   ├── pdf.service.ts
│   │   │   └── image.service.ts
│   │   ├── middleware/
│   │   │   └── error.middleware.ts
│   │   └── index.ts
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile
│   ├── jest.config.js
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── index.html
│   ├── nginx.conf
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── docker-compose.yml
├── package.json
└── README.md
```

## Troubleshooting

### Erro ao instalar dependências do sharp
```bash
# No Windows, pode ser necessário instalar build tools
npm install --global windows-build-tools
```

### Erro de CORS
- Verifique se o backend está rodando na porta 3001
- Verifique se o proxy do Vite está configurado corretamente

### Container não inicia
```bash
# Limpar containers e volumes
docker-compose down -v
docker system prune -f
docker-compose up --build
```

### Testes falhando
```bash
# Limpar cache do Jest
cd backend
npx jest --clearCache
npm test
```

## Melhorias Futuras

- [ ] Processamento assíncrono com filas (Bull/BullMQ)
- [ ] Suporte a WebSockets para progresso em tempo real
- [ ] Armazenamento em nuvem (S3, Google Cloud Storage)
- [ ] Autenticação e autorização de usuários
- [ ] Histórico de processamentos
- [ ] Prévia dos PDFs antes do processamento
- [ ] Suporte a mais formatos de imagem (TIFF, WebP)
- [ ] API para processamento de PDF individual
- [ ] Rate limiting e throttling
- [ ] Logs estruturados (Winston, Pino)
- [ ] Monitoramento (Prometheus, Grafana)
- [ ] CI/CD pipeline

## Licença

MIT

## Contato

Para dúvidas ou sugestões, abra uma issue no repositório.
