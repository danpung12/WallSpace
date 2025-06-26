# myapp/models.py
import os
import uuid

from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator
from django.db import models
from django.utils import timezone
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


def get_upload_path(instance, filename):
    """Generate file path for resume upload"""
    ext = filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join("resumes", f"user_{instance.user.id}", filename)


class Resume(models.Model):
    # File type choices
    PDF = "pdf"
    DOCX = "docx"
    DOC = "doc"

    FILE_TYPE_CHOICES = [
        (PDF, "PDF"),
        (DOCX, "DOCX"),
        (DOC, "DOC"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="resumes",
        help_text="이력서를 작성한 사용자",
    )
    title = models.CharField(max_length=200, help_text="이력서 제목")
    content = models.TextField(help_text="이력서 내용 (텍스트)", blank=True, null=True)
    file = models.FileField(
        upload_to=get_upload_path,
        null=True,
        blank=True,
        validators=[
            FileExtensionValidator(
                allowed_extensions=["pdf", "doc", "docx"],
                message="PDF, DOC, DOCX 파일만 업로드 가능합니다.",
            )
        ],
        help_text="업로드된 이력서 파일",
    )
    file_type = models.CharField(
        max_length=10,
        choices=FILE_TYPE_CHOICES,
        blank=True,
        null=True,
        help_text="파일 유형",
    )
    file_uploaded_at = models.DateTimeField(
        null=True, blank=True, help_text="파일 업로드 시간"
    )
    analysis_result = models.JSONField(
        null=True, blank=True, help_text="분석 결과 JSON"
    )
    created_at = models.DateTimeField(auto_now_add=True, help_text="생성 일시")
    updated_at = models.DateTimeField(auto_now=True, help_text="수정 일시")

    class Meta:
        ordering = ["-created_at"]
        verbose_name = _("resume")
        verbose_name_plural = _("resumes")

    def __str__(self):
        return f"{self.title} - {self.user.username}"

    def save(self, *args, **kwargs):
        # 파일이 업로드되면 파일 유형과 업로드 시간 설정
        if self.file and not self.file_type:
            ext = os.path.splitext(self.file.name)[1].lower().lstrip(".")
            if ext in dict(self.FILE_TYPE_CHOICES):
                self.file_type = ext
            self.file_uploaded_at = timezone.now()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """파일 삭제 시 저장된 파일도 함께 삭제"""
        if self.file:
            storage, path = self.file.storage, self.file.path
            super().delete(*args, **kwargs)
            storage.delete(path)
        else:
            super().delete(*args, **kwargs)
