@echo off
echo ========================================
echo PDF Processor - Setup (Windows)
echo ========================================
echo.

echo [1/3] Instalando dependencias do backend...
cd backend
call npm install
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias do backend
    pause
    exit /b 1
)
cd ..

echo.
echo [2/3] Instalando dependencias do frontend...
cd frontend
call npm install
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias do frontend
    pause
    exit /b 1
)
cd ..

echo.
echo [3/3] Configurando ambiente...
cd backend
if not exist .env (
    copy .env.example .env
    echo Arquivo .env criado em backend/
)
cd ..

echo.
echo ========================================
echo Setup concluido com sucesso!
echo ========================================
echo.
echo Para iniciar a aplicacao:
echo   1. Abra um terminal e execute: cd backend ^&^& npm run dev
echo   2. Abra outro terminal e execute: cd frontend ^&^& npm run dev
echo   3. Acesse: http://localhost:3000
echo.
echo OU use Docker:
echo   docker-compose up --build
echo.
pause
