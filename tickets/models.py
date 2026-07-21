from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.conf import settings

class Ticket(models.Model):
    class ModuleChoices(models.TextChoices):
        CLIENTS = 'clients', _("Clientes")
        PROCESSES = 'processes', _("Processos")
        CALENDAR = 'calendar', _("Calendário")
        DOCUMENTS = 'documents', _("Documentos")
        USERS = 'users', _("Usuários")
        OTHERS = 'others', _("Outros")

    class TicketStatus(models.TextChoices):
        OPEN = 'open', _("Aberto")
        IN_ANALYSIS = 'in_analysis', _("Em Análise")
        WAITING_USER = 'waiting_user', _("Esperando Usuário")
        RESOLVED = 'resolved', _("Resolvido")
        CLOSED = 'closed', _("Fechado")

    title = models.CharField(
        max_length=100,
        blank=False,
        null=False,    
    )

    description = models.TextField(
        blank=False,
        null=False,
    )

    module = models.CharField(
        max_length=10,
        choices=ModuleChoices,
        blank=False,
        null=False,
    )

    status = models.CharField(
        max_length=20,
        choices=TicketStatus,
        default=TicketStatus.OPEN,
        blank=False,
        null=False,
    )

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(blank=True, null=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_tickets',
    )

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='assigned_tickets',
        blank=True,
        null=True
    )

    def __str__(self):
        return f"#{self.pk} - {self.title}"
    

class TicketComment(models.Model):
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='comments',
    )

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='authored_ticket_comments',
    )

    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comentário de {self.author} no ticket #{self.ticket_id}"


class TicketAttachment(models.Model):
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='attachments',
    )
    
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='uploaded_ticket_attachments',
    )

    file = models.FileField(
        upload_to="ticket_attachments/%Y/%m/%d/",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Anexo do ticket #{self.ticket_id}"