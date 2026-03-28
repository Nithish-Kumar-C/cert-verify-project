from django.urls import path
from . import views

urlpatterns = [
    path("register/",        views.register,        name="register"),
    path("login/",           views.login,           name="login"),
    path("student-login/",   views.student_login,   name="student_login"),
    path("metamask-login/",  views.metamask_login,  name="metamask_login"),
    path("forgot-password/", views.forgot_password, name="forgot_password"),
    path("reset-password/",  views.reset_password,  name="reset_password"),
    path("me/",              views.me,              name="me"),
]