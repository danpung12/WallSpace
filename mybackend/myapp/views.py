"""
Django REST Framework views for the resume analysis application.

This module contains views for user registration, profile management,
resume CRUD operations, and resume analysis functionality.
"""

# Standard library imports
import os
from typing import Any, Dict, Optional

# Django imports
from django.contrib.auth import get_user_model
from django.utils import timezone

# Third party imports
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

# Local folder imports
from .models import Resume
from .serializers import ResumeSerializer, UserSerializer

User = get_user_model()


class RegisterView(APIView):
    """View for user registration.

    Allows new users to register and receive JWT tokens for authentication.
    """

    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_summary="사용자 등록",
        operation_description="새로운 사용자를 등록하고 JWT 토큰을 발급받습니다.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["username", "email", "password"],
            properties={
                "username": openapi.Schema(
                    type=openapi.TYPE_STRING, description="사용자명"
                ),
                "email": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format=openapi.FORMAT_EMAIL,
                    description="이메일",
                ),
                "password": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format=openapi.FORMAT_PASSWORD,
                    description="비밀번호 (8자 이상)",
                ),
            },
        ),
        responses={
            201: "사용자 등록 성공",
            400: "잘못된 요청 데이터",
        },
    )
    def post(self, request: Request) -> Response:
        """Handle user registration.

        Args:
            request: The HTTP request containing user registration data.

        Returns:
            Response: JWT tokens and user data on success, or validation errors.
        """
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """View for retrieving and updating the authenticated user's profile.

    사용자 프로필 조회 및 수정 뷰
    """

    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self) -> User:
        """Return the authenticated user."""
        return self.request.user


class ResumeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user resumes.

    사용자 이력서 관리 뷰셋. 이력서 CRUD 및 파일 업로드 기능을 제공합니다.
    """

    serializer_class = ResumeSerializer
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    @swagger_auto_schema(
        operation_summary="이력서 목록 조회",
        operation_description="사용자의 모든 이력서 목록을 조회합니다.",
        responses={
            200: ResumeSerializer(many=True),
            401: "인증 실패",
        },
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="이력서 상세 조회",
        operation_description="특정 이력서의 상세 정보를 조회합니다.",
        responses={
            200: ResumeSerializer(),
            401: "인증 실패",
            404: "존재하지 않는 이력서",
        },
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="이력서 생성",
        operation_description="새로운 이력서를 생성합니다.",
        request_body=ResumeSerializer,
        responses={
            201: ResumeSerializer(),
            400: "잘못된 요청 데이터",
            401: "인증 실패",
        },
    )
    def create(self, request, *args, **kwargs):
        """Create a new resume with optional file upload.

        파일 업로드가 포함된 이력서 생성을 처리합니다.
        """
        data = request.data.copy()
        file_obj = request.FILES.get("file")

        # 파일이 있는 경우 유효성 검사
        if file_obj:
            # 파일 유효성 검사
            if not file_obj.name.lower().endswith((".pdf", ".docx", ".doc")):
                return Response(
                    {
                        "error": "지원하지 않는 파일 형식입니다. PDF, DOCX, DOC 파일만 업로드 가능합니다."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 파일 크기 검사 (5MB 제한)
            if file_obj.size > 5 * 1024 * 1024:
                return Response(
                    {"error": "파일 크기는 5MB를 초과할 수 없습니다."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            data["file"] = file_obj

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    @swagger_auto_schema(
        operation_summary="이력서 수정",
        operation_description="기존 이력서를 수정합니다.",
        request_body=ResumeSerializer,
        responses={
            200: ResumeSerializer(),
            400: "잘못된 요청 데이터",
            401: "인증 실패",
            404: "존재하지 않는 이력서",
        },
    )
    def update(self, request, *args, **kwargs):
        """Update a resume with optional file upload.

        파일 업데이트가 포함된 이력서 수정을 처리합니다.
        """
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        data = request.data.copy()
        file_obj = request.FILES.get("file")

        # 파일이 있는 경우 유효성 검사
        if file_obj:
            # 파일 유효성 검사
            if not file_obj.name.lower().endswith((".pdf", ".docx", ".doc")):
                return Response(
                    {
                        "error": "지원하지 않는 파일 형식입니다. PDF, DOCX, DOC 파일만 업로드 가능합니다."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 파일 크기 검사 (5MB 제한)
            if file_obj.size > 5 * 1024 * 1024:
                return Response(
                    {"error": "파일 크기는 5MB를 초과할 수 없습니다."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            data["file"] = file_obj

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    @swagger_auto_schema(
        operation_summary="이력서 삭제",
        operation_description="기존 이력서를 삭제합니다.",
        responses={
            204: "삭제 성공",
            401: "인증 실패",
            404: "존재하지 않는 이력서",
        },
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    def get_parsers(self):
        """
        파일 업로드 요청인 경우 MultiPartParser, 그 외에는 JSONParser를 사용합니다.
        """
        # Always return all parsers and let DRF handle the content type
        return [parser() for parser in self.parser_classes]

    def get_queryset(self):
        """Return resumes belonging to the authenticated user."""
        return Resume.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        """Add the request to the serializer context."""
        return {"request": self.request}

    @swagger_auto_schema(
        method="post",
        operation_summary="파일 업로드",
        operation_description="이력서에 파일을 업로드합니다. (PDF, DOC, DOCX 형식, 최대 5MB)",
        manual_parameters=[
            openapi.Parameter(
                name="file",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_FILE,
                required=True,
                description="업로드할 파일 (PDF, DOC, DOCX)",
            ),
        ],
        responses={
            200: ResumeSerializer(),
            400: "잘못된 파일 형식 또는 크기 초과",
            401: "인증 실패",
            404: "존재하지 않는 이력서",
        },
    )
    @action(detail=True, methods=["post"], parser_classes=[MultiPartParser])
    def upload_file(self, request, pk=None):
        """Upload a file to an existing resume.

        기존 이력서에 파일을 업로드합니다.
        """
        resume = self.get_object()

        # Check if file is in the request
        if "file" not in request.FILES:
            return Response(
                {"error": "파일이 제공되지 않았습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        file_obj = request.FILES["file"]

        # 파일 유효성 검사
        if not file_obj.name.lower().endswith((".pdf", ".docx", ".doc")):
            return Response(
                {
                    "error": "지원하지 않는 파일 형식입니다. PDF, DOCX, DOC 파일만 업로드 가능합니다."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 파일 크기 검사 (5MB 제한)
        if file_obj.size > 5 * 1024 * 1024:
            return Response(
                {"error": "파일 크기는 5MB를 초과할 수 없습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # 기존 파일이 있으면 삭제
            if resume.file:
                resume.file.delete(save=False)

            # 파일 저장
            resume.file = file_obj
            resume.file_uploaded_at = timezone.now()

            # 파일 확장자에 따라 file_type 설정
            file_ext = file_obj.name.split(".")[-1].lower()
            if file_ext == "pdf":
                resume.file_type = "pdf"
            elif file_ext in ["docx", "doc"]:
                resume.file_type = "docx"
            else:
                resume.file_type = "other"

            # 변경된 필드 저장
            update_fields = ["file", "file_uploaded_at", "file_type", "updated_at"]
            resume.save(update_fields=update_fields)

            serializer = self.get_serializer(resume)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback

            error_traceback = traceback.format_exc()
            print(f"Error in upload_file: {error_traceback}")
            return Response(
                {"error": f"파일 업로드 중 오류가 발생했습니다: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @swagger_auto_schema(
        method="delete",
        operation_summary="파일 삭제",
        operation_description="이력서에 첨부된 파일을 삭제합니다.",
        responses={
            200: "파일 삭제 성공",
            401: "인증 실패",
            404: "존재하지 않는 이력서 또는 파일",
        },
    )
    @action(detail=True, methods=["delete"])
    def delete_file(self, request, pk=None):
        """Delete the file associated with a resume."""
        try:
            resume = self.get_object()

            if not resume.file:
                return Response(
                    {"error": "이력서에 첨부된 파일이 없습니다."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 파일 삭제
            try:
                file_path = resume.file.path
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                # 파일 시스템에서 삭제 실패해도 DB 레코드는 업데이트 진행
                print(
                    f"Warning: 파일 삭제 중 오류 발생 (파일이 이미 삭제되었을 수 있음): {str(e)}"
                )

            # 파일 관련 필드 초기화
            resume.file = None
            resume.file_type = ""
            resume.file_uploaded_at = None
            resume.updated_at = timezone.now()
            resume.save(
                update_fields=["file", "file_type", "file_uploaded_at", "updated_at"]
            )

            return Response(
                {"message": "파일이 성공적으로 삭제되었습니다.", "status": "success"},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {
                    "error": f"파일 삭제 중 오류가 발생했습니다: {str(e)}",
                    "status": "error",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def perform_create(self, serializer):
        """Save the resume with the current user."""
        serializer.save(user=self.request.user)


class AnalyzeView(APIView):
    """View for analyzing resumes and retrieving analysis results.

    자소서 분석 뷰
    """

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request: Request, pk: Optional[int] = None) -> Response:
        """Handle resume analysis requests.

        Args:
            request: The HTTP request.
            pk: Primary key of the resume to analyze.

        Returns:
            Response: Analysis results or error message.
        """
        try:
            resume = Resume.objects.get(pk=pk, user=request.user)
            analysis_result = self._perform_analysis(resume)
            resume.analysis_result = analysis_result
            resume.save()
            return Response(analysis_result)
        except Resume.DoesNotExist:
            return Response(
                {"error": "Resume not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def get(self, request: Request, pk: Optional[int] = None) -> Response:
        """Retrieve analysis results for a specific resume.

        Args:
            request: The HTTP request.
            pk: Primary key of the resume.

        Returns:
            Response: Analysis results or status message.
        """
        try:
            resume = Resume.objects.get(pk=pk, user=request.user)
            if not resume.analysis_result:
                return Response(
                    {"status": "not_analyzed"}, status=status.HTTP_204_NO_CONTENT
                )
            return Response(resume.analysis_result)
        except Resume.DoesNotExist:
            return Response(
                {"error": "Resume not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def _perform_analysis(self, resume: Resume) -> Dict[str, Any]:
        """Perform analysis on the given resume.

        Args:
            resume: The Resume instance to analyze.

        Returns:
            Dict containing analysis results.
        """
        # TODO: Implement actual analysis logic
        return {
            "score": 85,
            "suggestions": [
                "자기소개서의 구체적인 경험을 더 추가해보세요.",
                "성과 중심의 표현을 사용해보세요.",
            ],
            "keywords": ["리더십", "도전정신", "성장"],
        }


class AnalyzeResumeView(generics.GenericAPIView):
    """View for analyzing resume content and retrieving analysis results.

    This endpoint accepts resume content and returns analysis results.

    자소서 분석 뷰: 자소서 내용을 분석하고 결과를 반환합니다.
    """

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ResumeSerializer

    def post(
        self, request: Request, pk: int = None, *args: Any, **kwargs: Any
    ) -> Response:
        """Analyze the provided resume content.

        자소서 분석을 처리합니다.

        Args:
            request: The HTTP request containing resume data.
            pk: Primary key of the resume (optional).

        Returns:
            Response: Analysis results or error message.
        """
        # For the /analyze/ endpoint (without pk)
        if pk is None:
            # Get resume_id from request data
            resume_id = request.data.get("resume_id")
            if not resume_id:
                return Response(
                    {"error": "resume_id is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Check if resume exists and belongs to the user
            try:
                resume = Resume.objects.get(pk=resume_id, user=request.user)
            except Resume.DoesNotExist:
                return Response(
                    {"error": "Resume not found"}, status=status.HTTP_404_NOT_FOUND
                )

            # Perform analysis
            analysis_result = self._perform_analysis(resume)
            resume.analysis_result = analysis_result
            resume.save()

            # Return success response with message as expected by tests
            return Response(
                {"message": "Analysis completed"}, status=status.HTTP_200_OK
            )

        # For the /resumes/<pk>/analyze/ endpoint
        try:
            resume = Resume.objects.get(pk=pk, user=request.user)
            analysis_result = self._perform_analysis(resume)
            resume.analysis_result = analysis_result
            resume.save()
            return Response(analysis_result, status=status.HTTP_200_OK)

        except Resume.DoesNotExist:
            return Response(
                {"error": "Resume not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def get(
        self, request: Request, pk: int = None, *args: Any, **kwargs: Any
    ) -> Response:
        """Retrieve analysis results for a resume.

        자소서 분석 결과를 조회합니다.

        Args:
            request: The HTTP request.
            pk: Primary key of the resume.

        Returns:
            Response: Analysis results or status message.
        """
        if pk is None:
            return Response(
                {"error": "Resume ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            resume = Resume.objects.get(pk=pk, user=request.user)
            if not hasattr(resume, "analysis_result") or resume.analysis_result is None:
                return Response(
                    {"status": "not_analyzed"}, status=status.HTTP_204_NO_CONTENT
                )
            return Response(resume.analysis_result, status=status.HTTP_200_OK)

        except Resume.DoesNotExist:
            return Response(
                {"error": "Resume not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def _perform_analysis(self, resume: Resume) -> Dict[str, Any]:
        """Perform analysis on the given resume.

        Args:
            resume: The Resume instance to analyze.

        Returns:
            Dict containing analysis results.
        """
        # TODO: Implement actual analysis logic
        return {
            "score": 85,
            "suggestions": [
                "자기소개서의 구체적인 경험을 더 추가해보세요.",
                "성과 중심의 표현을 사용해보세요.",
            ],
            "keywords": ["리더십", "도전정신", "성장"],
        }
