import { useState, useCallback, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ethers } from "ethers";

import Navbar         from "./components/shared/Navbar";
import Toast          from "./components/shared/Toast";
import Home           from "./pages/Home";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import NotFound       from "./pages/NotFound";
import StudentLogin   from "./pages/StudentLogin";
import AdminDashboard from "./components/Admin/AdminDashboard";
import StudentPortal  from "./components/Student/StudentPortal";
import VerifyPage     from "./components/Verify/VerifyPage";

// Protected route — checks login AND role
function Protected({ children, isLoggedIn, role }) {
  const userRole = localStorage.getItem("user_role");

  if (!isLoggedIn) {
    if (role === "student") return <StudentLogin onLogin={() => {}} />;
    return <Login onLogin={() => {}} />;
  }

  // Wrong role → redirect to correct login
  if (role === "admin" && userRole === "student") {
    return <StudentLogin onLogin={() => {}} />;
  }
  if (role === "student" && userRole === "admin") {
    return <Login onLogin={() => {}} />;
  }

  return children;
}

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isLoggedIn, setIsLoggedIn]       = useState(!!localStorage.getItem("access_token"));
  const [toasts, setToasts]               = useState([]);
  const [theme, setTheme]                 = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

  const addToast = useCallback((type, message) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) { addToast("error", "MetaMask not installed"); return; }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer   = await provider.getSigner();
      setWalletAddress(await signer.getAddress());
      addToast("success", "Wallet connected!");
    } catch {
      addToast("error", "Wallet connection failed");
    }
  };

  const disconnectWallet = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch (e) {
      console.log("Revoke not supported:", e);
    }
    setWalletAddress(null);
    addToast("info", "Wallet disconnected");
  };

  const navbarProps = {
    walletAddress,
    onConnectWallet:    connectWallet,
    onDisconnectWallet: disconnectWallet,
    isLoggedIn,
    onLogin:        () => setIsLoggedIn(true),   // ← NEW: Navbar calls this after login
    onLogout:       () => setIsLoggedIn(false),
    theme,
    onToggleTheme:  toggleTheme,
  };

  return (
    <BrowserRouter>
      <Navbar {...navbarProps} />
      <Toast toasts={toasts} onRemove={removeToast} />

      <Routes>
        <Route path="/"              element={<Home />} />
        <Route path="/login"         element={<Login        onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/register"      element={<Register     onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/student-login" element={<StudentLogin onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/verify"        element={<VerifyPage   addToast={addToast} />} />

        <Route path="/admin" element={
          <Protected isLoggedIn={isLoggedIn} role="admin">
            <AdminDashboard addToast={addToast} />
          </Protected>
        } />

        <Route path="/student" element={
          <Protected isLoggedIn={isLoggedIn} role="student">
            <StudentPortal addToast={addToast} />
          </Protected>
        }/>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;