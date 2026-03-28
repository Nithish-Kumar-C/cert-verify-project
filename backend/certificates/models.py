from django.db import models
from django.contrib.auth.models import User
import hashlib
import json


class Institute(models.Model):
    user           = models.OneToOneField(User, on_delete=models.CASCADE)
    name           = models.CharField(max_length=200)
    wallet_address = models.CharField(max_length=42, unique=True, blank=True, null=True)
    email          = models.EmailField(unique=True)
    is_approved    = models.BooleanField(default=False)
    approved_at    = models.DateTimeField(null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        status = "Approved" if self.is_approved else "Pending"
        return f"{self.name} ({status})"


class Student(models.Model):
    institute   = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name="students")
    name        = models.CharField(max_length=200)
    email       = models.EmailField()
    roll_number = models.CharField(max_length=50)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("institute", "roll_number")

    def __str__(self):
        return f"{self.name} ({self.roll_number})"


class Certificate(models.Model):
    STATUS_CHOICES = [
        ("ACTIVE",  "Active"),
        ("REVOKED", "Revoked"),
    ]

    student    = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="certificates")
    institute  = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name="certificates")
    course     = models.CharField(max_length=200)
    grade      = models.CharField(max_length=100)
    issue_date = models.DateField()

    cert_hash  = models.CharField(max_length=66, unique=True)
    tx_hash    = models.CharField(max_length=66, blank=True)
    ipfs_cid   = models.CharField(max_length=100, blank=True)

    status     = models.CharField(max_length=10, choices=STATUS_CHOICES, default="ACTIVE")
    created_at = models.DateTimeField(auto_now_add=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.student.name} - {self.course}"

    @staticmethod
    def generate_hash(student_name, roll_number, course, grade, issue_date, institute_name):
        data = {
            "student_name":   student_name,
            "roll_number":    roll_number,
            "course":         course,
            "grade":          grade,
            "issue_date":     str(issue_date),
            "institute_name": institute_name,
        }
        data_string = json.dumps(data, sort_keys=True)
        return "0x" + hashlib.sha256(data_string.encode()).hexdigest()