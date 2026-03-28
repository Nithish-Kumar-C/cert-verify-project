# 🐍 Backend — Django REST Framework + MySQL

## Project Structure

```
backend/
├── cert_verify/
│   ├── settings.py     ← All Django config (DB, JWT, CORS, Email)
│   ├── urls.py         ← Root URL routing
│   ├── wsgi.py
│   └── asgi.py
│
├── certificates/
│   ├── models.py            ← Institute, Student, Certificate models
│   ├── views.py             ← Issue, verify, revoke, list APIs
│   ├── serializers.py       ← DRF serializers
│   ├── urls.py              ← Certificate URL patterns
│   ├── blockchain_service.py← Web3.py → Ethereum calls
│   ├── ipfs_service.py      ← Pinata IPFS upload
│   ├── pdf_service.py       ← ReportLab PDF generation
│   ├── email_service.py     ← SMTP email to student
│   └── admin.py             ← Django admin registration
│
├── users/
│   ├── models.py       ← UserProfile (role + wallet_address)
│   ├── views.py        ← register, login, metamask_login, me
│   ├── urls.py
│   └── admin.py
│
├── manage.py
├── requirements.txt
├── setup_db.sql        ← MySQL database creation script
└── .env.example        ← Environment variables template
```

## Setup

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# 2. Install packages
pip install -r requirements.txt

# 3. Create MySQL DB
mysql -u root -p < setup_db.sql

# 4. Configure environment
cp .env.example .env
# Edit .env with your values

# 5. Run migrations
python manage.py makemigrations
python manage.py migrate

# 6. Create admin user
python manage.py createsuperuser

# 7. Start server
python manage.py runserver
```

## Key Environment Variables

```env
DJANGO_SECRET_KEY=...        # Django secret key
DB_NAME=certverify_db        # MySQL database name
DB_USER=root                 # MySQL username
DB_PASSWORD=...              # MySQL password
CONTRACT_ADDRESS=0x...       # Deployed Solidity contract
ADMIN_PRIVATE_KEY=0x...      # Wallet that deployed the contract
SEPOLIA_RPC_URL=https://...  # Infura/Alchemy Sepolia endpoint
PINATA_API_KEY=...           # For IPFS PDF upload
EMAIL_HOST_USER=...          # Gmail address
EMAIL_HOST_PASSWORD=...      # Gmail App Password
```

## API Reference

| Method | Endpoint                            | Auth   |
|--------|-------------------------------------|--------|
| POST   | /api/auth/register/                 | Public |
| POST   | /api/auth/login/                    | Public |
| POST   | /api/auth/metamask-login/           | Public |
| GET    | /api/auth/me/                       | JWT    |
| POST   | /api/certificates/issue/            | JWT    |
| GET    | /api/certificates/                  | JWT    |
| GET    | /api/certificates/my/               | JWT    |
| GET    | /api/certificates/verify/[hash]/    | Public |
| POST   | /api/certificates/revoke/[hash]/    | JWT    |
