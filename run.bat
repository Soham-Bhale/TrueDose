@echo off
setlocal enabledelayedexpansion
title TrueDose: Decentralized Pharmaceutical Supply Chain

:: Ensure execution from the directory where run.bat is located
cd /d "%~dp0"

cls
echo ======================================================================
echo   TrueDose: Decentralized Pharmaceutical Supply Chain Management
echo   Tamper-Evident Medicine Provenance and Verification Platform
echo ======================================================================
echo.

:: 1. Verify Node.js Environment
echo [1/4] Checking Node.js runtime...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your system PATH.
    echo Please install Node.js v18 or higher from https://nodejs.org
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo       - Detected Node.js %NODE_VERSION%

:: 2. Verify npm Package Manager
echo [2/4] Checking npm package manager...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed or not in your system PATH.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo       - Detected npm %NPM_VERSION%

:: 3. Check Dependencies
echo [3/4] Verifying workspace dependencies...
set MISSING_DEPS=0
if not exist "node_modules\" set MISSING_DEPS=1
if not exist "contracts\node_modules\" set MISSING_DEPS=1
if not exist "server\node_modules\" set MISSING_DEPS=1
if not exist "client\node_modules\" set MISSING_DEPS=1

if "!MISSING_DEPS!"=="1" (
    echo       - Missing package dependencies detected. Installing now...
    call npm install
    call npm run install:all
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to install workspace dependencies.
        pause
        exit /b 1
    )
    echo       - All workspace packages installed successfully.
) else (
    echo       - All dependencies verified: root, contracts, server, client.
)

:: 4. Verify Smart Contract Artifacts
echo [4/4] Checking smart contract compilation...
if not exist "contracts\artifacts\contracts\PharmaSupplyChain.sol\PharmaSupplyChain.json" (
    echo       - Smart contracts not compiled yet. Compiling now...
    call npm run compile:contracts
    if !errorlevel! neq 0 (
        echo [ERROR] Smart contract compilation failed.
        pause
        exit /b 1
    )
    echo       - Smart contracts compiled successfully.
) else (
    echo       - Smart contracts compiled and ready.
)

:: Launch Platform
echo.
echo ======================================================================
echo   Starting TrueDose Application Services
echo ======================================================================
echo   Web Portal:   http://localhost:5173
echo   API Backend:  http://localhost:5000
echo   Consortium:   EVM Proof-of-Authority Proofs Active
echo ======================================================================
echo.
echo Opening browser in 3 seconds...
start http://localhost:5173

echo.
echo Starting concurrent development servers...
echo Press Ctrl+C anytime to stop.
echo.

call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [NOTICE] Application process exited.
    pause
)
