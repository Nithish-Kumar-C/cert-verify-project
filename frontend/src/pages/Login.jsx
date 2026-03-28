import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/shared/Button";
import Input from "../components/shared/Input";
import { authAPI } from "../utils/api";
import { loginWithMetaMask } from "../utils/wallet";
import "./Login.css";

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [tab,     setTab]     = useState("login");   // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [regForm,   setRegForm]   = useState({ username: "", email: "", password: "", institute_name: "" });

  const handleLoginChange = e => setLoginForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleRegChange   = e => setRegForm(p =>   ({ ...p, [e.target.name]: e.target.value }));

  const saveTokens = (tokens) => {
    localStorage.setItem("access_token",  tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);
  };

  const handleLogin = async () => {
    setLoading(true); setError("");
    try {
      const res = await authAPI.login(loginForm);
      saveTokens(res.data.tokens);
      onLogin && onLogin(res.data.user);
      navigate("/admin");
    } catch (e) {
      setError(e.response?.data?.error || "Login failed. Check your credentials.");
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    setLoading(true); setError("");
    try {
      const res = await authAPI.register(regForm);
      saveTokens(res.data.tokens);
      onLogin && onLogin({});
      navigate("/admin");
    } catch (e) {
      setError(e.response?.data?.error || "Registration failed.");
    } finally { setLoading(false); }
  };

  const handleMetaMask = async () => {
    setLoading(true); setError("");
    try {
      const result = await loginWithMetaMask();
      onLogin && onLogin(result.user);
      navigate("/admin");
    } catch (e) {
      setError(e.message || "MetaMask login failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="login">
      <div className="login__card">

        <div className="login__brand">
          <span className="login__brand-icon">🎓</span>
          <span className="login__brand-name">CertVerify</span>
        </div>

        <h1 className="login__title">
          {tab === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="login__sub">
          {tab === "login" ? "Sign in to your institute portal" : "Register your institute"}
        </p>

        {/* Tab switcher */}
        <div className="login__tabs">
          <button className={`login__tab ${tab === "login" ? "login__tab--active" : ""}`} onClick={() => setTab("login")}>Sign In</button>
          <button className={`login__tab ${tab === "register" ? "login__tab--active" : ""}`} onClick={() => setTab("register")}>Register</button>
        </div>

        {error && <div className="login__error">{error}</div>}

        {/* Login Form */}
        {tab === "login" && (
          <div className="login__form">
            <Input label="Username" name="username" placeholder="your_username" value={loginForm.username} onChange={handleLoginChange} />
            <Input label="Password" name="password" type="password" placeholder="••••••••" value={loginForm.password} onChange={handleLoginChange} />
            <Button variant="primary" full loading={loading} onClick={handleLogin} disabled={!loginForm.username || !loginForm.password}>
              Sign In
            </Button>
          </div>
        )}

        {/* Register Form */}
        {tab === "register" && (
          <div className="login__form">
            <Input label="Institute Name" name="institute_name" placeholder="Anna University" value={regForm.institute_name} onChange={handleRegChange} required />
            <Input label="Username"       name="username"       placeholder="admin_anna"      value={regForm.username}       onChange={handleRegChange} required />
            <Input label="Email"          name="email"          type="email" placeholder="admin@annauniv.edu" value={regForm.email} onChange={handleRegChange} required />
            <Input label="Password"       name="password"       type="password" placeholder="••••••••"        value={regForm.password} onChange={handleRegChange} required />
            <Button variant="primary" full loading={loading} onClick={handleRegister} disabled={!regForm.username || !regForm.password || !regForm.institute_name}>
              Create Account
            </Button>
          </div>
        )}

        <div className="login__divider"><span>or</span></div>

        {/* MetaMask Login */}
        <Button variant="ghost" full onClick={handleMetaMask} loading={loading}>
          🦊 Continue with MetaMask
        </Button>

        <p className="login__verify-link">
          Just want to verify? <a onClick={() => navigate("/verify")}>Verify a certificate →</a>
        </p>

      </div>
    </div>
  );
}

export default Login;
