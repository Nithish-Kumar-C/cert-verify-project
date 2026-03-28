import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { shortAddress } from "../../utils/wallet";
import Button from "./Button";
import Input  from "./Input";
import { authAPI } from "../../utils/api";
import { loginWithMetaMask } from "../../utils/wallet";
import "./Navbar.css";

const ALL_NAV_LINKS = [
  { to: "/",        label: "Home",    end: true,  roles: ["all"]     },
  { to: "/admin",   label: "Admin",   end: false, roles: ["admin"]   },
  { to: "/student", label: "Student", end: false, roles: ["student"] },
  { to: "/verify",  label: "Verify",  end: false, roles: ["all"]     },
];

function getNavLinks(userRole) {
  if (!userRole) {
    return ALL_NAV_LINKS.filter(link => link.roles.includes("all"));
  }
  return ALL_NAV_LINKS.filter(link =>
    link.roles.includes("all") || link.roles.includes(userRole)
  );
}

/* ── Admin Login Panel ─────────────────────────────────────── */
function AdminPanel({ onLoginSuccess, onClose }) {
  const [tab,     setTab]     = useState("login");
  const [form,    setForm]    = useState({ username: "", password: "" });
  const [regForm, setRegForm] = useState({ username: "", email: "", password: "", institute_name: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.username || !form.password) { setError("All fields required"); return; }
    setLoading(true); setError("");
    try {
      const res = await authAPI.login(form);
      localStorage.setItem("access_token",  res.data.tokens.access);
      localStorage.setItem("refresh_token", res.data.tokens.refresh);
      localStorage.setItem("user_role", "admin");
      onLoginSuccess({ role: "admin", ...res.data.user });
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || "Invalid credentials");
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!regForm.username || !regForm.email || !regForm.password || !regForm.institute_name) {
      setError("All fields required"); return;
    }
    setLoading(true); setError("");
    try {
      const res = await authAPI.register(regForm);
      localStorage.setItem("access_token",  res.data.tokens.access);
      localStorage.setItem("refresh_token", res.data.tokens.refresh);
      localStorage.setItem("user_role", "admin");
      onLoginSuccess({ role: "admin", username: regForm.username, institute_name: regForm.institute_name, is_approved: false });
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || "Registration failed");
    } finally { setLoading(false); }
  };

  const handleMetaMask = async () => {
    setLoading(true); setError("");
    try {
      const result = await loginWithMetaMask();
      localStorage.setItem("user_role", "admin");
      onLoginSuccess({ role: "admin", ...result.user });
      onClose();
    } catch (e) {
      setError(e.message || "MetaMask login failed");
    } finally { setLoading(false); }
  };

  const handleKey = (e) => { if (e.key === "Enter") tab === "login" ? handleLogin() : handleRegister(); };

  return (
    <div className="npanel">
      <div className="npanel__header npanel__header--admin">
        <div className="npanel__header-left">
          <div className="npanel__icon">🏛️</div>
          <div>
            <h3 className="npanel__title">Institute Portal</h3>
            <p className="npanel__sub">Issue and manage certificates</p>
          </div>
        </div>
        <button className="npanel__close" onClick={onClose}>✕</button>
      </div>

      <div className="npanel__body">
        <div className="npanel__tabs">
          <button className={`npanel__tab ${tab === "login" ? "npanel__tab--active" : ""}`} onClick={() => { setTab("login"); setError(""); }}>Sign In</button>
          <button className={`npanel__tab ${tab === "register" ? "npanel__tab--active" : ""}`} onClick={() => { setTab("register"); setError(""); }}>Register</button>
        </div>

        {error && <div className="npanel__error">⚠️ {error}</div>}

        {tab === "login" && (
          <div className="npanel__form">
            <Input label="Username" name="username" placeholder="your_username"
              value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} onKeyDown={handleKey} />
            <Input label="Password" name="password" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} onKeyDown={handleKey} />
            <Button variant="primary" full loading={loading} onClick={handleLogin} disabled={!form.username || !form.password}>
              Sign In →
            </Button>
            <div className="npanel__divider"><span>or</span></div>
            <Button variant="ghost" full loading={loading} onClick={handleMetaMask}>
              🦊 MetaMask Login
            </Button>
          </div>
        )}

        {tab === "register" && (
          <div className="npanel__form">
            <div className="npanel__info">ℹ️ Admin approval required before issuing certificates.</div>
            <Input label="Institute Name" placeholder="Anna University"
              value={regForm.institute_name} onChange={e => setRegForm(p => ({ ...p, institute_name: e.target.value }))} onKeyDown={handleKey} />
            <Input label="Username" placeholder="admin_anna"
              value={regForm.username} onChange={e => setRegForm(p => ({ ...p, username: e.target.value }))} onKeyDown={handleKey} />
            <Input label="Email" type="email" placeholder="admin@annauniv.edu"
              value={regForm.email} onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))} onKeyDown={handleKey} />
            <Input label="Password" type="password" placeholder="min 8 characters"
              value={regForm.password} onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))} onKeyDown={handleKey} />
            <Button variant="primary" full loading={loading} onClick={handleRegister}
              disabled={!regForm.username || !regForm.password || !regForm.institute_name}>
              Create Account →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Student Login Panel ───────────────────────────────────── */
function StudentPanel({ onLoginSuccess, onClose }) {
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError("All fields required"); return; }
    setLoading(true); setError("");
    try {
      const res = await authAPI.studentLogin(form);
      localStorage.setItem("access_token",  res.data.tokens.access);
      localStorage.setItem("refresh_token", res.data.tokens.refresh);
      localStorage.setItem("user_role", "student");
      onLoginSuccess({ role: "student", ...res.data.user });
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || "Invalid email or password");
    } finally { setLoading(false); }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div className="npanel">
      <div className="npanel__header npanel__header--student">
        <div className="npanel__header-left">
          <div className="npanel__icon">🎓</div>
          <div>
            <h3 className="npanel__title">Student Portal</h3>
            <p className="npanel__sub">View your certificates</p>
          </div>
        </div>
        <button className="npanel__close" onClick={onClose}>✕</button>
      </div>

      <div className="npanel__body">
        <div className="npanel__hint">
          🔑 Password = First 2 letters of your name + Roll Number
          <br /><code>Nithish Kumar + 23106035 → Ni23106035</code>
        </div>

        {error && <div className="npanel__error">⚠️ {error}</div>}

        <div className="npanel__form">
          <Input label="Email Address" type="email" placeholder="your@email.com"
            value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} onKeyDown={handleKey} />
          <Input label="Password" type="password" placeholder="e.g. Ni23106035"
            value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} onKeyDown={handleKey} />
          <Button variant="primary" full loading={loading} onClick={handleLogin} disabled={!form.email || !form.password}>
            View My Certificates →
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── User Dropdown (after login) ───────────────────────────── */
function UserDropdown({ user, onLogout, onGo }) {
  const [open, setOpen] = useState(false);
  const isAdmin = user.role === "admin";
  const name    = isAdmin ? (user.institute_name || user.username) : (user.name || user.email?.split("@")[0]);

  return (
    <div className="ndrop">
      <button className={`ndrop__btn ${isAdmin ? "ndrop__btn--admin" : "ndrop__btn--student"}`} onClick={() => setOpen(p => !p)}>
        <span className="ndrop__avatar">{isAdmin ? "🏛️" : "🎓"}</span>
        <span className="ndrop__name">{name}</span>
        <span className="ndrop__arrow">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <>
          <div className="ndrop__backdrop" onClick={() => setOpen(false)} />
          <div className="ndrop__menu">
            <div className="ndrop__menu-header">
              <div className="ndrop__menu-role">{isAdmin ? "Institute Admin" : "Student"}</div>
              <div className="ndrop__menu-name">{name}</div>
              {user.email && <div className="ndrop__menu-email">{user.email}</div>}
            </div>
            {isAdmin && user.is_approved === false && (
              <div className="ndrop__pending">⏳ Awaiting approval</div>
            )}
            {isAdmin && user.is_approved !== false && (
              <div className="ndrop__approved">✅ Approved</div>
            )}
            <div className="ndrop__menu-body">
              <button className="ndrop__item" onClick={() => { onGo(); setOpen(false); }}>
                {isAdmin ? "🏛️ Admin Dashboard" : "🎓 My Certificates"}
              </button>
              <button className="ndrop__item ndrop__item--danger" onClick={() => { onLogout(); setOpen(false); }}>
                🚪 Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main Navbar ───────────────────────────────────────────── */
function Navbar({ walletAddress, onConnectWallet, onDisconnectWallet, isLoggedIn, onLogin, onLogout, theme, onToggleTheme }) {
  const navigate = useNavigate();
  const [open,        setOpen]        = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [loggedUser,  setLoggedUser]  = useState(() => {
    const token = localStorage.getItem("access_token");
    const role  = localStorage.getItem("user_role");
    if (!token) return null;
    return role ? { role } : null;
  });

  const navLinks = getNavLinks(loggedUser?.role || null);

  const closePanel  = () => setActivePanel(null);
  const closeMobile = () => setOpen(false);

  const handleLoginSuccess = (user) => {
    setLoggedUser(user);
    if (onLogin) onLogin(); // ← tells App.jsx user is now logged in ✅
    navigate(user.role === "admin" ? "/admin" : "/student");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    setLoggedUser(null);
    if (onLogout) onLogout();
    if (onDisconnectWallet) onDisconnectWallet();
    navigate("/");
  };

  const handleGo = () => {
    navigate(loggedUser?.role === "admin" ? "/admin" : "/student");
  };

  const openPanel = (panel) => {
    setActivePanel(activePanel === panel ? null : panel);
    setOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar__inner">

          <NavLink to="/" className="navbar__brand" onClick={closeMobile}>
            <div className="navbar__brand-icon">🎓</div>
            <span className="navbar__brand-name">CertVerify</span>
          </NavLink>

          <ul className="navbar__nav">
            {navLinks.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink to={to} end={end}
                  className={({ isActive }) => "navbar__link" + (isActive ? " navbar__link--active" : "")}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="navbar__right">
            <button className="navbar__theme-btn" onClick={onToggleTheme}
              title={theme === "dark" ? "Switch to Light" : "Switch to Dark"}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            <button className="navbar__wallet-btn"
              onClick={walletAddress ? onDisconnectWallet : onConnectWallet}>
              <span className={`navbar__dot ${walletAddress ? "" : "navbar__dot--off"}`} />
              {walletAddress ? `${shortAddress(walletAddress)} ✕` : "Connect Wallet"}
            </button>

            {loggedUser ? (
              <UserDropdown user={loggedUser} onLogout={handleLogout} onGo={handleGo} />
            ) : (
              <>
                <button
                  className={`navbar__portal-btn navbar__portal-btn--admin ${activePanel === "admin" ? "navbar__portal-btn--active" : ""}`}
                  onClick={() => openPanel("admin")}
                >
                  🏛️ Admin Login
                </button>
                <button
                  className={`navbar__portal-btn navbar__portal-btn--student ${activePanel === "student" ? "navbar__portal-btn--active" : ""}`}
                  onClick={() => openPanel("student")}
                >
                  🎓 Student Login
                </button>
              </>
            )}

            <button
              className={`navbar__hamburger ${open ? "navbar__hamburger--open" : ""}`}
              onClick={() => setOpen(p => !p)}
              aria-label="Toggle menu"
            >
              <span className="navbar__bar" />
              <span className="navbar__bar" />
              <span className="navbar__bar" />
            </button>
          </div>
        </div>
      </nav>

      {activePanel && (
        <div className="npanel__overlay" onClick={closePanel} />
      )}

      <div className={`npanel__wrapper ${activePanel === "admin" ? "npanel__wrapper--open" : ""}`}>
        <AdminPanel onLoginSuccess={handleLoginSuccess} onClose={closePanel} />
      </div>

      <div className={`npanel__wrapper ${activePanel === "student" ? "npanel__wrapper--open" : ""}`}>
        <StudentPanel onLoginSuccess={handleLoginSuccess} onClose={closePanel} />
      </div>

      <div className={`navbar__mobile-menu ${open ? "navbar__mobile-menu--open" : ""}`}>
        {navLinks.map(({ to, label, end }) => (
          <NavLink key={to} to={to} end={end} onClick={closeMobile}
            className={({ isActive }) => "navbar__mobile-link" + (isActive ? " navbar__mobile-link--active" : "")}
          >
            {label}
          </NavLink>
        ))}

        <div className="navbar__mobile-divider" />

        <button className="navbar__mobile-wallet"
          onClick={() => { walletAddress ? onDisconnectWallet() : onConnectWallet(); closeMobile(); }}>
          <span className={`navbar__dot ${walletAddress ? "" : "navbar__dot--off"}`} />
          {walletAddress ? `${shortAddress(walletAddress)} ✕` : "Connect Wallet"}
        </button>

        {loggedUser ? (
          <>
            <button className="navbar__mobile-link" onClick={() => { handleGo(); closeMobile(); }}>
              {loggedUser.role === "admin" ? "🏛️ Admin Dashboard" : "🎓 My Certificates"}
            </button>
            <button className="navbar__mobile-logout" onClick={() => { handleLogout(); closeMobile(); }}>
              🚪 Logout
            </button>
          </>
        ) : (
          <>
            <button className="navbar__mobile-portal navbar__mobile-portal--admin"
              onClick={() => { openPanel("admin"); }}>
              🏛️ Admin Login
            </button>
            <button className="navbar__mobile-portal navbar__mobile-portal--student"
              onClick={() => { openPanel("student"); }}>
              🎓 Student Login
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default Navbar;