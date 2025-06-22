# Standard library imports

# Third party imports
# Django imports
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

# Local application imports
from myapp.models import Company, Resume

User = get_user_model()


class ResumeTests(APITestCase):
    def setUp(self):
        # 테스트용 회사 생성
        self.company = Company.objects.create(name="Test Company")

        # 테스트용 사용자 2명 생성
        self.user1 = User.objects.create_user(
            username="user1",
            email="user1@example.com",
            password="testpass123",
            company=self.company,
        )
        self.user2 = User.objects.create_user(
            username="user2",
            email="user2@example.com",
            password="testpass123",
            company=self.company,
        )

        # user1의 자소서 생성
        self.resume1 = Resume.objects.create(
            user=self.user1,
            title="첫 번째 자소서",
            content="이것은 첫 번째 자소서 내용입니다.",
        )
        self.resume2 = Resume.objects.create(
            user=self.user1,
            title="두 번째 자소서",
            content="이것은 두 번째 자소서 내용입니다.",
        )

        # user2의 자소서 생성
        self.resume3 = Resume.objects.create(
            user=self.user2,
            title="다른 사용자의 자소서",
            content="이것은 다른 사용자의 자소서입니다.",
        )

        # user1으로 로그인
        self.client.force_authenticate(user=self.user1)

    def test_list_resumes(self):
        """자신의 자소서 목록 조회 테스트"""
        url = reverse("resume-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # user1의 자소서는 2개

    def test_retrieve_resume(self):
        """자소서 상세 조회 테스트"""
        url = reverse("resume-detail", args=[self.resume1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "첫 번째 자소서")

    def test_retrieve_other_users_resume(self):
        """다른 사용자의 자소서 조회 시 404 반환 테스트"""
        url = reverse("resume-detail", args=[self.resume3.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_resume(self):
        """자소서 생성 테스트"""
        url = reverse("resume-list")
        data = {
            "title": "새로운 자소서",
            "content": "이것은 새로 작성하는 자소서입니다.",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Resume.objects.count(), 4)  # 기존 3개 + 새로 생성 1개

    def test_update_resume(self):
        """자소서 수정 테스트"""
        url = reverse("resume-detail", args=[self.resume1.id])
        data = {"title": "수정된 제목", "content": "수정된 내용"}
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.resume1.refresh_from_db()
        self.assertEqual(self.resume1.title, "수정된 제목")

    def test_delete_resume(self):
        """자소서 삭제 테스트"""
        # 초기 상태 확인: user1의 자소서 2개, user2의 자소서 1개
        self.assertEqual(Resume.objects.count(), 3)

        # user1의 자소서 1개 삭제
        url = reverse("resume-detail", args=[self.resume1.id])
        response = self.client.delete(url)

        # 상태 코드 검증
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # 삭제 후 남은 자소서 수 검증 (user1: 1개, user2: 1개)
        self.assertEqual(Resume.objects.count(), 2)

        # 삭제된 자소서가 실제로 삭제되었는지 확인
        with self.assertRaises(Resume.DoesNotExist):
            Resume.objects.get(pk=self.resume1.id)

        # user1의 남은 자소서가 정상적으로 조회되는지 확인
        self.assertTrue(Resume.objects.filter(pk=self.resume2.id).exists())

    def test_unauthorized_access(self):
        """인증되지 않은 사용자 접근 테스트"""
        self.client.force_authenticate(user=None)  # 로그아웃
        url = reverse("resume-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
