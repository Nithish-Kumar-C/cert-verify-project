import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { certAPI } from "../../utils/api";
import Button from "../shared/Button";
import Input from "../shared/Input";
import "./VerifyPage.css";

const STATUS_MAP = {
  VALID:     { cls: "valid",   ico: "✅", label: "Certificate Valid",    msg: "This certificate is genuine and verified on Ethereum blockchain." },
  REVOKED:   { cls: "revoked", ico: "⚠️", label: "Certificate Revoked",  msg: "This certificate was officially revoked by the issuing institute." },
  NOT_FOUND: { cls: "invalid", ico: "❌", label: "Certificate Not Found", msg: "No certificate found with this hash on the blockchain. It may be fake." },
};

function VerifyPage() {
  const [searchParams] = useSearchParams();
  const [hash, setHash]     = useState(searchParams.get("hash") || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-verify if hash is in URL
  useEffect(() => {
    if (searchParams.get("hash")) {
      handleVerify(searchParams.get("hash"));
    }
  }, []);

  const handleVerify = async (hashVal) => {
    const h = (hashVal || hash).trim();
    if (!h) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await certAPI.verify(h);
      setResult(res.data);
    } catch {
      setResult({ status: "NOT_FOUND" });
    } finally {
      setLoading(false);
    }
  };

  const info = result ? STATUS_MAP[result.status] || STATUS_MAP.NOT_FOUND : null;

  return (
    <div className="verify">
      <div className="verify__hero">
        <div className="verify__hero-icon">🔍</div>
        <h1 className="verify__hero-title">Verify Certificate</h1>
        <p className="verify__hero-sub">
          Enter a certificate hash to instantly verify its authenticity
          on the Ethereum blockchain. No login required.
        </p>
      </div>

      <div className="verify__box">
        <Input
          label="Certificate Hash"
          placeholder="Enter hash e.g. 0x7f3a9c2b1d4e8f6a..."
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          hint="Paste the hash from the student's verification link"
        />
        <div className="verify__box-row">
          <Button variant="primary" full loading={loading} onClick={() => handleVerify()} disabled={!hash.trim()}>
            {loading ? "Querying Blockchain..." : "⛓ Verify on Blockchain"}
          </Button>
        </div>
      </div>

      {result && info && (
        <div className={`verify__result verify__result--${info.cls}`}>
          <div className="verify__result-head">
            <span className="verify__result-ico">{info.ico}</span>
            <div>
              <div className={`verify__result-status verify__result-status--${info.cls}`}>{info.label}</div>
              <div className="verify__result-msg">{info.msg}</div>
            </div>
          </div>

          {result.status !== "NOT_FOUND" && (
            <div className="verify__result-body">
              <div className="verify__details">
                {[
                  ["Student Name",  result.student_name],
                  ["Roll Number",   result.roll_number],
                  ["Course",        result.course],
                  ["Grade",         result.grade],
                  ["Issue Date",    result.issue_date],
                  ["Institute",     result.institute_name],
                ].map(([label, val]) => val && (
                  <div className="verify__detail" key={label}>
                    <span className="verify__detail-label">{label}</span>
                    <span className="verify__detail-val">{val}</span>
                  </div>
                ))}
              </div>

              <div className="verify__proof">
                <div className="verify__proof-title">⛓ Blockchain Proof</div>
                <div className="verify__proof-hash">{result.tx_hash || result.cert_hash}</div>
                <div className="verify__proof-network">
                  <span className="verify__proof-dot" />
                  Ethereum Sepolia Testnet · Confirmed
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VerifyPage;
