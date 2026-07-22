from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.db import models

class User(AbstractUser):
    # Already has first_name, last_name, email and password

    class RoleOptions(models.TextChoices):
        CLIENT = 'client', _("Cliente")
        SUPPORT = 'support', _("Suporte")

    role = models.CharField(
        max_length=10,
        choices=RoleOptions,
        default=RoleOptions.CLIENT,
        blank=False,
        null=False,
    )

    whatsapp_number = models.CharField(
        max_length=20, 
        blank=True
    )

    notify_whatsapp = models.BooleanField(default=False)
    notify_email = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} ({self.role})"
    
    @property
    def is_support(self):
        return self.role == 'support'