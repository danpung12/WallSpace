from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import views

router = DefaultRouter()
router.register(r'resumes', views.ResumeViewSet, basename='resume')

urlpatterns = [
    # 인증 관련
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.UserProfileView.as_view(), name='user_profile'),
    
    # 자소서 분석
    path('analyze/', views.AnalyzeResumeView.as_view(), name='analyze-resume'),
    
    # 자소서 CRUD
    path('', include(router.urls)),
]
