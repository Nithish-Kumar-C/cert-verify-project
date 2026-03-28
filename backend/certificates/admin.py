from django.contrib import admin
from .models import Institute, Student, Certificate


@admin.register(Institute)
class InstituteAdmin(admin.ModelAdmin):
    list_display  = ("name", "email", "is_approved", "created_at")
    list_filter   = ("is_approved",)
    search_fields = ("name", "email")
    list_editable = ("is_approved",)  # ← Edit directly from list!
    fields        = ("user", "name", "email", "wallet_address", "is_approved", "approved_at")
    readonly_fields = ("created_at",)


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display  = ("name", "email", "roll_number", "institute")
    search_fields = ("name", "email", "roll_number")


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display  = ("student", "institute", "course", "grade", "status", "created_at")
    list_filter   = ("status",)
    search_fields = ("student__name", "cert_hash")