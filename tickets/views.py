from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, render
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

User = get_user_model()

from .models import Ticket
from .serializers import (
    TicketAttachmentSerializer,
    TicketCommentSerializer,
    TicketContentUpdateSerializer,
    TicketCreateAttachmentSerializer,
    TicketCreateCommentSerializer,
    TicketCreateSerializer,
    TicketDetailSerializer,
    TicketListSerializer,
    TicketSupportUpdateSerializer,
)


class TicketListCreateAPIView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
       
        if request.user.is_support:
            tickets = Ticket.objects.all()
        else:
            tickets = Ticket.objects.filter(
                created_by=request.user,
            ).order_by("-updated_at")

        serializer = TicketListSerializer(
            tickets, 
            many=True
        )

        return Response(serializer.data)
    
    def post(self, request):
        serializer = TicketCreateSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        ticket = serializer.save(created_by=request.user)

        output_serializer = TicketDetailSerializer(ticket)

        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

class MyTicketListAPIView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.is_support:
            tickets = Ticket.objects.filter(
                assigned_to=request.user,
            )
        else:
            tickets = Ticket.objects.filter(
                created_by=request.user,
            )

        tickets = tickets.order_by("-updated_at")

        serializer = TicketListSerializer(
            tickets,
            many=True,
        )

        return Response(serializer.data)

class TicketDetailAPIView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        if request.user.is_support:
            ticket = get_object_or_404(Ticket, pk=pk)
        else:
            ticket = get_object_or_404(Ticket, pk=pk, created_by=request.user)

        serializer = TicketDetailSerializer(ticket)

        return Response(serializer.data)
    
    def delete(self, request, pk):
        if not request.user.is_support:
            raise PermissionDenied(
                "Somente suportes podem excluir tickets."
            )
        
        ticket = get_object_or_404(Ticket, pk=pk)
        
        ticket.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class TicketContentUpdateAPIView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        ticket = get_object_or_404(Ticket, pk=pk, created_by=request.user)

        if ticket.status != Ticket.TicketStatus.OPEN:
            raise PermissionDenied(
                "O chamado não pode mais ser editado porque o atendimento já foi iniciado."
            )

        serializer = TicketContentUpdateSerializer(ticket, data=request.data, partial=True)

        serializer.is_valid(raise_exception=True)

        updated_ticket = serializer.save()

        output_serializer = TicketDetailSerializer(updated_ticket)

        return Response(output_serializer.data, status=status.HTTP_200_OK)


class TicketSupportUpdateAPIView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not request.user.is_support:
            raise PermissionDenied(
                "Somente o suporte pode administrar tickets."
            )
            
        ticket = get_object_or_404(Ticket, pk=pk)
        serializer = TicketSupportUpdateSerializer(ticket, data=request.data, partial=True)

        serializer.is_valid(raise_exception=True)

        updated_ticket = serializer.save()

        output_serializer = TicketDetailSerializer(updated_ticket)

        return Response(output_serializer.data, status=status.HTTP_200_OK)


class TicketCommentCreateAPIView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.is_support:
            ticket = get_object_or_404(Ticket, pk=pk)

        else:
            ticket = get_object_or_404(Ticket, pk=pk, created_by=request.user)

        serializer = TicketCreateCommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        comment = serializer.save(ticket=ticket, author=request.user)

        output_serializer = TicketCommentSerializer(comment)

        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class TicketAttachmentCreateAPIView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.is_support:
            ticket = get_object_or_404(Ticket, pk=pk)

        else:
            ticket = get_object_or_404(Ticket, pk=pk, created_by=request.user)

        serializer = TicketCreateAttachmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        attachment = serializer.save(ticket=ticket, uploaded_by=request.user)

        output_serializer = TicketAttachmentSerializer(attachment)

        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


@login_required
def ticket_home_view(request):
    return render(request, 'tickets/index.html')

@login_required
def ticket_list_view(request):
    return render(request, 'tickets/list.html')

@login_required
def ticket_detail_view(request, ticket_id):
    context = {
        "ticket_id": ticket_id
    }

    return render(request, 'tickets/detail.html', context)