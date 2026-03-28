from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django.contrib.auth.models import User

from .models import Certificate, Student, Institute
from .serializers import CertificateSerializer, IssueCertificateSerializer
from .blockchain_service import issue_on_blockchain, revoke_on_blockchain, verify_on_blockchain
from .email_service import send_certificate_email
from .pdf_service import generate_certificate_pdf
from .ipfs_service import upload_pdf_to_ipfs
from users.models import UserProfile


def create_student_account(student_name, student_email, roll_number):
    """
    Auto-create student login account when certificate is issued.
    Password = first 2 letters of name (capitalized) + roll number
    Example: Nithish Kumar + 23106035 → Ni23106035
    """
    # Generate password
    name_part = student_name.strip()[:2].capitalize()
    password  = f"{name_part}{roll_number}"

    # Check if user already exists
    existing = User.objects.filter(email=student_email).first()
    if existing:
        return existing, password, False  # Already exists

    # Create username from email
    username_base = student_email.split("@")[0]
    username      = username_base
    counter       = 1
    while User.objects.filter(username=username).exists():
        username = f"{username_base}{counter}"
        counter += 1

    # Create user
    user = User.objects.create_user(
        username=username,
        email=student_email,
        password=password,
        first_name=student_name,
    )
    UserProfile.objects.create(user=user, role="student")

    return user, password, True  # Newly created


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

    # Only approved institutes can issue
    if not institute.is_approved:
        return Response({
            "error": "Your institute is not approved yet. Contact admin for approval."
        }, status=403)

    # Generate hash
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

    # Save student record
    student, _ = Student.objects.get_or_create(
        institute=institute,
        roll_number=data["roll_number"],
        defaults={
            "name":  data["student_name"],
            "email": data["student_email"],
        },
    )

    # ── Auto create student login account ─────────────────────
    student_user, auto_password, is_new = create_student_account(
        student_name  = data["student_name"],
        student_email = data["student_email"],
        roll_number   = data["roll_number"],
    )

    # Store on blockchain
    try:
        tx_hash = issue_on_blockchain(
            cert_hash_hex = cert_hash,
            student_name  = data["student_name"],
            course        = data["course"],
            grade         = data["grade"],
            ipfs_cid      = "",
        )
    except Exception as e:
        return Response({"error": f"Blockchain error: {str(e)}"}, status=503)

    # Save in MySQL
    certificate = Certificate.objects.create(
        student    = student,
        institute  = institute,
        course     = data["course"],
        grade      = data["grade"],
        issue_date = data["issue_date"],
        cert_hash  = cert_hash,
        tx_hash    = tx_hash,
        status     = "ACTIVE",
    )

    # Generate PDF + upload to IPFS (best effort)
    try:
        pdf_bytes = generate_certificate_pdf(
            student_name   = data["student_name"],
            course         = data["course"],
            grade          = data["grade"],
            issue_date     = str(data["issue_date"]),
            institute_name = institute.name,
            cert_hash      = cert_hash,
            roll_number    = data["roll_number"],
        )
        ipfs_cid = upload_pdf_to_ipfs(pdf_bytes, f"cert_{data['roll_number']}.pdf")
        certificate.ipfs_cid = ipfs_cid
        certificate.save()
    except Exception:
        pass

    # Email student with certificate + login credentials
    try:
        from django.core.mail import send_mail
        from django.conf import settings
        name_part    = data["student_name"].strip()[:2].capitalize()
        login_pass   = f"{name_part}{data['roll_number']}"
        send_mail(
            subject = f"Your Certificate is Ready — {institute.name}",
            message = f"""Dear {data['student_name']},

Your certificate has been issued by {institute.name}.

Certificate Details:
  Course     : {data['course']}
  Grade      : {data['grade']}
  Issue Date : {data['issue_date']}
  Hash       : {cert_hash}

Verify your certificate at:
{settings.FRONTEND_URL}/verify?hash={cert_hash}

Login to view your certificate:
  URL      : {settings.FRONTEND_URL}/student-login
  Email    : {data['student_email']}
  Password : {login_pass}

— CertVerify Team""",
            from_email      = settings.DEFAULT_FROM_EMAIL,
            recipient_list  = [data["student_email"]],
            fail_silently   = True,
        )
    except Exception:
        pass

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
    """
    GET /api/certificates/my/
    Returns certificates for logged-in student by email.
    """
    students = Student.objects.filter(email=request.user.email)
    certs    = Certificate.objects.filter(
        student__in=students
    ).select_related("student", "institute")
    return Response(CertificateSerializer(certs, many=True).data)