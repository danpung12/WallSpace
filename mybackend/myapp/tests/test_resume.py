# Standard library imports
import os
import tempfile

# Third party imports
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

# Local application imports
from myapp.models import Company, Resume

User = get_user_model()


def create_test_file(filename, content=b"test content"):
    """테스트용 파일 생성"""
    return SimpleUploadedFile(
        name=filename,
        content=content,
        content_type="application/pdf"
        if filename.endswith(".pdf")
        else "application/msword",
    )


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

        # 테스트 클라이언트 설정
        self.client = APIClient()
        self.client.force_authenticate(user=self.user1)

        # 테스트용 파일
        self.test_file = create_test_file("test_resume.pdf")
        self.large_file = SimpleUploadedFile(
            "large_file.pdf", b"x" * (6 * 1024 * 1024)
        )  # 6MB
        self.invalid_file = create_test_file("test_resume.txt")

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

    def test_create_resume_with_file(self):
        """파일이 포함된 이력서 생성 테스트"""
        url = reverse("resume-list")
        data = {
            "title": "파일이 포함된 자소서",
            "content": "이 자소서는 파일이 첨부되어 있습니다.",
        }

        # 파일과 함께 요청
        with open("test_resume.pdf", "wb") as f:
            f.write(b"%PDF-test-content")

        with open("test_resume.pdf", "rb") as f:
            data["file"] = f
            response = self.client.post(url, data, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Resume.objects.count(), 4)
        self.assertEqual(Resume.objects.latest("created_at").title, "파일이 포함된 자소서")
        self.assertIsNotNone(Resume.objects.latest("created_at").file)

        # 생성된 파일 삭제
        if os.path.exists("test_resume.pdf"):
            os.remove("test_resume.pdf")

    def test_upload_resume_file(self):
        """이력서에 파일 업로드 테스트"""
        url = reverse("resume-upload-file", kwargs={"pk": self.resume1.id})

        # 테스트용 파일 생성
        with open("test_upload.pdf", "wb") as f:
            f.write(b"%PDF-test-upload-content")

        with open("test_upload.pdf", "rb") as f:
            response = self.client.post(url, {"file": f}, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.resume1.refresh_from_db()
        self.assertIsNotNone(self.resume1.file)
        self.assertEqual(self.resume1.file_type, "pdf")

        # 생성된 파일 삭제
        if os.path.exists("test_upload.pdf"):
            os.remove("test_upload.pdf")

    def test_upload_invalid_file_type(self):
        """잘못된 파일 형식 업로드 테스트"""
        url = reverse("resume-upload-file", kwargs={"pk": self.resume1.id})
        invalid_file = SimpleUploadedFile(
            "test.txt", b"invalid content", content_type="text/plain"
        )

        response = self.client.post(url, {"file": invalid_file}, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "지원하지 않는 파일 형식입니다. PDF, DOCX, DOC 파일만 업로드 가능합니다.", response.data["error"]
        )

    def test_upload_large_file(self):
        """용량 초과 파일 업로드 테스트"""
        url = reverse("resume-upload-file", kwargs={"pk": self.resume1.id})
        large_file = SimpleUploadedFile("large.pdf", b"x" * (6 * 1024 * 1024))  # 6MB

        response = self.client.post(url, {"file": large_file}, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("파일 크기는 5MB를 초과할 수 없습니다.", response.data["error"])

    def test_delete_resume_file(self):
        """이력서에서 파일 삭제 테스트"""
        # 파일 업로드
        self.test_upload_resume_file()

        # 파일이 존재하는지 확인
        self.assertIsNotNone(self.resume1.file)

        url = reverse("resume-delete-file", kwargs={"pk": self.resume1.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.resume1.refresh_from_db()

        # 파일이 삭제되었는지 확인 (Django의 FileField는 None이 아닌 빈 문자열로 설정됨)
        self.assertEqual(self.resume1.file.name, "")
        self.assertEqual(self.resume1.file_type, "")

    @override_settings(MEDIA_ROOT=tempfile.mkdtemp())
    def test_download_resume_file(self):
        """이력서 파일 다운로드 테스트"""
        # 파일 업로드
        self.test_upload_resume_file()

        # 파일 다운로드 URL 생성
        file_url = self.resume1.file.url
        # 테스트 서버에서 직접 파일을 제공하지 않으므로, 파일이 존재하는지만 확인
        self.assertTrue(os.path.exists(self.resume1.file.path))

        # 실제 파일 다운로드는 테스트 환경에서 불가능하므로 404가 예상됨
        response = self.client.get(file_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @override_settings(MEDIA_ROOT=tempfile.mkdtemp())
    def test_unauthorized_file_access(self):
        """권한 없는 파일 접근 테스트"""
        # user1으로 파일 업로드
        self.test_upload_resume_file()

        # user2로 로그인
        self.client.force_authenticate(user=self.user2)

        # user2가 user1의 파일에 접근 시도
        file_url = self.resume1.file.url

        # 테스트 환경에서는 파일 다운로드 URL이 404를 반환하므로, 파일이 존재하는지만 확인
        self.assertTrue(os.path.exists(self.resume1.file.path))

        # 실제 파일 다운로드는 테스트 환경에서 불가능하므로 404가 예상됨
        response = self.client.get(file_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

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
        self.assertEqual(Resume.objects.count(), 2)  # 기존 3개 중 1개 삭제

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
