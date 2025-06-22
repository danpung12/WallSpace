import pytest
from django.contrib.auth import get_user_model
from myapp.models import Resume, Company

User = get_user_model()

@pytest.fixture
def api_client():
    from rest_framework.test import APIClient
    return APIClient()

@pytest.fixture
def test_company():
    return Company.objects.create(name="Test Company")

@pytest.fixture
def test_user(test_company):
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123',
        phone='01012345678',
        company=test_company
    )

@pytest.fixture
def test_resume(test_user):
    return Resume.objects.create(
        user=test_user,
        title='Test Resume',
        content='Test Content',
        analysis_result={'score': 85, 'feedback': 'Good job!'}
    )

@pytest.fixture
def auth_client(api_client, test_user):
    from rest_framework_simplejwt.tokens import RefreshToken
    
    refresh = RefreshToken.for_user(test_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client
