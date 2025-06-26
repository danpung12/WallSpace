# myapp/serializers.py
# Standard library imports

# Django imports
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

# Third party imports
from rest_framework import serializers

# Local application imports
from .models import Company, Resume

User = get_user_model()


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )
    company = CompanySerializer(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "phone", "company"]
        extra_kwargs = {"email": {"required": True}, "password": {"write_only": True}}

    def create(self, validated_data):
        company_data = validated_data.pop("company", None)

        if company_data:
            company, _ = Company.objects.get_or_create(**company_data)
            validated_data["company"] = company

        user = User.objects.create_user(**validated_data)
        return user


class ResumeSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        read_only=True, default=serializers.CurrentUserDefault(), help_text="작성자 ID"
    )
    analysis_result = serializers.JSONField(read_only=True, help_text="분석 결과 JSON")
    file = serializers.FileField(
        required=False,
        allow_null=True,
        max_length=255,
        help_text="업로드된 이력서 파일 (PDF, DOC, DOCX)",
        write_only=True,
    )
    file_url = serializers.SerializerMethodField(
        read_only=True, help_text="파일 다운로드 URL"
    )
    file_type = serializers.CharField(
        read_only=True, help_text="파일 유형 (PDF, DOC, DOCX)"
    )
    file_uploaded_at = serializers.DateTimeField(
        read_only=True, help_text="파일 업로드 일시"
    )

    class Meta:
        model = Resume
        fields = [
            "id",
            "user",
            "title",
            "content",
            "file",
            "file_url",
            "file_type",
            "file_uploaded_at",
            "analysis_result",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "file_url",
            "file_type",
            "file_uploaded_at",
        ]

    def get_file_url(self, obj):
        """파일 다운로드 URL 생성"""
        if obj.file and hasattr(obj.file, "url"):
            request = self.context.get("request")
            if request is not None:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def validate_file(self, value):
        """파일 유효성 검증"""
        if value:
            # 파일 크기 검증 (5MB 제한)
            max_size = 5 * 1024 * 1024  # 5MB
            if value.size > max_size:
                raise serializers.ValidationError(
                    "파일 크기는 5MB를 초과할 수 없습니다."
                )

            # 파일 확장자 검증
            valid_extensions = ["pdf", "doc", "docx"]
            ext = value.name.split(".")[-1].lower()
            if ext not in valid_extensions:
                raise serializers.ValidationError(
                    f"지원하지 않는 파일 형식입니다. 허용되는 형식: {', '.join(valid_extensions)}"
                )
        return value

    def create(self, validated_data):
        """이력서 생성 시 현재 사용자를 작성자로 설정"""
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """이력서 업데이트 시 파일이 있으면 파일 정보 업데이트"""
        file = validated_data.pop("file", None)

        if file:
            # 기존 파일이 있으면 삭제
            if instance.file:
                instance.file.delete(save=False)
            instance.file = file

        return super().update(instance, validated_data)
