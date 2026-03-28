from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from eth_account import Account
from eth_account.messages import encode_defunct

from .models import UserProfile
from certificates.models import Institute, Student


def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access":  str(refresh.access_token),
    }


# ─── Institute Register ────────────────────────────────────────
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """Public registration — requires admin approval before issuing."""
    username       = request.data.get("username")
    email          = request.data.get("email")
    password       = request.data.get("password")
    institute_name = request.data.get("institute_name")

    if not all([username, email, password, institute_name]):
        return Response({"error": "All fields required"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already registered"}, status=400)

    user = User.objects.create_user(
        username=username, email=email, password=password
    )
    UserProfile.objects.create(user=user, role="admin")
    Institute.objects.create(
        user=user, name=institute_name, email=email, is_approved=False
    )

    # Notify superadmin
    try:
        for admin in User.objects.filter(is_superuser=True):
            send_mail(
                subject=f"New Institute Registration: {institute_name}",
                message=f"Institute '{institute_name}' registered.\nApprove at: http://localhost:8000/admin/certificates/institute/",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin.email],
                fail_silently=True,
            )
    except Exception:
        pass

    return Response({
        "message": "Registered! Waiting for admin approval before you can issue certificates.",
        "tokens":      get_tokens(user),
        "is_approved": False,
    }, status=201)


# ─── Institute Login ───────────────────────────────────────────
@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response({"error": "Username and password required"}, status=400)

    user = authenticate(username=username, password=password)
    if not user:
        return Response({"error": "Invalid username or password"}, status=401)

    is_approved    = False
    institute_name = None
    try:
        institute      = Institute.objects.get(user=user)
        is_approved    = institute.is_approved
        institute_name = institute.name
    except Institute.DoesNotExist:
        pass

    return Response({
        "message": "Login successful",
        "tokens":  get_tokens(user),
        "user": {
            "id":             user.id,
            "username":       user.username,
            "email":          user.email,
            "institute_name": institute_name,
            "is_approved":    is_approved,
            "role":           "admin",
        }
    })


# ─── Student Login ─────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([AllowAny])
def student_login(request):
    """
    POST /api/auth/student-login/
    Body: { email, password }
    Password = first 2 letters of name (capitalized) + roll number
    Example: Nithish Kumar + 23106035 → Ni23106035
    """
    email    = request.data.get("email", "").strip()
    password = request.data.get("password", "").strip()

    if not email or not password:
        return Response({"error": "Email and password required"}, status=400)

    # Find student by email
    student = Student.objects.filter(email=email).first()
    if not student:
        return Response({"error": "No certificate found for this email"}, status=401)

    # Find user account
    user = User.objects.filter(email=email).first()
    if not user:
        return Response({"error": "Account not found. Contact your institute."}, status=401)

    # ── Fix: use check_password instead of plain text comparison ──
    if not user.check_password(password):
        return Response({"error": "Invalid email or password"}, status=401)

    return Response({
        "message": "Login successful",
        "tokens":  get_tokens(user),
        "user": {
            "id":          user.id,
            "name":        student.name,
            "email":       email,
            "roll_number": student.roll_number,
            "role":        "student",
        }
    })


# ─── MetaMask Login ────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([AllowAny])
def metamask_login(request):
    address   = request.data.get("address", "").lower()
    message   = request.data.get("message", "")
    signature = request.data.get("signature", "")

    if not all([address, message, signature]):
        return Response({"error": "address, message and signature required"}, status=400)

    try:
        msg       = encode_defunct(text=message)
        recovered = Account.recover_message(msg, signature=signature)
    except Exception:
        return Response({"error": "Invalid signature"}, status=401)

    if recovered.lower() != address:
        return Response({"error": "Signature mismatch"}, status=401)

    profile = UserProfile.objects.filter(wallet_address=address).first()
    if not profile:
        return Response({
            "error": "Wallet not registered. Please register first."
        }, status=403)

    user        = profile.user
    is_approved = False
    institute_name = None
    try:
        institute      = Institute.objects.get(user=user)
        is_approved    = institute.is_approved
        institute_name = institute.name
    except Institute.DoesNotExist:
        pass

    return Response({
        "message": "MetaMask login successful",
        "tokens":  get_tokens(user),
        "user": {
            "id":             user.id,
            "wallet_address": address,
            "institute_name": institute_name,
            "is_approved":    is_approved,
            "role":           "admin",
        }
    })


# ─── Forgot Password ───────────────────────────────────────────
@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password(request):
    email = request.data.get("email", "").strip()

    if not email:
        return Response({"error": "Email is required"}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"message": "If this email exists, a reset link was sent."})

    token     = default_token_generator.make_token(user)
    uid       = urlsafe_base64_encode(force_bytes(user.pk))
    reset_url = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

    try:
        send_mail(
            subject="Reset Your CertVerify Password",
            message=f"""Hi {user.username},

Click the link below to reset your password:
{reset_url}

This link expires in 24 hours.
If you did not request this, ignore this email.

— CertVerify Team""",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception:
        return Response({"error": "Failed to send email. Check EMAIL settings in .env"}, status=500)

    return Response({"message": "Password reset link sent to your email!"})


# ─── Reset Password ────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request):
    uid          = request.data.get("uid", "")
    token        = request.data.get("token", "")
    new_password = request.data.get("new_password", "")

    if not all([uid, token, new_password]):
        return Response({"error": "uid, token and new_password required"}, status=400)

    if len(new_password) < 8:
        return Response({"error": "Password must be at least 8 characters"}, status=400)

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user    = User.objects.get(pk=user_id)
    except Exception:
        return Response({"error": "Invalid reset link"}, status=400)

    if not default_token_generator.check_token(user, token):
        return Response({"error": "Reset link expired or invalid"}, status=400)

    user.set_password(new_password)
    user.save()

    return Response({"message": "Password reset successfully! You can now login."})


# ─── Get Current User ──────────────────────────────────────────
@api_view(["GET"])
def me(request):
    user        = request.user
    is_approved = False
    institute_name = None
    role        = "student"

    try:
        institute      = Institute.objects.get(user=user)
        is_approved    = institute.is_approved
        institute_name = institute.name
        role           = "admin"
    except Institute.DoesNotExist:
        pass

    return Response({
        "id":             user.id,
        "username":       user.username,
        "email":          user.email,
        "institute_name": institute_name,
        "is_approved":    is_approved,
        "role":           role,
    })