import json
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from myapp.models import Company

User = get_user_model()

class AuthTests(APITestCase):
    def setUp(self):
        # 테스트용 회사 생성
        self.company = Company.objects.create(name='Test Company')
        
        # 테스트용 사용자 생성
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            phone='01012345678',
            company=self.company
        )

    def test_register_user(self):
        """사용자 등록 테스트"""
        url = reverse('register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'phone': '01087654321',
            'company': {'name': 'New Company'}
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 2)  # 기존 사용자 1명 + 새 사용자 1명
        self.assertEqual(response.data['user']['username'], 'newuser')

    def test_login_user(self):
        """사용자 로그인 테스트"""
        url = reverse('token_obtain_pair')
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(url, data, format='json')
        
        # JSON 응답 파싱
        content = json.loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', content)
        self.assertIn('refresh', content)

    def test_refresh_token(self):
        """토큰 갱신 테스트"""
        # 로그인하여 refresh 토큰 획득
        login_url = reverse('token_obtain_pair')
        login_data = {'username': 'testuser', 'password': 'testpass123'}
        login_response = self.client.post(login_url, login_data, format='json')
        login_content = json.loads(login_response.content)
        
        # 토큰 갱신 요청
        refresh_url = reverse('token_refresh')
        refresh_data = {'refresh': login_content['refresh']}
        response = self.client.post(refresh_url, refresh_data, format='json')
        content = json.loads(response.content)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', content)

    def test_get_user_profile(self):
        """사용자 프로필 조회 테스트"""
        # 로그인하여 액세스 토큰 획득
        login_url = reverse('token_obtain_pair')
        login_data = {'username': 'testuser', 'password': 'testpass123'}
        login_response = self.client.post(login_url, login_data, format='json')
        login_content = json.loads(login_response.content)
        
        # 프로필 조회 요청
        profile_url = reverse('user_profile')
        headers = {'HTTP_AUTHORIZATION': f'Bearer {login_content["access"]}'}
        response = self.client.get(profile_url, **headers)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')