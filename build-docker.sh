#!/bin/bash

# ============================================
# PDF Processor - Docker Build Script
# ============================================
# Script para build da imagem Docker completa
# ============================================

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
IMAGE_NAME="${IMAGE_NAME:-pdf-processor}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
DOCKER_USERNAME="${DOCKER_USERNAME:-}"

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║         PDF Processor - Docker Build                 ║"
echo "║                 Version 2.1.0                         ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Função para print com cores
print_step() {
    echo -e "${GREEN}▶${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Verificar se Docker está rodando
print_step "Verificando Docker..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker não está rodando!"
    echo "Por favor, inicie o Docker Desktop e tente novamente."
    exit 1
fi
print_success "Docker está rodando"

# Mostrar informações
print_info "Image name: $IMAGE_NAME"
print_info "Tag: $IMAGE_TAG"
if [ -n "$DOCKER_USERNAME" ]; then
    print_info "Docker Hub username: $DOCKER_USERNAME"
fi

echo ""

# Build da imagem
print_step "Iniciando build da imagem..."
echo ""

docker build \
    --tag "$IMAGE_NAME:$IMAGE_TAG" \
    --tag "$IMAGE_NAME:v2.1.0" \
    --label "version=2.1.0" \
    --label "description=PDF Processor - Batch PDF processing" \
    --label "maintainer=seu-email@example.com" \
    --progress=plain \
    .

echo ""

if [ $? -eq 0 ]; then
    print_success "Build concluído com sucesso!"
else
    print_error "Build falhou!"
    exit 1
fi

echo ""

# Mostrar informações da imagem
print_step "Informações da imagem:"
docker images "$IMAGE_NAME:$IMAGE_TAG" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

echo ""

# Tag adicional se username do Docker Hub for fornecido
if [ -n "$DOCKER_USERNAME" ]; then
    print_step "Criando tag para Docker Hub..."
    docker tag "$IMAGE_NAME:$IMAGE_TAG" "$DOCKER_USERNAME/$IMAGE_NAME:$IMAGE_TAG"
    docker tag "$IMAGE_NAME:$IMAGE_TAG" "$DOCKER_USERNAME/$IMAGE_NAME:v2.1.0"
    print_success "Tags criadas: $DOCKER_USERNAME/$IMAGE_NAME:$IMAGE_TAG"
    echo ""
fi

# Instruções de uso
echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Build Completo! 🎉                       ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📦 Para executar a imagem:${NC}"
echo ""
echo "  docker run -d -p 80:80 --name pdf-processor $IMAGE_NAME:$IMAGE_TAG"
echo ""
echo -e "${BLUE}🌐 Acessar a aplicação:${NC}"
echo ""
echo "  http://localhost"
echo ""
echo -e "${BLUE}🔍 Ver logs:${NC}"
echo ""
echo "  docker logs -f pdf-processor"
echo ""
echo -e "${BLUE}🛑 Parar container:${NC}"
echo ""
echo "  docker stop pdf-processor"
echo ""

if [ -n "$DOCKER_USERNAME" ]; then
    echo -e "${BLUE}📤 Para fazer push para Docker Hub:${NC}"
    echo ""
    echo "  docker push $DOCKER_USERNAME/$IMAGE_NAME:$IMAGE_TAG"
    echo "  docker push $DOCKER_USERNAME/$IMAGE_NAME:v2.1.0"
    echo ""
fi

echo -e "${GREEN}✨ Build concluído com sucesso!${NC}"
