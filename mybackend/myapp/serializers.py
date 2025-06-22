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
        read_only=True, default=serializers.CurrentUserDefault()
    )
    analysis_result = serializers.JSONField(read_only=True)

    class Meta:
        model = Resume
        fields = [
            "id",
            "user",
            "title",
            "content",
            "analysis_result",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
