import { useState, useEffect, useMemo } from "react";
import { certAPI } from "../../utils/api";
import Button from "../shared/Button";
import Input, { Select } from "../shared/Input";
import "./AdminDashboard.css";

const GRADES = [
  { value: "", label: "Select Grade" },
  { value: "First Class with Distinction", label: "First Class with Distinction" },
  { value: "First Class",                  label: "First Class" },
  { value: "Second Class",                 label: "Second Class" },
  { value: "Pass Class",                   label: "Pass Class" },
];

const EMPTY_FORM = {
  student_name: "", student_email: "", roll_number: "",
  course: "", grade: "", issue_date: "",
};

function AdminDashboard({ addToast }) {
  const [form, setForm]         = useState(EMPTY_FORM);
  const [certs, setCerts]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess]   = useState(false);

  const [search, setSearch]       = useState("");
  const [filterStatus, setFilter] = useState("ALL");

  useEffect(() => {
    certAPI.list()
      .then((r) => setCerts(r.data))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return certs.filter((c) => {
      const matchStatus = filterStatus === "ALL" || c.status === filterStatus;
      const matchSearch = !q || (
        c.student_name?.toLowerCase().includes(q) ||
        c.course?.toLowerCase().includes(q) ||
        c.roll_number?.toLowerCase().includes(q) ||
        c.cert_hash?.toLowerCase().includes(q)
      );
      return matchStatus && matchSearch;
    });
  }, [certs, search, filterStatus]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleIssue = async () => {
    const required = ["student_name","student_email","roll_number","course","grade","issue_date"];
    if (required.some((k) => !form[k])) {
      addToast("error", "Please fill all fields"); return;
    }
    setLoading(true);
    try {
      const res = await certAPI.issue(form);
      setCerts((p) => [res.data, ...p]);
      setForm(EMPTY_FORM);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
      addToast("success", "Certificate issued! Blockchain confirmation in progress...");
    } catch (e) {
      addToast("error", e.response?.data?.error || "Issue failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (hash) => {
    if (!window.confirm("Revoke this certificate on blockchain? This cannot be undone.")) return;
    try {
      await certAPI.revoke(hash);
      setCerts((p) => p.map((c) => c.cert_hash === hash ? { ...c, status: "REVOKED" } : c));
      addToast("success", "Certificate revoked on blockchain");
    } catch (e) {
      addToast("error", e.response?.data?.error || "Revoke failed");
    }
  };

  const total   = certs.length;
  const active  = certs.filter((c) => c.status === "ACTIVE").length;
  const revoked = certs.filter((c) => c.status === "REVOKED").length;

  return (
    <div className="admin">
      <div>
        <div className="admin__badge">🏛 Admin Panel</div>
        <h1 className="admin__title">Institute Dashboard</h1>
        <p className="admin__sub">Manage and issue blockchain-verified certificates</p>
      </div>

      <div className="admin__stats">
        <div className="admin__stat">
          <div className="admin__stat-label">Total Issued</div>
          <div className="admin__stat-value">{total}</div>
        </div>
        <div className="admin__stat">
          <div className="admin__stat-label">Active</div>
          <div className="admin__stat-value admin__stat-value--green">{active}</div>
        </div>
        <div className="admin__stat">
          <div className="admin__stat-label">Revoked</div>
          <div className="admin__stat-value admin__stat-value--red">{revoked}</div>
        </div>
      </div>

      <div className="admin__grid">
        <div className="admin__card">
          <div className="admin__card-head">
            <span className="admin__card-title">📄 Issue New Certificate</span>
          </div>
          <div className="admin__card-body">
            {success && (
              <div className="admin__success">
                ✅ Certificate saved! Blockchain confirmation happening in background (takes 1-2 min).
                The certificate is now visible below.
              </div>
            )}
            <div className="admin__form">
              <div className="admin__form-row">
                <Input label="Student Name"  name="student_name"  placeholder="Ravi Kumar"        value={form.student_name}  onChange={handleChange} required />
                <Input label="Roll Number"   name="roll_number"   placeholder="2024CS101"          value={form.roll_number}   onChange={handleChange} required />
              </div>
              <Input   label="Student Email" name="student_email" type="email" placeholder="student@email.com" value={form.student_email} onChange={handleChange} required hint="Student will receive verification link" />
              <Input   label="Course"        name="course"        placeholder="B.E. Computer Science" value={form.course}     onChange={handleChange} required />
              <div className="admin__form-row">
                <Select label="Grade"      name="grade"      value={form.grade}      onChange={handleChange} options={GRADES} required />
                <Input  label="Issue Date" name="issue_date" type="date" value={form.issue_date} onChange={handleChange} required />
              </div>
              <Button variant="primary" full loading={loading} onClick={handleIssue}>
                {loading ? "⏳ Saving Certificate..." : "⛓ Issue Certificate"}
              </Button>
            </div>
          </div>
        </div>

        <div className="admin__card">
          <div className="admin__card-head">
            <span className="admin__card-title">📋 Issued Certificates</span>
          </div>

          <div className="admin__search-bar">
            <input
              className="admin__search-input"
              placeholder="🔍 Search by name, course, roll no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="admin__filter-select"
              value={filterStatus}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="REVOKED">Revoked</option>
            </select>
            <span className="admin__search-count">
              {filtered.length}/{total}
            </span>
          </div>

          {fetching ? (
            <div className="admin__empty"><div className="admin__empty-icon">⏳</div><div className="admin__empty-text">Loading...</div></div>
          ) : filtered.length === 0 ? (
            <div className="admin__empty">
              <div className="admin__empty-icon">{search ? "🔍" : "📭"}</div>
              <div className="admin__empty-text">
                {search ? `No results for "${search}"` : "No certificates issued yet"}
              </div>
            </div>
          ) : (
            <div className="admin__list">
              {filtered.map((cert) => (
                <div className="admin__list-item" key={cert.id || cert.cert_hash}>
                  <div>
                    <div className="admin__list-name">{cert.student_name}</div>
                    <div className="admin__list-meta">{cert.course} · {cert.grade}</div>
                    <div className="admin__list-hash">#{(cert.cert_hash || "").slice(0, 20)}...</div>
                    {cert.tx_hash === "0xPENDING" && (
                      <div className="admin__list-pending">⏳ Blockchain confirmation pending...</div>
                    )}
                  </div>
                  <div className="admin__list-right">
                    <span className={`badge ${cert.status === "ACTIVE" ? "badge--active" : "badge--revoked"}`}>
                      <span className="badge__dot" />{cert.status}
                    </span>
                    {cert.status === "ACTIVE" && (
                      <Button variant="danger" size="sm" onClick={() => handleRevoke(cert.cert_hash)}>
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;