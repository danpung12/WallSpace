# myapp/views.py
from rest_framework import viewsets, status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .models import Resume, Company
from .serializers import UserSerializer, ResumeSerializer, CompanySerializer

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    """사용자 프로필 조회 및 수정 뷰"""
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}

class AnalyzeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk=None):
        try:
            resume = Resume.objects.get(pk=pk, user=request.user)
            # TODO: 실제 분석 로직 구현 (현재는 더미 데이터 반환)
            analysis_result = {
                'score': 85,
                'suggestions': [
                    '자기소개서의 구체적인 경험을 더 추가해보세요.',
                    '성과 중심의 표현을 사용해보세요.'
                ],
                'keywords': ['리더십', '도전정신', '성장']
            }
            resume.analysis_result = analysis_result
            resume.save()
            return Response(analysis_result)
        except Resume.DoesNotExist:
            return Response(
                {'error': 'Resume not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    def get(self, request, pk=None):
        try:
            resume = Resume.objects.get(pk=pk, user=request.user)
            if not resume.analysis_result:
                return Response(
                    {'status': 'not_analyzed'}, 
                    status=status.HTTP_204_NO_CONTENT
                )
            return Response(resume.analysis_result)
        except Resume.DoesNotExist:
            return Response(
                {'error': 'Resume not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class ResumeAnalysisView(APIView):
    """자소서 분석 결과 조회 뷰"""
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request, pk):
        try:
            resume = Resume.objects.get(pk=pk, user=request.user)
            if not resume.analysis_result:
                return Response(
                    {'message': 'No analysis result available'}, 
                    status=status.HTTP_204_NO_CONTENT
                )
            return Response(resume.analysis_result)
        except Resume.DoesNotExist:
            return Response(
                {'error': 'Resume not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class AnalyzeResumeView(APIView):
    """자소서 분석 요청 뷰"""
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request, *args, **kwargs):
        resume_id = request.data.get('resume_id')
        content = request.data.get('content')
        
        # 자소서가 존재하는지 확인 (선택사항)
        if resume_id:
            try:
                resume = Resume.objects.get(pk=resume_id, user=request.user)
                # 여기에 실제 분석 로직 구현
                # 예시: resume.analyze()
                return Response(
                    {'message': 'Analysis completed', 'resume_id': resume_id},
                    status=status.HTTP_200_OK
                )
            except Resume.DoesNotExist:
                # 존재하지 않는 자소서 ID인 경우에도 분석은 계속 진행
                pass
        
        # 자소서 ID가 없거나 존재하지 않는 경우에도 분석 수행
        # 여기에 실제 분석 로직 구현
        return Response(
            {'message': 'Analysis completed for provided content'},
            status=status.HTTP_200_OK
        )