#!/bin/bash

echo "========================================"
echo "PDF Processor - Setup (Linux/Mac)"
echo "========================================"
echo ""

echo "[1/3] Instalando dependências do backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao instalar dependências do backend"
    exit 1
fi
cd ..

echo ""
echo "[2/3] Instalando dependências do frontend..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao instalar dependências do frontend"
    exit 1
fi
cd ..

echo ""
echo "[3/3] Configurando ambiente..."
cd backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Arquivo .env criado em backend/"
fi
cd ..

echo ""
echo "========================================"
echo "Setup concluído com sucesso!"
echo "========================================"
echo ""
echo "Para iniciar a aplicação:"
echo "  1. Terminal 1: cd backend && npm run dev"
echo "  2. Terminal 2: cd frontend && npm run dev"
echo "  3. Acesse: http://localhost:3000"
echo ""
echo "OU use Docker:"
echo "  docker-compose up --build"
echo ""
