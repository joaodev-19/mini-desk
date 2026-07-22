from rest_framework import serializers
from .models import Ticket, TicketAttachment, TicketComment
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class TicketCommentSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)

    author = serializers.StringRelatedField(
        read_only=True
    )

    content = serializers.CharField(
        read_only=True
    )

    created_at = serializers.DateTimeField(
        read_only=True
    )

class TicketCreateCommentSerializer(serializers.Serializer):
    content = serializers.CharField()
    
    def create(self, validated_data):
        return TicketComment.objects.create(
            **validated_data
        )


class TicketAttachmentSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)

    uploaded_by = serializers.StringRelatedField(
        read_only=True
    )

    file = serializers.FileField(
        read_only=True
    )

    created_at = serializers.DateTimeField(
        read_only=True
    )

class TicketCreateAttachmentSerializer(serializers.Serializer):
    file = serializers.FileField()

    def create(self, validated_data):
        return TicketAttachment.objects.create(
            **validated_data
        )


class TicketListSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(read_only=True)

    module = serializers.ChoiceField(
        choices=Ticket.ModuleChoices.choices,
        read_only=True,
    )

    module_display = serializers.CharField(
        source="get_module_display",
        read_only=True
    )

    status = serializers.ChoiceField(
        choices=Ticket.TicketStatus.choices,
        read_only=True,
    )

    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True
    )

    created_at = serializers.DateTimeField(
        read_only=True,
    )

    created_by = serializers.StringRelatedField(
        read_only=True,
    )

    assigned_to = serializers.StringRelatedField(
        read_only=True,
    )


class TicketDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(read_only=True)
    description = serializers.CharField(read_only=True)

    module = serializers.ChoiceField(
        choices=Ticket.ModuleChoices.choices,
        read_only=True,
    )

    module_display = serializers.CharField(
        source="get_module_display",
        read_only=True,
    )

    status = serializers.ChoiceField(
        choices=Ticket.TicketStatus.choices,
        read_only=True,
    )

    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )

    created_at = serializers.DateTimeField(
        read_only=True,
    )

    updated_at = serializers.DateTimeField(
        read_only=True,
    )

    resolved_at = serializers.DateTimeField(
        read_only=True,
    )

    created_by = serializers.StringRelatedField(
        read_only=True,
    )

    assigned_to = serializers.StringRelatedField(
        read_only=True,
    )

    comments = TicketCommentSerializer(
        many=True,
        read_only=True
    )

    files = TicketAttachmentSerializer(
        source="attachments",
        many=True,
        read_only=True,
    )


class TicketCreateSerializer(serializers.Serializer):
    title = serializers.CharField(
        max_length=100,
    )

    description = serializers.CharField()

    module = serializers.ChoiceField(
        choices=Ticket.ModuleChoices.choices,
    )

    def create(self, validated_data):
        return Ticket.objects.create(
            **validated_data,
        )


class TicketContentUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(
        max_length=100,
        required=False,
    )

    description = serializers.CharField(
        required=False,
    )

    module = serializers.ChoiceField(
        choices=Ticket.ModuleChoices.choices,
        required=False,
    )

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError(
                "Informe ao menos um campo para atualização."
            )
        return attrs

    def update(self, instance, validated_data):
        instance.title = validated_data.get(
            "title",
            instance.title,
        )

        instance.description = validated_data.get(
            "description",
            instance.description,
        )

        instance.module = validated_data.get(
            "module",
            instance.module,
        )

        instance.save()

        return instance
    

class TicketSupportUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=Ticket.TicketStatus.choices,
        required=False,
    )

    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(
            role=User.RoleOptions.SUPPORT,
        ),
        required=False,
        allow_null=True,
    )

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError(
                "Informe ao menos um campo para atualização."
            )
        return attrs

    def update(self, instance, validated_data):
        previous_status = instance.status

        status_was_sent = "status" in validated_data

        new_status = validated_data.get(
            "status",
            previous_status,
        )

        instance.status = new_status

        instance.assigned_to = validated_data.get(
            "assigned_to",
            instance.assigned_to,
        )

        if status_was_sent and new_status != previous_status:
            if new_status == Ticket.TicketStatus.RESOLVED:
                instance.resolved_at = timezone.now()

            elif new_status in {
                Ticket.TicketStatus.OPEN,
                Ticket.TicketStatus.IN_ANALYSIS,
                Ticket.TicketStatus.WAITING_USER,
            }:
                instance.resolved_at = None

            elif new_status == Ticket.TicketStatus.CLOSED:
                pass

        instance.save()

        return instance