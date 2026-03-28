import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/shared/Button";
import Input  from "../components/shared/Input";
import { authAPI } from "../utils/api";
import "./Login.css";

function StudentLogin({ onLogin }) {
  const navigate = useNavigate();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.studentLogin(form);
      localStorage.setItem("access_token",  res.data.tokens.access);
      localStorage.setItem("refresh_token", res.data.tokens.refresh);
      localStorage.setItem("user_role",     "student");
      if (onLogin) onLogin(res.data.user);
      navigate("/student");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="login">
      <div className="login__card">

        {/* Brand */}
        <div className="login__brand">
          <span className="login__brand-icon">🎓</span>
          <span className="login__brand-name">CertVerify</span>
        </div>

        <h1 className="login__title">Student Portal</h1>
        <p className="login__sub">Login to view your blockchain certificates</p>

        {/* Info box */}
        <div className="login__info-box" style={{ marginBottom: "1.25rem" }}>
          🔑 <strong>Password</strong> = First 2 letters of your name + Roll Number
          <br />
          <span style={{ opacity: 0.75 }}>
            Example: <strong>Ni</strong>thish Kumar + 23106035 → <code>Ni23106035</code>
          </span>
        </div>

        {/* Error */}
        {error && <div className="login__error">{error}</div>}

        {/* Form */}
        <div className="login__form">
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={handleChange}
            onKeyDown={handleKey}
            autoFocus
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="e.g. Ni23106035"
            value={form.password}
            onChange={handleChange}
            onKeyDown={handleKey}
          />

          <Button
            variant="primary"
            full
            loading={loading}
            onClick={handleSubmit}
            disabled={!form.email || !form.password}
          >
            🎓 View My Certificates
          </Button>
        </div>

        <div className="login__divider"><span>or</span></div>

        <p className="login__verify-link">
          Are you an institute?{" "}
          <a onClick={() => navigate("/login")} style={{ cursor: "pointer" }}>
            Institute Login →
          </a>
        </p>

        <p className="login__verify-link" style={{ marginTop: "0.5rem" }}>
          Just want to verify?{" "}
          <a onClick={() => navigate("/verify")} style={{ cursor: "pointer" }}>
            Verify a certificate →
          </a>
        </p>

      </div>
    </div>
  );
}

export default StudentLogin;