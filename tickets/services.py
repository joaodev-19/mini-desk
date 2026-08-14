from .models import Ticket
from rest_framework.exceptions import ValidationError
from django.utils import timezone

ALLOWED_STATUS_TRANSITIONS = {
    Ticket.TicketStatus.OPEN: {
        Ticket.TicketStatus.IN_ANALYSIS,
    },

    Ticket.TicketStatus.IN_ANALYSIS: {
        Ticket.TicketStatus.WAITING_USER,
        Ticket.TicketStatus.RESOLVED,
    },

    Ticket.TicketStatus.WAITING_USER: {
        Ticket.TicketStatus.IN_ANALYSIS,
        Ticket.TicketStatus.RESOLVED,
    },

    Ticket.TicketStatus.RESOLVED: {
        Ticket.TicketStatus.CLOSED,
        Ticket.TicketStatus.OPEN,
    },

    Ticket.TicketStatus.CLOSED: {
        Ticket.TicketStatus.OPEN,
    },
}

# TO DO: registrar notificações para timeline

def update_ticket_status(
        *,
        ticket,
        new_status,
        user,
) -> Ticket:
    if not user.is_support:
        raise ValidationError(
            "Apenas usuários de suporte podem alterar o status."
        )
    
    current_status = ticket.status

    allowed_statuses = ALLOWED_STATUS_TRANSITIONS.get(
        current_status,
        set(),
    )


    if new_status not in allowed_statuses:
        raise ValidationError("Transição de status inválida.")

    if current_status == Ticket.TicketStatus.OPEN and new_status == Ticket.TicketStatus.IN_ANALYSIS:
        ticket.assigned_to = user

    if new_status == Ticket.TicketStatus.RESOLVED:
        ticket.resolved_at = timezone.now()

    if new_status == Ticket.TicketStatus.OPEN:
        ticket.resolved_at = None
        ticket.assigned_to = None

    ticket.status = new_status

    ticket.save(
        update_fields=[
            "status",
            "assigned_to",
            "resolved_at",
            "updated_at",
        ]
    )

    return Ticket