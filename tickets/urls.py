from django.urls import path
from .views import home_view, list_view

app_name = "tickets"

urlpatterns = [
    path("home/", home_view, name="home"),
    path("list/", list_view, name="list"),
]