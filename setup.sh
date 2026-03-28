#!/bin/bash
# ============================================================
# CertVerify — Quick Setup Script (Mac / Linux)
# Run: chmod +x setup.sh && ./setup.sh
# ============================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   CertVerify — Project Setup           ${NC}"
echo -e "${BLUE}========================================${NC}\n"

# ── 1. Blockchain ─────────────────────────────────────────────
echo -e "${YELLOW}[1/3] Setting up Blockchain (Foundry)...${NC}"
cd blockchain

if ! command -v forge &> /dev/null; then
  echo "Installing Foundry..."
  curl -L https://foundry.paradigm.xyz | bash
  source ~/.bashrc
  foundryup
fi

if [ ! -d "lib/forge-std" ]; then
  forge install foundry-rs/forge-std --no-commit
fi

echo -e "${GREEN}Running smart contract tests...${NC}"
forge test -v

cp .env.example .env
echo -e "${YELLOW}⚠  Fill in blockchain/.env with your PRIVATE_KEY and SEPOLIA_RPC_URL${NC}"
echo -e "${YELLOW}   Then run: forge script script/Deploy.s.sol --rpc-url \$SEPOLIA_RPC_URL --broadcast${NC}\n"
cd ..

# ── 2. Backend ────────────────────────────────────────────────
echo -e "${YELLOW}[2/3] Setting up Backend (Django)...${NC}"
cd backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt --quiet

cp .env.example .env
echo -e "${YELLOW}⚠  Fill in backend/.env with your DB credentials, RPC URL, etc.${NC}\n"

echo -e "${GREEN}Run these commands after filling .env:${NC}"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  mysql -u root -p < setup_db.sql"
echo "  python manage.py makemigrations"
echo "  python manage.py migrate"
echo "  python manage.py createsuperuser"
echo "  python manage.py runserver"
echo ""
cd ..

# ── 3. Frontend ───────────────────────────────────────────────
echo -e "${YELLOW}[3/3] Setting up Frontend (React)...${NC}"
cd frontend

npm install --silent

cp .env.example .env
echo -e "${YELLOW}⚠  Fill in frontend/.env with CONTRACT_ADDRESS and SEPOLIA_RPC_URL${NC}\n"

echo -e "${GREEN}Run to start frontend:${NC}"
echo "  cd frontend && npm run dev"
echo ""
cd ..

# ── Done ──────────────────────────────────────────────────────
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Setup complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Deploy contract:  cd blockchain && forge script script/Deploy.s.sol --broadcast"
echo "  2. Copy contract address to backend/.env and frontend/.env"
echo "  3. Start backend:    cd backend && python manage.py runserver"
echo "  4. Start frontend:   cd frontend && npm run dev"
echo ""
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  Django Admin: http://localhost:8000/admin"
