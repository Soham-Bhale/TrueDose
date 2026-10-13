@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title TrueDose: Pharmaceutical Supply Chain Platform

cls
echo ======================================================================
echo   TrueDose: Decentralized Pharmaceutical Supply Chain Management
echo   Tamper-Evident Medicine Provenance ^& Anti-Counterfeit Platform
echo ======================================================================
echo.

:: 1. Verify Node.js Environment
echo [1/5] Checking Node.js runtime...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your system PATH.
    echo Please download and install Node.js (v18 or higher) from https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo       - Found Node.js %NODE_VERSION%

:: 2. Verify npm Package Manager
echo [2/5] Checking npm package manager...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed or not in your system PATH.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo       - Found npm %NPM_VERSION%

:: 3. Check Dependencies
echo [3/5] Verifying workspace dependencies...
set MISSING_DEPS=0

if not exist "node_modules\" set MISSING_DEPS=1
if not exist "contracts\node_modules\" set MISSING_DEPS=1
if not exist "server\node_modules\" set MISSING_DEPS=1
if not exist "client\node_modules\" set MISSING_DEPS=1

if %MISSING_DEPS% equ 1 (
    echo       - Missing package dependencies detected. Installing now...
    echo       - Installing root dependencies...
    call npm install
    echo       - Installing sub-package dependencies...
    call npm run install:all
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install workspace dependencies.
        pause
        exit /b 1
    )
    echo       - All workspace packages installed successfully.
) else (
    echo       - Dependencies verified (root, contracts, server, client).
)

:: 4. Verify Smart Contract Artifacts
echo [4/5] Checking smart contract compilation...
if not exist "contracts\artifacts\contracts\PharmaSupplyChain.sol\PharmaSupplyChain.json" (
    echo       - Smart contracts not yet compiled. Compiling Solidity contracts...
    call npm run compile:contracts
    if %errorlevel% neq 0 (
        echo [ERROR] Smart contract compilation failed.
        pause
        exit /b 1
    )
    echo       - Smart contracts compiled successfully.
) else (
    echo       - Solidity smart contracts compiled and ready.
)

:: 5. Execute Test Suite
echo [5/5] Executing automated test suite (50 Invariants)...
echo       - Running Hardhat unit tests ^& Express API regression suite...
echo.
call npm test
if %errorlevel% neq 0 (
    echo.
    echo ======================================================================
    echo [WARNING] Some automated tests reported failures.
    echo ======================================================================
    set /p PROCEED="Do you want to proceed and launch the application anyway? (Y/N): "
    if /i not "!PROCEED!"=="Y" (
        echo [ABORTED] Application startup canceled by user.
        pause
        exit /b 1
    )
) else (
    echo.
    echo       - All 50 test invariants PASSED successfully!
)

:: Launch Platform
echo.
echo ======================================================================
echo   Starting TrueDose Application Services
echo ======================================================================
echo   - Web Portal:   http://localhost:5173
echo   - API Backend:  http://localhost:5000
echo   - Consortium:   EVM Proof-of-Authority (PoA)
echo ======================================================================
echo.
echo Launching your default browser...
start http://localhost:5173

echo.
echo Press Ctrl+C in this terminal window anytime to stop the servers.
echo Starting concurrent development servers...
echo.
call npm run dev
