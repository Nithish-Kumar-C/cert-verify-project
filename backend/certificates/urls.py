from django.urls import path
from . import views

urlpatterns = [
    path("certificates/",                         views.list_certificates,   name="list_certificates"),
    path("certificates/issue/",                   views.issue_certificate,   name="issue_certificate"),
    path("certificates/my/",                      views.student_certificates, name="student_certificates"),
    path("certificates/verify/<str:cert_hash>/",  views.verify_certificate,  name="verify_certificate"),
    path("certificates/revoke/<str:cert_hash>/",  views.revoke_certificate,  name="revoke_certificate"),
]
