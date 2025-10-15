# Google Cloud Run - Guia de Deploy

## 🚨 Erro 413 Request Entity Too Large

Se você está recebendo esse erro no Cloud Run, é porque o **limite padrão de request é 32MB**.

### Solução: Deploy com Configurações Otimizadas

## 📋 Configurações Necessárias

Para processar arquivos grandes (até 500MB), o Cloud Run precisa de:

| Configuração | Valor | Descrição |
|--------------|-------|-----------|
| **Memory** | `4Gi` | 4GB de RAM para processar PDFs grandes |
| **CPU** | `2` | 2 vCPUs para melhor performance |
| **Timeout** | `900` | 15 minutos (máximo permitido) |
| **Concurrency** | `1` | 1 requisição por vez para arquivos grandes |
| **Execution Environment** | `gen2` | Segunda geração (mais recursos) |

## 🚀 Opção 1: Deploy via Script (Recomendado)

```bash
# Dar permissão ao script
chmod +x deploy-cloudrun.sh

# Executar deploy
./deploy-cloudrun.sh
```

O script configura automaticamente:
- ✅ 4GB de memória
- ✅ 2 CPUs
- ✅ Timeout de 15 minutos
- ✅ Concorrência limitada
- ✅ Variáveis de ambiente otimizadas

## 🔧 Opção 2: Deploy via Comando Manual

```bash
gcloud run deploy pdf-processor \
  --source . \
  --platform managed \
  --region southamerica-east1 \
  --allow-unauthenticated \
  --memory 4Gi \
  --cpu 2 \
  --timeout 900 \
  --concurrency 1 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production,NODE_OPTIONS=--max-old-space-size=4096,PDF_CONCURRENCY=2" \
  --execution-environment gen2
```

## ⚙️ Variáveis de Ambiente

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `NODE_ENV` | `production` | Modo de produção |
| `NODE_OPTIONS` | `--max-old-space-size=4096` | 4GB heap do Node.js |
| `PDF_CONCURRENCY` | `2` | 2 PDFs processados por vez |

### Ajustar Concorrência

Para máquinas mais fracas ou arquivos muito grandes:

```bash
# Processar 1 PDF por vez (mais lento, menos memória)
gcloud run services update pdf-processor \
  --update-env-vars PDF_CONCURRENCY=1
```

## 📊 Custos Estimados

Com as configurações acima (4GB RAM, 2 CPU):

- **Custo por segundo:** ~$0.000144
- **Processamento de 1 minuto:** ~$0.0086
- **100 processamentos (1 min cada):** ~$0.86

**💡 Dica:** O Cloud Run cobra apenas pelo tempo de execução, não pelo tempo idle.

## 🔍 Verificar Status

```bash
# Ver URL do serviço
gcloud run services describe pdf-processor \
  --region southamerica-east1 \
  --format 'value(status.url)'

# Ver logs em tempo real
gcloud run services logs tail pdf-processor \
  --region southamerica-east1
```

## 🐛 Troubleshooting

### Erro 413 ainda acontece?

1. **Verifique a memória configurada:**
```bash
gcloud run services describe pdf-processor \
  --region southamerica-east1 \
  --format 'value(spec.template.spec.containers[0].resources.limits.memory)'
```

Deve retornar: `4Gi`

2. **Verifique o timeout:**
```bash
gcloud run services describe pdf-processor \
  --region southamerica-east1 \
  --format 'value(spec.template.spec.timeoutSeconds)'
```

Deve retornar: `900`

3. **Force um novo deploy:**
```bash
# Deletar e recriar o serviço
gcloud run services delete pdf-processor --region southamerica-east1
./deploy-cloudrun.sh
```

### Container demora muito para iniciar?

Reduza `PDF_CONCURRENCY=1` para usar menos memória no startup.

### Timeout durante processamento?

Se processar MUITOS PDFs (500+), considere:
- Dividir em múltiplos ZIPs menores
- Aumentar `PDF_CONCURRENCY` se tiver mais memória

## 📈 Monitoramento

Ver métricas no console:
```
https://console.cloud.google.com/run/detail/southamerica-east1/pdf-processor/metrics
```

## 🔐 Permissões Necessárias

Para fazer deploy, você precisa de:
- `roles/run.admin` - Administrador do Cloud Run
- `roles/iam.serviceAccountUser` - Usar service account
- `roles/artifactregistry.writer` - Escrever no Container Registry

## 📚 Referências

- [Cloud Run Request Limits](https://cloud.google.com/run/quotas)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)
- [Cloud Run Best Practices](https://cloud.google.com/run/docs/tips)
