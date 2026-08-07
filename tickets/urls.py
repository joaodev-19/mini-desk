from django.urls import path
from .views import (
    ticket_home_view,
    ticket_detail_view,
    ticket_list_view,
)

app_name = "tickets"

urlpatterns = [
    path("home/", ticket_home_view, name="home"),
    path("list/", ticket_list_view, name="list"),
    path("<int:ticket_id>/", ticket_detail_view, name="detail"),
]