from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render

from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


from .serializers import (
    UserSerializer,
    UserLoginSerializer,
    UserProfileUpdateSerializer,
)

class UserLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        user = authenticate(
            request=request,
            username=username,
            password=password,
        )

        if user is None:
            raise AuthenticationFailed("Usuário ou senha inválidos.")

        login(request, user)

        output_serializer = UserSerializer(user,)

        return Response(output_serializer.data, status=status.HTTP_200_OK)


class UserLogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)

        return Response(status=status.HTTP_204_NO_CONTENT)


class CurrentUserAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        serializer = UserSerializer(user)

        return Response(serializer.data)

    def patch(self, request):
        user = request.user

        serializer = UserProfileUpdateSerializer(
            user, data=request.data, partial=True,
        )

        serializer.is_valid(raise_exception=True)

        updated_user = serializer.save()

        output_serializer = UserSerializer(updated_user)

        return Response(output_serializer.data, status=status.HTTP_200_OK)


def login_view(request):
    return render(request, "users/login.html")