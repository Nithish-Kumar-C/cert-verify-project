import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../utils/api";
import Button from "../components/shared/Button";
import Input from "../components/shared/Input";
import "./Register.css";

function Register({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ username: "", email: "", password: "", institute_name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleRegister = async () => {
    const { username, email, password, institute_name } = form;
    if (!username || !email || !password || !institute_name) {
      setError("All fields are required"); return;
    }
    setLoading(true); setError("");
    try {
      const res = await authAPI.register(form);
      const { tokens } = res.data;
      localStorage.setItem("access_token",  tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
      if (onLogin) onLogin({ username, email, institute_name });
      navigate("/admin");
    } catch (e) {
      setError(e.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-card__icon">🏛</div>
        <h1 className="register-card__title">Register Institute</h1>
        <p className="register-card__sub">Create an admin account for your institute</p>

        <div className="register-card__form">
          {error && (
            <p style={{ fontSize: "0.83rem", color: "var(--color-danger)" }}>{error}</p>
          )}
          <Input
            label="Institute Name" name="institute_name"
            placeholder="Anna University" value={form.institute_name}
            onChange={handleChange} required
          />
          <div className="register-card__row">
            <Input
              label="Username" name="username" placeholder="admin_user"
              value={form.username} onChange={handleChange} required
            />
            <Input
              label="Email" name="email" type="email" placeholder="admin@univ.edu"
              value={form.email} onChange={handleChange} required
            />
          </div>
          <Input
            label="Password" name="password" type="password" placeholder="••••••••"
            value={form.password} onChange={handleChange} required
            hint="Minimum 8 characters"
          />
          <Button variant="success" full loading={loading} onClick={handleRegister}>
            Create Account
          </Button>
        </div>

        <div className="register-card__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
