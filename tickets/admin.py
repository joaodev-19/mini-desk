from django.contrib import admin
from .models import Ticket

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = (
        'title', 
        'description' , 
        'module', 
        'status', 
        'created_at',
        'updated_at',
        'resolved_at',
        'created_by',
        'assigned_to',
    )