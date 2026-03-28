from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django.contrib.auth.models import User
import threading

from .models import Certificate, Student, Institute
from .serializers import CertificateSerializer, IssueCertificateSerializer
from .blockchain_service import issue_on_blockchain, revoke_on_blockchain, verify_on_blockchain
from .email_service import send_certificate_email
from .pdf_service import generate_certificate_pdf
from .ipfs_service import upload_pdf_to_ipfs
from users.models import UserProfile


def create_student_account(student_name, student_email, roll_number):
    name_part = student_name.strip()[:2].capitalize()
    password  = f"{name_part}{roll_number}"
    existing  = User.objects.filter(email=student_email).first()
    if existing:
        return existing, password, False
    username_base = student_email.split("@")[0]
    username      = username_base
    counter       = 1
    while User.objects.filter(username=username).exists():
        username = f"{username_base}{counter}"
        counter += 1
    user = User.objects.create_user(
        username=username, email=student_email,
        password=password, first_name=student_name,
    )
    UserProfile.objects.create(user=user, role="student")
    return user, password, True


def blockchain_and_email_task(certificate_id, cert_hash, student_name, course,
                               grade, roll_number, student_email, institute_name,
                               frontend_url, default_from_email):
    """Run blockchain + email in background thread so API responds immediately."""
    try:
        tx_hash = issue_on_blockchain(
            cert_hash_hex = cert_hash,
            student_name  = student_name,
            course        = course,
            grade         = grade,
            ipfs_cid      = "",
        )
        Certificate.objects.filter(id=certificate_id).update(tx_hash=tx_hash)
    except Exception as e:
        print(f"Blockchain error (background): {e}")

    # Email student
    try:
        from django.core.mail import send_mail
        name_part  = student_name.strip()[:2].capitalize()
        login_pass = f"{name_part}{roll_number}"
        send_mail(
            subject = f"Your Certificate is Ready — {institute_name}",
            message = f"""Dear {student_name},

Your certificate has been issued by {institute_name}.

Certificate Details:
  Course     : {course}
  Grade      : {grade}
  Hash       : {cert_hash}

Verify your certificate at:
{frontend_url}/verify?hash={cert_hash}

Login to view your certificate:
  URL      : {frontend_url}/student-login
  Email    : {student_email}
  Password : {login_pass}

— CertVerify Team""",
            from_email     = default_from_email,
            recipient_list = [student_email],
            fail_silently  = True,
        )
    except Exception as e:
        print(f"Email error (background): {e}")


# ─── Issue Certificate ─────────────────────────────────────────
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def issue_certificate(request):
    serializer = IssueCertificateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    data = serializer.validated_data

    try:
        institute = Institute.objects.get(user=request.user)
    except Institute.DoesNotExist:
        return Response({"error": "Institute profile not found"}, status=403)

    if not institute.is_approved:
        return Response({
            "error": "Your institute is not approved yet. Contact admin for approval."
        }, status=403)

    cert_hash = Certificate.generate_hash(
        student_name   = data["student_name"],
        roll_number    = data["roll_number"],
        course         = data["course"],
        grade          = data["grade"],
        issue_date     = data["issue_date"],
        institute_name = institute.name,
    )

    if Certificate.objects.filter(cert_hash=cert_hash).exists():
        return Response({"error": "This certificate has already been issued"}, status=400)

    student, _ = Student.objects.get_or_create(
        institute=institute,
        roll_number=data["roll_number"],
        defaults={
            "name":  data["student_name"],
            "email": data["student_email"],
        },
    )

    student_user, auto_password, is_new = create_student_account(
        student_name  = data["student_name"],
        student_email = data["student_email"],
        roll_number   = data["roll_number"],
    )

    # ── Save to DB immediately — blockchain runs in background ──
    certificate = Certificate.objects.create(
        student    = student,
        institute  = institute,
        course     = data["course"],
        grade      = data["grade"],
        issue_date = data["issue_date"],
        cert_hash  = cert_hash,
        tx_hash    = "0xPENDING",   # updated by background thread
        status     = "ACTIVE",
    )

    # ── Start blockchain + email in background thread ───────────
    from django.conf import settings
    t = threading.Thread(
        target = blockchain_and_email_task,
        args   = (
            certificate.id, cert_hash,
            data["student_name"], data["course"], data["grade"],
            data["roll_number"], data["student_email"],
            institute.name,
            settings.FRONTEND_URL,
            settings.DEFAULT_FROM_EMAIL,
        ),
        daemon = True,
    )
    t.start()

    response_data = CertificateSerializer(certificate).data
    response_data["student_login"] = {
        "email":    data["student_email"],
        "password": auto_password,
        "is_new":   is_new,
    }

    return Response(response_data, status=201)


# ─── Verify Certificate ────────────────────────────────────────
@api_view(["GET"])
@permission_classes([AllowAny])
def verify_certificate(request, cert_hash):
    try:
        blockchain_result = verify_on_blockchain(cert_hash)
    except Exception as e:
        return Response({"error": f"Blockchain query failed: {str(e)}"}, status=503)

    if blockchain_result["status"] == "NOT_FOUND":
        return Response({"status": "NOT_FOUND"}, status=200)

    try:
        certificate = Certificate.objects.select_related("student", "institute").get(cert_hash=cert_hash)
        data        = CertificateSerializer(certificate).data
        data["status"] = blockchain_result["status"]
        return Response(data, status=200)
    except Certificate.DoesNotExist:
        return Response(blockchain_result, status=200)


# ─── Revoke Certificate ────────────────────────────────────────
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def revoke_certificate(request, cert_hash):
    try:
        certificate = Certificate.objects.get(cert_hash=cert_hash)
    except Certificate.DoesNotExist:
        return Response({"error": "Certificate not found"}, status=404)

    try:
        institute = Institute.objects.get(user=request.user)
        if certificate.institute != institute:
            return Response({"error": "Not authorized"}, status=403)
    except Institute.DoesNotExist:
        return Response({"error": "Institute not found"}, status=403)

    if certificate.status == "REVOKED":
        return Response({"error": "Already revoked"}, status=400)

    try:
        revoke_on_blockchain(cert_hash)
    except Exception as e:
        return Response({"error": f"Blockchain revoke failed: {str(e)}"}, status=503)

    certificate.status     = "REVOKED"
    certificate.revoked_at = timezone.now()
    certificate.save()

    return Response({"message": "Certificate revoked on blockchain"}, status=200)


# ─── List Certificates (Institute) ────────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_certificates(request):
    try:
        institute = Institute.objects.get(user=request.user)
    except Institute.DoesNotExist:
        return Response({"error": "Institute not found"}, status=403)
    certs = Certificate.objects.filter(institute=institute).select_related("student")
    return Response(CertificateSerializer(certs, many=True).data)


# ─── Student Certificates ──────────────────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_certificates(request):
    students = Student.objects.filter(email=request.user.email)
    certs    = Certificate.objects.filter(
        student__in=students
    ).select_related("student", "institute")
    return Response(CertificateSerializer(certs, many=True).data)