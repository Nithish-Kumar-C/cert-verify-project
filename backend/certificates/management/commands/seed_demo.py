"""
Management command: python manage.py seed_demo
Creates a demo institute + demo certificates for testing.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from certificates.models import Institute, Student, Certificate
from users.models import UserProfile
import datetime


class Command(BaseCommand):
    help = "Seed demo data for testing"

    def handle(self, *args, **kwargs):
        # Create demo institute user
        if not User.objects.filter(username="demo_admin").exists():
            user = User.objects.create_user(
                username="demo_admin",
                email="admin@annauniv.edu",
                password="demo1234",
            )
            UserProfile.objects.create(user=user, role="admin")
            institute = Institute.objects.create(
                user=user,
                name="Anna University",
                email="admin@annauniv.edu",
            )
            self.stdout.write(self.style.SUCCESS("Created demo institute: Anna University"))
        else:
            user = User.objects.get(username="demo_admin")
            institute = Institute.objects.get(user=user)
            self.stdout.write("Demo institute already exists")

        # Create demo students + certificates
        demo_certs = [
            {
                "name": "Ravi Kumar",
                "email": "ravi@example.com",
                "roll": "2024CS101",
                "course": "B.E. Computer Science",
                "grade": "First Class",
                "date": datetime.date(2024, 3, 15),
            },
            {
                "name": "Priya Sharma",
                "email": "priya@example.com",
                "roll": "2024EC102",
                "course": "B.E. Electronics",
                "grade": "First Class with Distinction",
                "date": datetime.date(2024, 3, 15),
            },
        ]

        for d in demo_certs:
            student, _ = Student.objects.get_or_create(
                institute=institute,
                roll_number=d["roll"],
                defaults={"name": d["name"], "email": d["email"]},
            )
            cert_hash = Certificate.generate_hash(
                d["name"], d["roll"], d["course"],
                d["grade"], d["date"], institute.name,
            )
            if not Certificate.objects.filter(cert_hash=cert_hash).exists():
                Certificate.objects.create(
                    student=student,
                    institute=institute,
                    course=d["course"],
                    grade=d["grade"],
                    issue_date=d["date"],
                    cert_hash=cert_hash,
                    tx_hash="0xDEMO_TX_HASH_NOT_ON_CHAIN",
                    status="ACTIVE",
                )
                self.stdout.write(self.style.SUCCESS(f"  Created cert for {d['name']}"))

        self.stdout.write(self.style.SUCCESS("\nDemo data seeded!"))
        self.stdout.write("Login: username=demo_admin  password=demo1234")
