from django.urls import path
from .views import MiniDeskLoginView

app_name = "users"

urlpatterns = [
    path('login/', MiniDeskLoginView.as_view(), name='login'),
]
