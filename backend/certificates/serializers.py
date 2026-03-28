from rest_framework import serializers
from .models import Certificate, Student, Institute


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Student
        fields = ["id", "name", "email", "roll_number", "created_at"]


class CertificateSerializer(serializers.ModelSerializer):
    student_name    = serializers.CharField(source="student.name",        read_only=True)
    student_email   = serializers.CharField(source="student.email",       read_only=True)
    roll_number     = serializers.CharField(source="student.roll_number",  read_only=True)
    institute_name  = serializers.CharField(source="institute.name",       read_only=True)

    class Meta:
        model  = Certificate
        fields = [
            "id", "student_name", "student_email", "roll_number",
            "institute_name", "course", "grade", "issue_date",
            "cert_hash", "tx_hash", "ipfs_cid", "status",
            "created_at", "revoked_at",
        ]


class IssueCertificateSerializer(serializers.Serializer):
    student_name  = serializers.CharField(max_length=200)
    student_email = serializers.EmailField()
    roll_number   = serializers.CharField(max_length=50)
    course        = serializers.CharField(max_length=200)
    grade         = serializers.CharField(max_length=100)
    issue_date    = serializers.DateField()


class InstituteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Institute
        fields = ["id", "name", "wallet_address", "email", "created_at"]
