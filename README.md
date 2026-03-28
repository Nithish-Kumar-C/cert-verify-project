# 🎓 CertVerify — Blockchain Certificate Verification System

A full-stack Web3 project using React, Django, MySQL, Solidity, Foundry and Ethers.js.

---

## 📁 Project Structure

```
cert-verify-project/
├── frontend/          ← React + Vite + Ethers.js  (separate CSS files per component)
├── backend/           ← Django REST API + MySQL
└── blockchain/        ← Solidity smart contract + Foundry tests
```

---

## 🛠 Tech Stack

| Layer          | Technology               |
|----------------|--------------------------|
| Smart Contract | Solidity 0.8.19          |
| Testing        | Foundry                  |
| Web3 Bridge    | Ethers.js v6             |
| Frontend       | React 18 + Vite          |
| Backend        | Django 4.2 + DRF         |
| Database       | MySQL 8                  |
| File Storage   | IPFS via Pinata          |
| Blockchain     | Ethereum Sepolia Testnet |

---

## 🚀 Setup

### Step 1 — Blockchain

```bash
cd blockchain
curl -L https://foundry.paradigm.xyz | bash && foundryup
forge install foundry-rs/forge-std
forge test -v

cp .env.example .env
# Fill PRIVATE_KEY, SEPOLIA_RPC_URL, ETHERSCAN_API_KEY

forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify
# Copy deployed address to backend/.env and frontend/.env
```

### Step 2 — Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env    # fill all values

# Create MySQL database
mysql -u root -p -e "CREATE DATABASE certverify_db CHARACTER SET utf8mb4;"

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver     # http://localhost:8000
```

### Step 3 — Frontend

```bash
cd frontend
npm install
cp .env.example .env   # fill CONTRACT_ADDRESS, SEPOLIA_RPC_URL
npm run dev            # http://localhost:5173
```

---

## 🔄 User Flow

```
Institute registers → logs in (normal or MetaMask)
  → fills certificate form → Django hashes data
  → hash stored in MySQL + Ethereum blockchain
  → student receives email with link
  → student shares /verify?hash=0x... with recruiter
  → recruiter opens link → Ethers.js reads blockchain
  → ✅ VALID or ❌ NOT FOUND — no human involved
```

---

## 🌐 API Endpoints

| Method | Endpoint                           | Auth   | Description           |
|--------|------------------------------------|--------|-----------------------|
| POST   | /api/auth/register/                | Public | Register institute    |
| POST   | /api/auth/login/                   | Public | Normal login          |
| POST   | /api/auth/metamask-login/          | Public | MetaMask login        |
| GET    | /api/auth/me/                      | JWT    | Current user          |
| POST   | /api/certificates/issue/           | JWT    | Issue certificate     |
| GET    | /api/certificates/                 | JWT    | List certificates     |
| GET    | /api/certificates/my/              | JWT    | Student certificates  |
| GET    | /api/certificates/verify/[hash]/   | Public | Verify certificate    |
| POST   | /api/certificates/revoke/[hash]/   | JWT    | Revoke certificate    |

---

## ⛓ Smart Contract

```
issueCertificate(hash, name, course, grade, ipfsCID) — admin only
verifyCertificate(hash) — public, returns VALID / REVOKED / NOT_FOUND
revokeCertificate(hash) — admin only
transferAdmin(newAddr)  — admin only
```

---

## ✅ Bonus Features

- IPFS PDF storage via Pinata
- Real QR codes on certificates (qrcode.react)
- Revoke feature on blockchain
- MetaMask login with signature verification
