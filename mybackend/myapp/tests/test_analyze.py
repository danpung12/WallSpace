import json
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from myapp.models import Resume, Company

User = get_user_model()

class AnalyzeTests(APITestCase):
    def setUp(self):
        # 테스트용 회사 생성
        self.company = Company.objects.create(name='Test Company')
        
        # 테스트용 사용자 생성
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            company=self.company
        )
        
        # 테스트용 자소서 생성
        self.resume = Resume.objects.create(
            user=self.user,
            title='테스트 자소서',
            content='이것은 테스트용 자소서 내용입니다. 저는 팀워크를 중요시합니다.'
        )
        
        # 로그인
        self.client.force_authenticate(user=self.user)
    
    def test_analyze_resume(self):
        """자소서 분석 요청 테스트"""
        url = reverse('analyze-resume')
        data = {
            'resume_id': self.resume.id,
            'content': self.resume.content
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Analysis endpoint')
    
    def test_get_analysis_result(self):
        """분석 결과 조회 테스트"""
        # 분석 결과가 없는 경우
        url = reverse('resume-analyze', args=[self.resume.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # 분석 결과가 있는 경우 (더미 데이터로 테스트)
        self.resume.analysis_result = {
            'score': 85,
            'suggestions': ['테스트 제안'],
            'keywords': ['팀워크', '리더십']
        }
        self.resume.save()
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('score', response.data)
        self.assertIn('suggestions', response.data)
        self.assertIn('keywords', response.data)
    
    def test_analyze_nonexistent_resume(self):
        """존재하지 않는 자소서 분석 요청 테스트"""
        url = reverse('analyze-resume')
        data = {
            'resume_id': 999,  # 존재하지 않는 ID
            'content': '내용'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_unauthorized_analysis(self):
        """인증되지 않은 사용자의 분석 요청 테스트"""
        self.client.force_authenticate(user=None)  # 로그아웃
        
        # 분석 요청
        url = reverse('analyze-resume')
        data = {'resume_id': self.resume.id, 'content': '내용'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # 분석 결과 조회
        url = reverse('resume-analyze', args=[self.resume.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
