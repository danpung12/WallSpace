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
    """ViewSet for managing user resumes."""

    serializer_class = ResumeSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        """Return resumes belonging to the authenticated user."""
        return Resume.objects.filter(user=self.request.user)

    def perform_create(self, serializer: ResumeSerializer) -> None:
        """Associate the created resume with the authenticated user."""
        serializer.save(user=self.request.user)

    def get_serializer_context(self):
        """Add the request to the serializer context."""
        return {"request": self.request}


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
