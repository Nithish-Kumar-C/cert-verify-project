"""
pdf_service.py
Generates a beautiful certificate PDF using ReportLab.
The PDF is then uploaded to IPFS via Pinata.
"""
from io import BytesIO
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os


def generate_certificate_pdf(
    student_name: str,
    course: str,
    grade: str,
    issue_date: str,
    institute_name: str,
    cert_hash: str,
    roll_number: str,
) -> bytes:
    """
    Generate a certificate PDF and return as bytes.
    The bytes can then be uploaded to IPFS.
    """
    buffer = BytesIO()
    page_width, page_height = landscape(A4)

    c = canvas.Canvas(buffer, pagesize=landscape(A4))

    # ── Background ───────────────────────────────────────────
    c.setFillColorRGB(0.04, 0.06, 0.10)  # dark navy
    c.rect(0, 0, page_width, page_height, fill=True, stroke=False)

    # ── Outer Border ─────────────────────────────────────────
    c.setStrokeColorRGB(0.23, 0.51, 0.96)  # blue
    c.setLineWidth(3)
    c.rect(1.2*cm, 1.2*cm, page_width - 2.4*cm, page_height - 2.4*cm, fill=False, stroke=True)

    c.setStrokeColorRGB(0.23, 0.51, 0.96, alpha=0.3)
    c.setLineWidth(1)
    c.rect(1.6*cm, 1.6*cm, page_width - 3.2*cm, page_height - 3.2*cm, fill=False, stroke=True)

    # ── Header ───────────────────────────────────────────────
    c.setFillColorRGB(0.23, 0.51, 0.96)
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(page_width / 2, page_height - 3.2*cm, institute_name.upper())

    c.setFillColorRGB(0.58, 0.66, 0.76)
    c.setFont("Helvetica", 8)
    c.drawCentredString(page_width / 2, page_height - 3.8*cm, "OFFICIAL ACADEMIC CERTIFICATE")

    # Horizontal rule
    c.setStrokeColorRGB(0.23, 0.51, 0.96)
    c.setLineWidth(0.8)
    c.line(4*cm, page_height - 4.3*cm, page_width - 4*cm, page_height - 4.3*cm)

    # ── Title ────────────────────────────────────────────────
    c.setFillColorRGB(0.89, 0.91, 0.95)
    c.setFont("Helvetica", 11)
    c.drawCentredString(page_width / 2, page_height - 5.8*cm, "This is to certify that")

    # ── Student Name ─────────────────────────────────────────
    c.setFillColorRGB(1.0, 1.0, 1.0)
    c.setFont("Helvetica-Bold", 32)
    c.drawCentredString(page_width / 2, page_height - 8*cm, student_name)

    # Underline for name
    name_width = c.stringWidth(student_name, "Helvetica-Bold", 32)
    c.setStrokeColorRGB(0.23, 0.51, 0.96)
    c.setLineWidth(1.2)
    c.line(
        page_width/2 - name_width/2,
        page_height - 8.4*cm,
        page_width/2 + name_width/2,
        page_height - 8.4*cm
    )

    # ── Body Text ────────────────────────────────────────────
    c.setFillColorRGB(0.58, 0.66, 0.76)
    c.setFont("Helvetica", 11)
    c.drawCentredString(page_width / 2, page_height - 9.5*cm,
                        "has successfully completed the programme of study")

    c.setFillColorRGB(0.23, 0.51, 0.96)
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(page_width / 2, page_height - 11*cm, course)

    # ── Info Row ─────────────────────────────────────────────
    info_y = page_height - 13*cm
    col_positions = [page_width * 0.25, page_width * 0.5, page_width * 0.75]
    labels = ["GRADE",     "ROLL NUMBER", "DATE OF ISSUE"]
    values = [grade,       roll_number,   issue_date]

    for pos, label, value in zip(col_positions, labels, values):
        c.setFillColorRGB(0.4, 0.5, 0.65)
        c.setFont("Helvetica", 7)
        c.drawCentredString(pos, info_y + 0.5*cm, label)

        c.setFillColorRGB(0.89, 0.91, 0.95)
        c.setFont("Helvetica-Bold", 12)
        c.drawCentredString(pos, info_y, value)

    # ── Bottom Rule ──────────────────────────────────────────
    c.setStrokeColorRGB(0.23, 0.51, 0.96, alpha=0.4)
    c.setLineWidth(0.6)
    c.line(4*cm, 4.5*cm, page_width - 4*cm, 4.5*cm)

    # ── Blockchain Hash ──────────────────────────────────────
    c.setFillColorRGB(0.4, 0.5, 0.65)
    c.setFont("Helvetica", 7)
    c.drawCentredString(page_width / 2, 3.8*cm, "BLOCKCHAIN CERTIFICATE HASH")

    c.setFillColorRGB(0.23, 0.51, 0.96)
    c.setFont("Courier", 7.5)
    c.drawCentredString(page_width / 2, 3.2*cm, cert_hash)

    c.setFillColorRGB(0.4, 0.5, 0.65)
    c.setFont("Helvetica", 7)
    c.drawCentredString(page_width / 2, 2.4*cm, "Verified on Ethereum Blockchain · certverify.app/verify")

    # ── Seal Circle ──────────────────────────────────────────
    seal_x = page_width - 6*cm
    seal_y = 5*cm
    c.setStrokeColorRGB(0.23, 0.51, 0.96)
    c.setFillColorRGB(0.04, 0.06, 0.10)
    c.setLineWidth(2)
    c.circle(seal_x, seal_y, 1.8*cm, fill=True, stroke=True)
    c.setFillColorRGB(0.23, 0.51, 0.96)
    c.setFont("Helvetica-Bold", 7)
    c.drawCentredString(seal_x, seal_y + 0.3*cm, "BLOCKCHAIN")
    c.drawCentredString(seal_x, seal_y - 0.3*cm, "VERIFIED")

    c.save()
    return buffer.getvalue()
