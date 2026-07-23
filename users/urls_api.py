from django.urls import path

from .views import (
    UserLoginAPIView,
    UserLogoutAPIView,
    CurrentUserAPIView,
)

urlpatterns = [
    path('users/me/', CurrentUserAPIView.as_view(), name='current-user'),
    path('auth/login/', UserLoginAPIView.as_view(), name='login'),
    path('auth/logout/', UserLogoutAPIView.as_view(), name='logout'),
]