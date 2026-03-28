"""
email_service.py
Sends verification email to student after certificate is issued.
"""
from django.core.mail import send_mail
from django.conf import settings


def send_certificate_email(student_name: str, student_email: str,
                           course: str, institute_name: str,
                           cert_hash: str) -> None:
    """Send certificate issued notification to student."""

    verify_url = f"{settings.FRONTEND_URL}/verify?hash={cert_hash}"

    subject = f"Your {course} Certificate is Ready — {institute_name}"

    message = f"""
Hi {student_name},

Congratulations! Your certificate has been successfully issued by {institute_name}
and permanently recorded on the Ethereum blockchain.

Certificate Details:
  Course    : {course}
  Institute : {institute_name}

Verify your certificate here:
{verify_url}

You can share this link with recruiters for instant verification.
No login needed — verified directly on blockchain.

Best regards,
CertVerify Team
"""

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[student_email],
        fail_silently=True,
    )
