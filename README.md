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
