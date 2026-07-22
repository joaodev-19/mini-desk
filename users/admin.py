from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        'first_name',
        'last_name',
        'email',
        'password',
        'role',
        'whatsapp_number',
        'notify_whatsapp',
        'notify_email',
    )