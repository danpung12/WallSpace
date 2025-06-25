"""
Django REST Framework views for the resume analysis application.

This module contains views for user registration, profile management,
resume CRUD operations, and resume analysis functionality.
"""

# Standard library imports
from typing import Any, Dict, Optional

# Django imports
from django.contrib.auth import get_user_model

# Third party imports
from rest_framework import generics, permissions, status, viewsets
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

<<<<<<< HEAD
    def post(self, request: Request) -> Response:
        """Handle user registration.

        Args:
            request: The HTTP request containing user registration data.

        Returns:
            Response: JWT tokens and user data on success, or validation errors.
        """
=======
    def post(self, request):
>>>>>>> d1e23a3 (스타일: mybackend 전체 Black 포맷팅 적용)
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
<<<<<<< HEAD
    """View for retrieving and updating the authenticated user's profile."""
=======
    """사용자 프로필 조회 및 수정 뷰"""
>>>>>>> d1e23a3 (스타일: mybackend 전체 Black 포맷팅 적용)

    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self) -> User:
        """Return the authenticated user."""
        return self.request.user


class ResumeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user resumes."""

    serializer_class = ResumeSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        """Return resumes belonging to the authenticated user."""
        return Resume.objects.filter(user=self.request.user)

    def perform_create(self, serializer: ResumeSerializer) -> None:
        """Associate the created resume with the authenticated user."""
        serializer.save(user=self.request.user)

<<<<<<< HEAD
    def get_serializer_context(self) -> Dict[str, Any]:
        """Add the request to the serializer context."""
=======
    def get_serializer_context(self):
>>>>>>> d1e23a3 (스타일: mybackend 전체 Black 포맷팅 적용)
        return {"request": self.request}


class AnalyzeView(APIView):
<<<<<<< HEAD
    """View for analyzing resumes and retrieving analysis results."""

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request: Request, pk: Optional[int] = None) -> Response:
        """Analyze a specific resume.

        Args:
            request: The HTTP request.
            pk: Primary key of the resume to analyze.

        Returns:
            Response: Analysis results or error message.
        """
        try:
            resume = Resume.objects.get(pk=pk, user=request.user)
            analysis_result = self._perform_analysis(resume)
=======
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk=None):
        try:
            resume = Resume.objects.get(pk=pk, user=request.user)
            # TODO: 실제 분석 로직 구현 (현재는 더미 데이터 반환)
            analysis_result = {
                "score": 85,
                "suggestions": [
                    "자기소개서의 구체적인 경험을 더 추가해보세요.",
                    "성과 중심의 표현을 사용해보세요.",
                ],
                "keywords": ["리더십", "도전정신", "성장"],
            }
>>>>>>> d1e23a3 (스타일: mybackend 전체 Black 포맷팅 적용)
            resume.analysis_result = analysis_result
            resume.save()
            return Response(analysis_result)
        except Resume.DoesNotExist:
            return Response(
<<<<<<< HEAD
                {"error": "Resume not found"},
                status=status.HTTP_404_NOT_FOUND,
=======
                {"error": "Resume not found"}, status=status.HTTP_404_NOT_FOUND
>>>>>>> d1e23a3 (스타일: mybackend 전체 Black 포맷팅 적용)
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
<<<<<<< HEAD
                    {"status": "not_analyzed"},
                    status=status.HTTP_204_NO_CONTENT,
=======
                    {"status": "not_analyzed"}, status=status.HTTP_204_NO_CONTENT
>>>>>>> d1e23a3 (스타일: mybackend 전체 Black 포맷팅 적용)
                )
            return Response(resume.analysis_result)
        except Resume.DoesNotExist:
            return Response(
<<<<<<< HEAD
                {"error": "Resume not found"},
                status=status.HTTP_404_NOT_FOUND,
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
    """

    permission_classes = (permissions.IsAuthenticated,)

    def post(
        self, request: Request, pk: int = None, *args: Any, **kwargs: Any
    ) -> Response:
        """Analyze the provided resume content.

        Args:
            request: The HTTP request containing resume data.
            pk: Primary key of the resume (optional).

        Returns:
            Response: Analysis results or error message.
        """
        # For the /analyze/ endpoint
        if pk is None:
            resume_id = request.data.get("resume_id")
            if resume_id:
                try:
                    # Check if resume exists, but we don't need the actual object
                    Resume.objects.get(pk=resume_id, user=request.user)
                except Resume.DoesNotExist:
                    return Response(
                        {"error": "Resume not found"}, status=status.HTTP_404_NOT_FOUND
                    )
            return Response({"message": "Analysis endpoint"}, status=status.HTTP_200_OK)

        # For the /resumes/<pk>/analyze/ endpoint
        try:
            Resume.objects.get(pk=pk, user=request.user)
        except Resume.DoesNotExist:
            return Response(
                {"error": "Resume not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # TODO: Implement actual resume analysis logic
        return Response({"message": "Analysis completed"}, status=status.HTTP_200_OK)

    def get(
        self, request: Request, pk: int = None, *args: Any, **kwargs: Any
    ) -> Response:
        """Retrieve analysis results for a resume.

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
        except Resume.DoesNotExist:
            return Response(status=status.HTTP_204_NO_CONTENT)

        # Return analysis results if they exist
        if hasattr(resume, "analysis_result") and resume.analysis_result is not None:
            return Response(resume.analysis_result, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_204_NO_CONTENT)
=======
                {"error": "Resume not found"}, status=status.HTTP_404_NOT_FOUND
            )


class AnalyzeResumeView(generics.CreateAPIView):
    """자소서 분석 뷰"""

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        # 여기에 자소서 분석 로직 구현
        return Response({"message": "Analysis endpoint"}, status=status.HTTP_200_OK)
>>>>>>> d1e23a3 (스타일: mybackend 전체 Black 포맷팅 적용)
