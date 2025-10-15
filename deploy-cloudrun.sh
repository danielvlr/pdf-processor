#!/bin/bash
# Script de deploy para Google Cloud Run com configurações otimizadas

set -e

echo "🚀 Deploying PDF Processor to Cloud Run..."
echo ""

# Variáveis
PROJECT_ID="${GCP_PROJECT_ID:-camarmo}"
REGION="${GCP_REGION:-southamerica-east1}"
SERVICE_NAME="pdf-processor"

echo "📋 Configuration:"
echo "   Project: $PROJECT_ID"
echo "   Region: $REGION"
echo "   Service: $SERVICE_NAME"
echo ""

# Deploy com configurações otimizadas
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --memory 4Gi \
  --cpu 2 \
  --timeout 900 \
  --concurrency 1 \
  --max-instances 10 \
  --min-instances 0 \
  --set-env-vars "NODE_ENV=production,NODE_OPTIONS=--max-old-space-size=4096,PDF_CONCURRENCY=2" \
  --execution-environment gen2

echo ""
echo "✅ Deploy completed!"
echo ""
echo "🔗 Service URL:"
gcloud run services describe $SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --format 'value(status.url)'
