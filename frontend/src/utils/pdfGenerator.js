/**
 * pdfGenerator.js
 * Generates a certificate PDF in the browser using jsPDF.
 * No server needed — works 100% client-side.
 */
import { jsPDF } from "jspdf";

/**
 * Generate and download certificate PDF
 * @param {Object} cert - certificate data object
 */
export function downloadCertificatePDF(cert) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const W = doc.internal.pageSize.getWidth();   // 297
  const H = doc.internal.pageSize.getHeight();  // 210

  // ── Background ──────────────────────────────────────────────
  doc.setFillColor(11, 15, 26);       // dark navy
  doc.rect(0, 0, W, H, "F");

  // ── Gold border ──────────────────────────────────────────────
  doc.setDrawColor(245, 158, 11);     // gold
  doc.setLineWidth(3);
  doc.rect(8, 8, W - 16, H - 16, "S");

  doc.setDrawColor(59, 130, 246);     // blue inner border
  doc.setLineWidth(0.5);
  doc.rect(12, 12, W - 24, H - 24, "S");

  // ── Header line ──────────────────────────────────────────────
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(1);
  doc.line(30, 38, W - 30, 38);

  // ── Title ────────────────────────────────────────────────────
  doc.setFont("times", "bolditalic");
  doc.setFontSize(32);
  doc.setTextColor(226, 232, 240);    // light text
  doc.text("Certificate of Achievement", W / 2, 30, { align: "center" });

  // ── Institute ────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(59, 130, 246);     // blue
  doc.text(cert.institute_name || "Institute", W / 2, 46, { align: "center" });

  // ── Subtitle ─────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(148, 163, 184);
  doc.text("This is to certify that", W / 2, 62, { align: "center" });

  // ── Student Name ─────────────────────────────────────────────
  doc.setFont("times", "bolditalic");
  doc.setFontSize(28);
  doc.setTextColor(226, 232, 240);
  doc.text(cert.student_name || "Student Name", W / 2, 80, { align: "center" });

  // ── Underline name ───────────────────────────────────────────
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.5);
  const nameWidth = doc.getTextWidth(cert.student_name || "Student Name");
  doc.line(W / 2 - nameWidth / 2, 83, W / 2 + nameWidth / 2, 83);

  // ── Body text ────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(148, 163, 184);
  doc.text("has successfully completed", W / 2, 93, { align: "center" });

  // ── Course ───────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(59, 130, 246);
  doc.text(cert.course || "Course", W / 2, 106, { align: "center" });

  // ── Details row ──────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  const details = `Grade: ${cert.grade || "—"}   ·   Roll No: ${cert.roll_number || "—"}   ·   Date: ${cert.issue_date || "—"}`;
  doc.text(details, W / 2, 118, { align: "center" });

  // ── Divider ──────────────────────────────────────────────────
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.4);
  doc.line(W / 2 - 60, 126, W / 2 + 60, 126);

  // ── Blockchain verification ───────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("⛓  Verified on Ethereum Blockchain", W / 2, 134, { align: "center" });

  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const hashText = `Hash: ${cert.cert_hash || "N/A"}`;
  doc.text(hashText, W / 2, 141, { align: "center" });

  const verifyUrl = `${window.location.origin}/verify?hash=${cert.cert_hash}`;
  doc.text(`Verify: ${verifyUrl}`, W / 2, 147, { align: "center" });

  // ── Footer line ──────────────────────────────────────────────
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(1);
  doc.line(30, 165, W - 30, 165);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("CertVerify — Blockchain Certificate Verification System", W / 2, 172, { align: "center" });

  // ── Download ─────────────────────────────────────────────────
  const filename = `Certificate_${(cert.student_name || "student").replace(/\s+/g, "_")}_${cert.course?.split(" ").slice(-1)[0] || "cert"}.pdf`;
  doc.save(filename);
}
