@echo off
REM ============================================================
REM CertVerify — Quick Setup Script (Windows)
REM Run: setup.bat
REM ============================================================

echo ========================================
echo    CertVerify -- Project Setup
echo ========================================

REM ── Backend ──────────────────────────────────────────────────
echo [1/2] Setting up Backend (Django)...
cd backend

python -m venv venv
call venv\Scripts\activate

pip install -r requirements.txt

copy .env.example .env
echo Fill in backend\.env with your DB credentials and API keys.

echo.
echo After filling .env run:
echo   cd backend
echo   venv\Scripts\activate
echo   python manage.py makemigrations
echo   python manage.py migrate
echo   python manage.py createsuperuser
echo   python manage.py runserver

cd ..

REM ── Frontend ─────────────────────────────────────────────────
echo [2/2] Setting up Frontend (React)...
cd frontend

npm install

copy .env.example .env
echo Fill in frontend\.env with CONTRACT_ADDRESS and SEPOLIA_RPC_URL.

cd ..

echo.
echo ========================================
echo  Setup complete!
echo ========================================
echo.
echo Next steps:
echo  1. Install Foundry: https://book.getfoundry.sh/getting-started/installation
echo  2. Deploy contract: forge script script/Deploy.s.sol --broadcast
echo  3. Start backend:   cd backend ^&^& python manage.py runserver
echo  4. Start frontend:  cd frontend ^&^& npm run dev
echo.
pause
