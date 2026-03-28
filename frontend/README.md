# ⚛️ Frontend — React + Vite + Ethers.js

## Project Structure

```
src/
├── styles/
│   └── global.css                 ← CSS variables, reset, animations
│
├── components/
│   ├── shared/
│   │   ├── Navbar.jsx + .css      ← Fixed top navbar + wallet connect
│   │   ├── Button.jsx + .css      ← Reusable button (primary/ghost/danger)
│   │   ├── Input.jsx  + .css      ← Input + Select form fields
│   │   └── Toast.jsx  + .css      ← Auto-dismiss notifications
│   │
│   ├── Admin/
│   │   ├── AdminDashboard.jsx     ← Issue + Revoke certificates
│   │   └── AdminDashboard.css
│   │
│   ├── Student/
│   │   ├── StudentPortal.jsx      ← View certs + real QR codes
│   │   └── StudentPortal.css
│   │
│   └── Verify/
│       ├── VerifyPage.jsx         ← Public blockchain verification
│       └── VerifyPage.css
│
├── pages/
│   ├── Home.jsx + Home.css        ← Landing page
│   ├── Login.jsx + Login.css      ← Normal + MetaMask login
│   └── Register.jsx + Register.css
│
├── utils/
│   ├── api.js                     ← Axios instance + all API calls
│   └── wallet.js                  ← Ethers.js MetaMask helpers
│
├── contracts/
│   └── CertificateRegistry.js    ← Contract ABI + address
│
├── App.jsx                        ← Root router + protected routes
└── main.jsx                       ← Entry point
```

## CSS Rule — No Inline Styles

Every component has its own `.css` file:
```jsx
// ✅ Correct — separate CSS file
import "./AdminDashboard.css";
<div className="admin__card">

// ❌ Wrong — no inline styles
<div style={{ background: "red" }}>
```

## Install & Run

```bash
npm install
cp .env.example .env
# Fill VITE_CONTRACT_ADDRESS and VITE_SEPOLIA_RPC_URL

npm run dev   # http://localhost:5173
```

## Routes

| Route      | Auth      | Description                  |
|------------|-----------|------------------------------|
| /          | Public    | Landing page                 |
| /login     | Public    | Login (normal + MetaMask)    |
| /register  | Public    | Register institute            |
| /verify    | Public    | Verify any certificate        |
| /admin     | Protected | Issue + revoke certificates   |
| /student   | Protected | View my certificates + QR     |
