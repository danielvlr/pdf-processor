@echo off
REM ============================================
REM PDF Processor - Docker Build Script (Windows)
REM ============================================

setlocal enabledelayedexpansion

REM Configurações
set IMAGE_NAME=pdf-processor
set IMAGE_TAG=latest

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║         PDF Processor - Docker Build                 ║
echo ║                 Version 2.1.0                         ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

REM Verificar se Docker está rodando
echo [▶] Verificando Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo [✗] Docker não está rodando!
    echo Por favor, inicie o Docker Desktop e tente novamente.
    exit /b 1
)
echo [✓] Docker está rodando
echo.

REM Mostrar informações
echo [ℹ] Image name: %IMAGE_NAME%
echo [ℹ] Tag: %IMAGE_TAG%
echo.

REM Build da imagem
echo [▶] Iniciando build da imagem...
echo.

docker build ^
    --tag %IMAGE_NAME%:%IMAGE_TAG% ^
    --tag %IMAGE_NAME%:v2.1.0 ^
    --label "version=2.1.0" ^
    --label "description=PDF Processor - Batch PDF processing" ^
    --label "maintainer=seu-email@example.com" ^
    --progress=plain ^
    .

if errorlevel 1 (
    echo.
    echo [✗] Build falhou!
    exit /b 1
)

echo.
echo [✓] Build concluído com sucesso!
echo.

REM Mostrar informações da imagem
echo [▶] Informações da imagem:
docker images %IMAGE_NAME%:%IMAGE_TAG%
echo.

REM Instruções de uso
echo ╔═══════════════════════════════════════════════════════╗
echo ║              Build Completo! 🎉                       ║
echo ╚═══════════════════════════════════════════════════════╝
echo.
echo 📦 Para executar a imagem:
echo.
echo   docker run -d -p 80:80 --name pdf-processor %IMAGE_NAME%:%IMAGE_TAG%
echo.
echo 🌐 Acessar a aplicação:
echo.
echo   http://localhost
echo.
echo 🔍 Ver logs:
echo.
echo   docker logs -f pdf-processor
echo.
echo 🛑 Parar container:
echo.
echo   docker stop pdf-processor
echo.
echo ✨ Build concluído com sucesso!
echo.

pause
