# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2025-01-15

### Adicionado
- Processamento em lote de PDFs via upload de ZIP
- Substituição da primeira página por capa personalizada
- Suporte para capas em PDF e imagem (PNG/JPG/SVG)
- Remoção de rodapé configurável (altura em pixels)
- Exclusão automática da última página de cada PDF
- Interface web moderna e responsiva
- API REST com endpoint `/api/process`
- Relatório detalhado de processamento por arquivo
- Suporte para PDFs com diferentes tamanhos e orientações
- Download automático do ZIP processado
- Tratamento de erros com relatório por arquivo
- Validação de tipos de arquivo
- Conversão automática de imagens para PDF
- Redimensionamento inteligente de capas
- Centralização de imagens em páginas

### Backend
- Express.js server com TypeScript
- Processamento PDF com pdf-lib
- Processamento de imagens com sharp
- Manipulação de ZIP com jszip
- Upload de arquivos com multer
- CORS configurado
- Health check endpoint
- Error handling middleware
- Testes unitários e de integração com Jest
- Cobertura de testes > 80%

### Frontend
- Interface React com TypeScript
- Upload de múltiplos arquivos
- Configuração de altura de rodapé
- Exibição de relatório de processamento
- Download automático
- Validação de formulário
- Feedback visual durante processamento
- Design responsivo
- Gradiente moderno
- Tabela de resultados

### DevOps
- Docker support completo
- Docker Compose para orquestração
- Nginx configurado para produção
- Health checks para containers
- Scripts de setup para Windows/Linux/Mac
- Variáveis de ambiente configuráveis
- Build otimizado com multi-stage Dockerfile

### Documentação
- README completo
- Quick Start Guide
- Architecture Documentation
- Examples and Use Cases
- Contributing Guidelines
- Changelog
- License (MIT)
- Project Structure
- API Reference
- Troubleshooting Guide

### Configuração
- TypeScript strict mode
- ESLint configurado
- Prettier integration
- EditorConfig
- Git ignore rules
- Docker ignore rules
- Environment variables template

### Testes
- Testes para pdf.service
- Testes para image.service
- Testes para process.controller
- Testes de integração end-to-end
- Casos extremos (1 página, 2 páginas, PDFs corrompidos)
- Mock de dependências
- Coverage reports

## [Unreleased]

### Planejado
- [ ] Processamento assíncrono com filas
- [ ] WebSockets para progresso em tempo real
- [ ] Autenticação de usuários
- [ ] Histórico de processamentos
- [ ] Preview de PDFs
- [ ] Suporte a mais formatos de imagem (TIFF, WebP)
- [ ] API para processamento individual
- [ ] Rate limiting
- [ ] Logs estruturados
- [ ] Monitoramento (Prometheus)
- [ ] CI/CD pipeline
- [ ] Testes E2E com Playwright
- [ ] Internacionalização (i18n)
- [ ] Dark mode na interface
- [ ] Drag and drop para upload
- [ ] Armazenamento em nuvem (S3)

---

## Tipos de Mudanças

- **Adicionado** - para novas funcionalidades
- **Modificado** - para mudanças em funcionalidades existentes
- **Descontinuado** - para funcionalidades que serão removidas
- **Removido** - para funcionalidades removidas
- **Corrigido** - para correções de bugs
- **Segurança** - para vulnerabilidades corrigidas
