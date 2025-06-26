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

# URL 패턴 정의
urlpatterns = [
    path("admin/", admin.site.urls),
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
