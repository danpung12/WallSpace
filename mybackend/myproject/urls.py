"""
URL configuration for myproject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

# Django imports
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

# Conditional imports for development only
if settings.DEBUG:
    try:
        # Third party imports
        import debug_toolbar  # noqa: F401

        DEBUG_TOOLBAR_AVAILABLE = True
    except ImportError:
        DEBUG_TOOLBAR_AVAILABLE = False

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("myapp.urls")),  # JWT 및 커스텀 인증 엔드포인트
]

# Development environment specific URLs
if settings.DEBUG:
    # Serve static and media files
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

    # Debug toolbar
    if DEBUG_TOOLBAR_AVAILABLE:
        urlpatterns += [
            path("__debug__/", include(debug_toolbar.urls)),
        ]

    # DRF login URLs
    urlpatterns += [
        path("api-auth/", include("rest_framework.urls")),
    ]
