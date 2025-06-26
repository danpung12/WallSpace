"""
URL configuration for myproject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
"""

# Django imports
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.generic import RedirectView

# DRF-YASG imports
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

# Schema View 설정
schema_view = get_schema_view(
    openapi.Info(
        title="자소서 분석 API",
        default_version="v1",
        description="자소서 분석 및 관리 API 문서",
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="contact@example.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# Swagger 정보 (settings.py에 정의된 정보 사용)
swagger_info = None

# URL 패턴 정의
urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),
    # API Documentation
    path("", RedirectView.as_view(url="/swagger/", permanent=False), name="index"),
    path(
        "swagger<format>/", schema_view.without_ui(cache_timeout=0), name="schema-json"
    ),
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
    # API Endpoints
    path("api/auth/", include("myapp.urls")),  # JWT 및 커스텀 인증 엔드포인트
]

# 개발 환경에서만 사용되는 URL 패턴
if settings.DEBUG:
    # 정적 및 미디어 파일 서빙
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

    # 디버그 툴바 설정
    try:
        import debug_toolbar

        urlpatterns += [path("__debug__/", include(debug_toolbar.urls))]
    except ImportError:
        pass  # debug_toolbar가 설치되지 않은 경우 무시

    # DRF 로그인 URL (개발 환경에서만 활성화)
    urlpatterns += [path("api-auth/", include("rest_framework.urls"))]
