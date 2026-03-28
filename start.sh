#!/bin/bash
# ============================================================
# CertVerify — Quick Start Script
# Run this from the project root: bash start.sh
# ============================================================

echo ""
echo "🎓 CertVerify — Blockchain Certificate Verification"
echo "===================================================="
echo ""

# ── Check prerequisites ──────────────────────────────────────
command -v python3 >/dev/null 2>&1 || { echo "❌ Python3 not found. Install it first."; exit 1; }
command -v node    >/dev/null 2>&1 || { echo "❌ Node.js not found. Install it first."; exit 1; }
command -v npm     >/dev/null 2>&1 || { echo "❌ npm not found. Install it first."; exit 1; }

echo "✅ Prerequisites found"
echo ""

# ── Backend setup ─────────────────────────────────────────────
echo "📦 Setting up Django backend..."
cd backend

if [ ! -d "venv" ]; then
  python3 -m venv venv
  echo "   Virtual environment created"
fi

source venv/bin/activate
pip install -r requirements.txt -q

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "   ⚠️  Created backend/.env from example — please fill in your values!"
fi

python manage.py migrate --run-syncdb 2>/dev/null
echo "   Database migrations applied"

cd ..

# ── Frontend setup ────────────────────────────────────────────
echo ""
echo "📦 Installing React frontend dependencies..."
cd frontend

npm install --silent

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "   ⚠️  Created frontend/.env from example — please fill in your values!"
fi

cd ..

# ── Done ──────────────────────────────────────────────────────
echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo ""
echo "  1. Deploy smart contract (blockchain/):"
echo "     cd blockchain && forge script script/Deploy.s.sol --rpc-url \$SEPOLIA_RPC_URL --broadcast"
echo ""
echo "  2. Start Django backend:"
echo "     cd backend && source venv/bin/activate && python manage.py runserver"
echo ""
echo "  3. Start React frontend (new terminal):"
echo "     cd frontend && npm run dev"
echo ""
echo "  4. Open browser: http://localhost:5173"
echo ""
echo "  Demo credentials: username=demo_admin  password=demo1234"
echo "  (run: cd backend && python manage.py seed_demo)"
echo ""
