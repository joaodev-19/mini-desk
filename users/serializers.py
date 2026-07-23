from rest_framework import serializers
from .models import User


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True, source='get_full_name')

    role_display = serializers.CharField(
        read_only=True,
        source="get_role_display"
    )

    is_support = serializers.BooleanField(read_only=True)

    class Meta:
        model = User

        fields = [
            'id',

            'username',
            'first_name',
            'last_name',
            'full_name',

            'email',

            'role',
            'role_display',
            'is_support',

            'whatsapp_number',
            'notify_whatsapp',
            'notify_email',
        ]

        read_only_fields = [
            'id',
            'username',
            'role',
            'is_support',
        ]

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User

        fields = [
            'first_name',
            'last_name',
            'email',
            'whatsapp_number',
            'notify_whatsapp',
            'notify_email',
        ]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    password_confirmation = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User

        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'whatsapp_number',
            'notify_whatsapp',
            'notify_email',
            'password',
            'password_confirmation',
        ]

        read_only_fields = [
            'id',
        ]

    def validate(self, attrs):
        password = attrs.get("password")
        password_confirmation = attrs.get("password_confirmation")

        if password != password_confirmation:
            raise serializers.ValidationError(
                {
                    "password_confirmation": ("As senhãs não coincidem.")
                }
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirmation")

        password = validated_data.pop("password")

        return User.objects.create_user(
            password=password,
            role=User.RoleOptions.CLIENT,
            **validated_data,
        )