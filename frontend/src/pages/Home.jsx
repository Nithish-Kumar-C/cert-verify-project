import { useNavigate } from "react-router-dom";
import Button from "../components/shared/Button";
import "./Home.css";

const FEATURES = [
  { icon: "⛓", title: "Blockchain Verified",    desc: "Every certificate hash is permanently stored on Ethereum. Tamper-proof and immutable forever." },
  { icon: "🔍", title: "Instant Verification",   desc: "Recruiters verify in seconds. No phone calls, no emails, no waiting. Fully public." },
  { icon: "🚫", title: "Revoke Anytime",         desc: "Institutes can revoke incorrect certificates. Full audit trail remains on blockchain." },
  { icon: "📁", title: "IPFS Storage",           desc: "Certificate PDFs stored on IPFS. Lives forever even if our servers go down." },
  { icon: "🦊", title: "MetaMask Login",         desc: "Institutes sign in with their Ethereum wallet. No passwords, no breach risk." },
  { icon: "📱", title: "QR Code on Certificate", desc: "Every certificate has a QR code. Scan and verify instantly on any device." },
];

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="home__hero">
        <div className="home__hero-eyebrow">⛓ Ethereum Blockchain Powered</div>
        <h1 className="home__hero-title">
          Certificate Verification<br />
          <span className="home__hero-title-accent">You Can Trust</span>
        </h1>
        <p className="home__hero-sub">
          Issue, manage and verify academic certificates on the Ethereum blockchain.
          Fake certificates caught instantly — no human bias, no single point of failure.
        </p>
        <div className="home__hero-actions">
          <Button variant="primary" size="lg" onClick={() => navigate("/verify")}>
            🔍 Verify a Certificate
          </Button>
          <Button variant="ghost" size="lg" onClick={() => navigate("/admin")}>
            🏛️ Admin Portal
          </Button>
        </div>
        <div className="home__hero-hint">
          <strong>Admin Login</strong> or <strong>Student Login</strong>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="home__features">
        <div className="home__section-label">Why Blockchain</div>
        <h2 className="home__section-title">Built for Trust</h2>
        <div className="home__features-grid">
          {FEATURES.map((f) => (
            <div className="home__feature-card" key={f.title}>
              <div className="home__feature-icon">{f.icon}</div>
              <div className="home__feature-title">{f.title}</div>
              <div className="home__feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default Home;