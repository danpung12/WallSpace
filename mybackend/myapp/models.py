# myapp/models.py
# Django imports
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class Company(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class User(AbstractUser):
    phone = models.CharField(max_length=15, blank=True, null=True)
    company = models.ForeignKey(
        Company, on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")


class Resume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="resumes")
    title = models.CharField(max_length=200)
    content = models.TextField()
    analysis_result = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"
