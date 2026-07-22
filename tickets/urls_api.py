from django.urls import path
from .views import (
    TicketListCreateAPIView,
    TicketDetailAPIView,
    TicketContentUpdateAPIView,
    TicketSupportUpdateAPIView,
)

urlpatterns = [
    path('tickets/', TicketListCreateAPIView.as_view(), name="ticket-list-create"),
    path('tickets/<int:pk>/', TicketDetailAPIView.as_view(), name="ticket-detail"),
    path('tickets/<int:pk>/content/', TicketContentUpdateAPIView.as_view(), name="ticket-content-update"),
    path('tickets/<int:pk>/support/', TicketSupportUpdateAPIView.as_view(), name="ticket-support-update"),
]