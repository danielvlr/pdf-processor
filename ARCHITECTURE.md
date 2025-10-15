# Arquitetura do Sistema - PDF Processor

## Visão Geral

Este documento descreve a arquitetura técnica do sistema de processamento de PDFs em lote.

## Stack Tecnológico

### Backend
- **Runtime**: Node.js 20
- **Linguagem**: TypeScript
- **Framework Web**: Express.js
- **Processamento PDF**: pdf-lib
- **Processamento Imagem**: sharp
- **Manipulação ZIP**: jszip
- **Upload**: multer
- **Testes**: Jest + Supertest

### Frontend
- **Framework**: React 18
- **Linguagem**: TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Estilização**: CSS3 Puro

### Infraestrutura
- **Containers**: Docker
- **Orquestração**: Docker Compose
- **Web Server**: Nginx (produção)
- **Proxy Reverso**: Nginx

## Arquitetura de Alto Nível

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────────────────────────┐
│     Nginx (Container)           │
│  - Serve Frontend (SPA)         │
│  - Proxy /api -> Backend        │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│   Backend API (Container)       │
│  - Express Server               │
│  - PDF Processing               │
│  - Image Conversion             │
│  - ZIP Manipulation             │
└─────────────────────────────────┘
```

## Fluxo de Dados

### 1. Upload e Processamento

```
User Upload
    │
    ▼
[Frontend: App.tsx]
    │ FormData (filesZip, cover, footerHeightPx)
    │ POST /api/process
    ▼
[Backend: process.route.ts]
    │ Multer middleware
    ▼
[Backend: process.controller.ts]
    │
    ├─► Extract PDFs from ZIP (jszip)
    │
    ├─► Convert Cover if Image (image.service.ts)
    │   └─► sharp → PDF (pdf-lib)
    │
    └─► For each PDF:
        │
        ▼
    [Backend: pdf.service.ts]
        │
        ├─► Load PDF (pdf-lib)
        ├─► Load Cover PDF (pdf-lib)
        ├─► Create New PDF
        │   ├─► Add Cover as Page 1
        │   ├─► Add Middle Pages (with footer removal)
        │   └─► Skip Last Page
        │
        └─► Save Processed PDF
            │
            ▼
    [Backend: process.controller.ts]
        │
        ├─► Collect Results
        ├─► Create Output ZIP (jszip)
        └─► Send Response
            │ ZIP File + Report Header
            ▼
    [Frontend: App.tsx]
        │
        ├─► Parse Report Header
        ├─► Display Report
        └─► Trigger Download
```

## Estrutura de Camadas

### Backend

#### 1. Camada de Apresentação (Routes)
```typescript
// routes/process.route.ts
- Define endpoints
- Configuração multer
- Validação básica
```

#### 2. Camada de Controle (Controllers)
```typescript
// controllers/process.controller.ts
- Orquestra o fluxo
- Validação de entrada
- Tratamento de resposta
- Coleta de resultados
```

#### 3. Camada de Serviço (Services)
```typescript
// services/pdf.service.ts
- Lógica de processamento PDF
- Manipulação pdf-lib

// services/image.service.ts
- Conversão de imagens
- Redimensionamento
```

#### 4. Camada de Middleware
```typescript
// middleware/error.middleware.ts
- Tratamento global de erros
- Logging
```

### Frontend

#### Componente Principal
```typescript
// App.tsx
- Estado da aplicação
- Upload de arquivos
- Chamada API
- Exibição de resultados
- Download automático
```

## Detalhes de Implementação

### Processamento de PDF

#### Caso 1: PDF com 1 página
```
Original: [P1]
Processo:
  1. Substituir P1 por Capa
Resultado: [Capa]
```

#### Caso 2: PDF com 2 páginas
```
Original: [P1, P2]
Processo:
  1. Substituir P1 por Capa
  2. Remover P2 (última página)
Resultado: [Capa]
```

#### Caso 3: PDF com 3+ páginas
```
Original: [P1, P2, P3, P4, P5]
Processo:
  1. Substituir P1 por Capa
  2. P2, P3, P4: Remover rodapé (retângulo branco)
  3. Remover P5 (última página)
Resultado: [Capa, P2*, P3*, P4*]
         (* = sem rodapé)
```

### Remoção de Rodapé

Implementado via desenho de retângulo branco:

```typescript
page.drawRectangle({
  x: 0,
  y: 0,
  width: pageWidth,
  height: footerHeightPx,
  color: rgb(1, 1, 1) // Branco
});
```

### Conversão de Imagem para PDF

1. **PNG/JPG**: Embed direto no PDF
2. **SVG**: Conversão para PNG via sharp → Embed

Dimensionamento:
- Calcula escala para caber em A4 (ou tamanho original)
- Mantém proporção
- Centraliza na página
- Preenche espaços com branco

## Patterns e Práticas

### Design Patterns

1. **Separation of Concerns**
   - Routes: roteamento
   - Controllers: orquestração
   - Services: lógica de negócio

2. **Dependency Injection**
   - Serviços independentes
   - Facilita testes unitários

3. **Error Handling Middleware**
   - Centralizado
   - Consistente

### Melhores Práticas

- **TypeScript Strict Mode**: Segurança de tipos
- **Async/Await**: Código síncrono e legível
- **Try/Catch**: Tratamento de erros em cada camada
- **Validação de Entrada**: Múltiplas camadas
- **Testes Automatizados**: Cobertura de casos críticos

## Segurança

### Medidas Implementadas

1. **Upload Seguro**
   - Validação de tipo MIME
   - Limite de tamanho (100MB)
   - Armazenamento em memória (não em disco)

2. **Validação de Arquivos**
   - Verificação de formato PDF
   - Tratamento de PDFs corrompidos

3. **CORS**
   - Configurado para desenvolvimento/produção

4. **Error Handling**
   - Não expõe stack traces em produção
   - Mensagens genéricas para usuário

### Melhorias Futuras de Segurança

- Rate limiting
- Autenticação JWT
- Sanitização de nomes de arquivo
- Scan de malware
- Criptografia em trânsito/repouso

## Performance

### Otimizações Atuais

1. **Processamento em Memória**
   - Evita I/O de disco
   - Mais rápido para arquivos pequenos/médios

2. **Streaming de ZIP**
   - Resposta direta sem armazenamento temporário

3. **Compressão ZIP**
   - Nível 6 (balanceado)

4. **Frontend**
   - Build otimizado (Vite)
   - Code splitting
   - Assets com cache

### Limitações de Performance

- **Processamento Síncrono**: Blocking para grandes volumes
- **Sem Paralelização**: PDFs processados sequencialmente
- **Memory Bound**: Todo processamento em RAM

### Melhorias Futuras

- Background jobs (Bull/BullMQ)
- Worker threads para paralelização
- Stream processing para arquivos grandes
- Cache de capas processadas
- Progress tracking via WebSocket

## Escalabilidade

### Vertical
- Aumentar recursos do container
- Otimizar uso de memória

### Horizontal
- Múltiplas instâncias do backend
- Load balancer (Nginx/HAProxy)
- Fila de jobs distribuída
- Storage compartilhado (S3, GCS)

## Monitoramento e Observabilidade

### Implementado
- Health check endpoint
- Logs de console
- Docker health checks

### Recomendado
- **Logs**: Winston/Pino com níveis
- **Métricas**: Prometheus
- **Tracing**: OpenTelemetry
- **Dashboards**: Grafana
- **Alertas**: AlertManager

## Deployment

### Desenvolvimento
```bash
npm run dev  # Hot reload
```

### Produção - Docker
```bash
docker-compose up --build
```

### Produção - Manual
```bash
npm run build
npm start
```

## Variáveis de Ambiente

### Backend
```env
PORT=3001
NODE_ENV=development|production
MAX_FILE_SIZE=52428800  # bytes
UPLOAD_DIR=uploads      # não usado atualmente
```

## Troubleshooting

### Logs
```bash
# Docker
docker-compose logs -f backend
docker-compose logs -f frontend

# Local
# Logs aparecem no terminal
```

### Debug
```bash
# Backend
NODE_ENV=development npm run dev

# Testes com debug
npm test -- --verbose
```

## Diagramas

### Diagrama de Sequência - Processamento

```
User -> Frontend: Upload files
Frontend -> Backend: POST /api/process
Backend -> JSZip: Extract PDFs
Backend -> Sharp: Convert cover (if image)
Backend -> pdf-lib: Process each PDF
  pdf-lib -> pdf-lib: Replace page 1
  pdf-lib -> pdf-lib: Remove footer
  pdf-lib -> pdf-lib: Skip last page
Backend -> JSZip: Create output ZIP
Backend -> Frontend: Send ZIP + Report
Frontend -> User: Download + Display report
```

### Diagrama de Componentes

```
┌─────────────────────────────────────────────┐
│              Frontend (React)               │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐ │
│  │ App.tsx │──│ Axios    │──│ FileAPI    │ │
│  └─────────┘  └──────────┘  └────────────┘ │
└──────────────────┬──────────────────────────┘
                   │ HTTP/REST
┌──────────────────▼──────────────────────────┐
│           Backend (Express)                 │
│  ┌────────┐  ┌────────────┐  ┌───────────┐ │
│  │ Routes │──│ Controllers│──│ Services  │ │
│  └────────┘  └────────────┘  └─────┬─────┘ │
│                                     │       │
│  ┌──────────┐  ┌──────────┐  ┌─────▼─────┐ │
│  │ Multer   │  │ pdf-lib  │  │ sharp     │ │
│  └──────────┘  └──────────┘  └───────────┘ │
└─────────────────────────────────────────────┘
```

## Referências

- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [sharp Documentation](https://sharp.pixelplumbing.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
