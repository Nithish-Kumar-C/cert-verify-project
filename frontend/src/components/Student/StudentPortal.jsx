import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { certAPI } from "../../utils/api";
import { downloadCertificatePDF } from "../../utils/pdfGenerator";
import Button from "../shared/Button";
import "./StudentPortal.css";

function StudentPortal({ addToast }) {
  const [certs, setCerts]         = useState([]);
  const [fetching, setFetching]   = useState(true);
  const [copied, setCopied]       = useState(null);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    certAPI.myCerts()
      .then((r) => setCerts(r.data))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const copyLink = (hash) => {
    const url = `${window.location.origin}/verify?hash=${hash}`;
    navigator.clipboard.writeText(url);
    setCopied(hash);
    addToast("success", "Verification link copied!");
    setTimeout(() => setCopied(null), 2500);
  };

  // ── PDF Download (client-side via jsPDF) ────────────────────
  const handleDownloadPDF = async (cert) => {
    setDownloading(cert.id);
    try {
      // small delay so spinner shows
      await new Promise((r) => setTimeout(r, 300));
      downloadCertificatePDF(cert);
      addToast("success", "Certificate PDF downloaded!");
    } catch {
      addToast("error", "PDF generation failed");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="student">
      <div className="student__badge">🎓 Student Portal</div>
      <h1 className="student__title">My Certificates</h1>
      <p className="student__sub">View, download and share your blockchain-verified certificates</p>

      {fetching ? (
        <div className="student__empty">
          <div className="student__empty-icon">⏳</div>
          <div className="student__empty-text">Loading certificates...</div>
        </div>
      ) : certs.length === 0 ? (
        <div className="student__empty">
          <div className="student__empty-icon">🎓</div>
          <div className="student__empty-text">No certificates found for your account</div>
        </div>
      ) : (
        certs.map((cert) => {
          const verifyUrl = `${window.location.origin}/verify?hash=${cert.cert_hash}`;
          return (
            <div className="student__card" key={cert.id}>
              <div className="student__card-top">
                <div className="student__card-left">
                  <div className="student__card-course">{cert.course}</div>
                  <div className="student__card-institute">{cert.institute_name}</div>
                  <div className="student__card-metas">
                    <div className="student__meta-item">
                      <span className="student__meta-label">Grade</span>
                      <span className="student__meta-val">{cert.grade}</span>
                    </div>
                    <div className="student__meta-item">
                      <span className="student__meta-label">Roll No</span>
                      <span className="student__meta-val">{cert.roll_number}</span>
                    </div>
                    <div className="student__meta-item">
                      <span className="student__meta-label">Issued On</span>
                      <span className="student__meta-val">{cert.issue_date}</span>
                    </div>
                    <div className="student__meta-item">
                      <span className="student__meta-label">Status</span>
                      <span
                        className="student__meta-val"
                        style={{
                          color: cert.status === "ACTIVE"
                            ? "var(--color-success)"
                            : "var(--color-danger)",
                        }}
                      >
                        {cert.status === "ACTIVE" ? "✅ Active" : "❌ Revoked"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Real QR Code */}
                <div className="student__qr">
                  <div className="student__qr-box">
                    <QRCodeSVG
                      value={verifyUrl}
                      size={68}
                      bgColor="transparent"
                      fgColor="var(--color-text)"
                    />
                  </div>
                  <span className="student__qr-label">Scan to<br />verify</span>
                </div>
              </div>

              <div className="student__card-bottom">
                <span className="student__card-hash">
                  #{cert.cert_hash?.slice(0, 30)}...
                </span>
                <div className="student__card-actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyLink(cert.cert_hash)}
                  >
                    {copied === cert.cert_hash ? "✅ Copied!" : "🔗 Copy Link"}
                  </Button>

                  {/* PDF Download — client-side via jsPDF */}
                  <Button
                    variant="primary"
                    size="sm"
                    loading={downloading === cert.id}
                    onClick={() => handleDownloadPDF(cert)}
                  >
                    {downloading === cert.id ? "Generating..." : "⬇ Download PDF"}
                  </Button>

                  {cert.ipfs_cid && (
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${cert.ipfs_cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--ghost btn--sm"
                    >
                      🌐 View on IPFS
                    </a>
                  )}

                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default StudentPortal;
