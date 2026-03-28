from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ("admin",   "Institute Admin"),
        ("student", "Student"),
    ]

    user           = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role           = models.CharField(max_length=10, choices=ROLE_CHOICES, default="student")
    wallet_address = models.CharField(max_length=42, blank=True, null=True, unique=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"
