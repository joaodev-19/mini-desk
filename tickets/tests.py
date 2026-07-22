from datetime import timedelta
from tempfile import TemporaryDirectory

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db.models.deletion import ProtectedError
from django.test import SimpleTestCase, TestCase, override_settings
from django.urls import resolve, reverse
from django.utils import timezone

from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from .models import Ticket, TicketAttachment, TicketComment
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
from .views import (
    TicketContentUpdateAPIView,
    TicketDetailAPIView,
    TicketListCreateAPIView,
    TicketSupportUpdateAPIView,
)


User = get_user_model()

DEFAULT_PASSWORD = "teste123"


def create_user(
    *,
    username,
    role=None,
    password=DEFAULT_PASSWORD,
    **extra_fields,
):
    """
    Cria um usuário real usando o manager do custom User.
    """

    if role is None:
        role = User.RoleOptions.CLIENT

    return User.objects.create_user(
        username=username,
        password=password,
        role=role,
        **extra_fields,
    )


def create_ticket(*, created_by, **overrides):
    """
    Cria um Ticket válido com valores padrões.
    """

    data = {
        "title": "Erro ao cadastrar cliente",
        "description": "O botão salvar não conclui o cadastro.",
        "module": Ticket.ModuleChoices.CLIENTS,
        "status": Ticket.TicketStatus.OPEN,
        "created_by": created_by,
        "assigned_to": None,
    }

    data.update(overrides)

    return Ticket.objects.create(**data)


# =============================================================================
# MODELS
# =============================================================================


class TicketModelTests(TestCase):
    def setUp(self):
        self.media_directory = TemporaryDirectory()

        self.media_settings = override_settings(
            MEDIA_ROOT=self.media_directory.name,
        )

        self.media_settings.enable()

        self.addCleanup(self.media_settings.disable)
        self.addCleanup(self.media_directory.cleanup)

        self.client_user = create_user(
            username="cliente_model",
        )

        self.support_user = create_user(
            username="suporte_model",
            role=User.RoleOptions.SUPPORT,
        )

    def test_ticket_uses_open_status_by_default(self):
        ticket = create_ticket(
            created_by=self.client_user,
        )

        self.assertEqual(
            ticket.status,
            Ticket.TicketStatus.OPEN,
        )

    def test_ticket_starts_without_assigned_support(self):
        ticket = create_ticket(
            created_by=self.client_user,
        )

        self.assertIsNone(ticket.assigned_to)

    def test_ticket_starts_without_resolved_at(self):
        ticket = create_ticket(
            created_by=self.client_user,
        )

        self.assertIsNone(ticket.resolved_at)

    def test_ticket_has_creation_and_update_dates(self):
        ticket = create_ticket(
            created_by=self.client_user,
        )

        self.assertIsNotNone(ticket.created_at)
        self.assertIsNotNone(ticket.updated_at)

    def test_deleting_assigned_support_sets_assigned_to_null(self):
        ticket = create_ticket(
            created_by=self.client_user,
            assigned_to=self.support_user,
        )

        self.support_user.delete()

        ticket.refresh_from_db()

        self.assertIsNone(ticket.assigned_to)

    def test_comment_is_related_to_ticket_and_author(self):
        ticket = create_ticket(
            created_by=self.client_user,
        )

        comment = TicketComment.objects.create(
            ticket=ticket,
            author=self.client_user,
            content="Comentário de teste.",
        )

        self.assertEqual(comment.ticket, ticket)
        self.assertEqual(comment.author, self.client_user)
        self.assertEqual(comment.content, "Comentário de teste.")

    def test_attachment_is_related_to_ticket_and_uploader(self):
        ticket = create_ticket(
            created_by=self.client_user,
        )

        attachment = TicketAttachment.objects.create(
            ticket=ticket,
            uploaded_by=self.client_user,
            file=SimpleUploadedFile(
                "erro.txt",
                b"conteudo do arquivo",
                content_type="text/plain",
            ),
        )

        self.assertEqual(attachment.ticket, ticket)
        self.assertEqual(
            attachment.uploaded_by,
            self.client_user,
        )
        self.assertTrue(attachment.file.name)

    def test_ticket_exposes_comments_reverse_relationship(self):
        ticket = create_ticket(
            created_by=self.client_user,
        )

        comment = TicketComment.objects.create(
            ticket=ticket,
            author=self.client_user,
            content="Comentário de teste.",
        )

        self.assertIn(
            comment,
            ticket.comments.all(),
        )

    def test_ticket_exposes_files_reverse_relationship(self):
        ticket = create_ticket(
            created_by=self.client_user,
        )

        attachment = TicketAttachment.objects.create(
            ticket=ticket,
            uploaded_by=self.client_user,
            file=SimpleUploadedFile(
                "erro.txt",
                b"conteudo do arquivo",
                content_type="text/plain",
            ),
        )

        self.assertIn(
            attachment,
            ticket.attachments.all(),
        )

    def test_deleting_ticket_deletes_its_comments(self):
        ticket = create_ticket(
            created_by=self.client_user,
        )

        comment = TicketComment.objects.create(
            ticket=ticket,
            author=self.client_user,
            content="Comentário que será apagado.",
        )

        ticket.delete()

        self.assertFalse(
            TicketComment.objects.filter(
                pk=comment.pk,
            ).exists()
        )

    def test_deleting_ticket_deletes_attachment_records(self):
        ticket = create_ticket(
            created_by=self.client_user,
        )

        attachment = TicketAttachment.objects.create(
            ticket=ticket,
            uploaded_by=self.client_user,
            file=SimpleUploadedFile(
                "erro.txt",
                b"conteudo",
                content_type="text/plain",
            ),
        )

        ticket.delete()

        self.assertFalse(
            TicketAttachment.objects.filter(
                pk=attachment.pk,
            ).exists()
        )

    def test_comment_author_cannot_be_deleted(self):
        ticket = create_ticket(
            created_by=self.client_user,
        )

        TicketComment.objects.create(
            ticket=ticket,
            author=self.support_user,
            content="Resposta do suporte.",
        )

        with self.assertRaises(ProtectedError):
            self.support_user.delete()

    def test_attachment_uploader_cannot_be_deleted(self):
        ticket = create_ticket(
            created_by=self.client_user,
        )

        TicketAttachment.objects.create(
            ticket=ticket,
            uploaded_by=self.support_user,
            file=SimpleUploadedFile(
                "log.txt",
                b"log do sistema",
                content_type="text/plain",
            ),
        )

        with self.assertRaises(ProtectedError):
            self.support_user.delete()


# =============================================================================
# SERIALIZERS DE TICKET
# =============================================================================


class TicketSerializerTests(TestCase):
    def setUp(self):
        self.client_user = create_user(
            username="cliente_serializer",
            first_name="Cliente",
            last_name="Teste",
        )

        self.other_client = create_user(
            username="outro_cliente_serializer",
        )

        self.support_user = create_user(
            username="suporte_serializer",
            first_name="Suporte",
            last_name="Teste",
            role=User.RoleOptions.SUPPORT,
        )

        self.ticket = create_ticket(
            created_by=self.client_user,
            assigned_to=self.support_user,
        )

    def test_list_serializer_returns_expected_fields(self):
        serializer = TicketListSerializer(self.ticket)

        self.assertEqual(
            set(serializer.data.keys()),
            {
                "id",
                "title",
                "module",
                "module_display",
                "status",
                "status_display",
                "created_at",
                "created_by",
                "assigned_to",
            },
        )

    def test_list_serializer_returns_internal_and_display_module(self):
        serializer = TicketListSerializer(self.ticket)

        self.assertEqual(
            serializer.data["module"],
            Ticket.ModuleChoices.CLIENTS,
        )

        self.assertEqual(
            serializer.data["module_display"],
            "Clientes",
        )

    def test_list_serializer_returns_internal_and_display_status(self):
        serializer = TicketListSerializer(self.ticket)

        self.assertEqual(
            serializer.data["status"],
            Ticket.TicketStatus.OPEN,
        )

        self.assertEqual(
            serializer.data["status_display"],
            "Aberto",
        )

    def test_create_serializer_accepts_valid_data(self):
        serializer = TicketCreateSerializer(
            data={
                "title": "Erro na agenda",
                "description": "O evento não foi exibido.",
                "module": Ticket.ModuleChoices.CALENDAR,
            }
        )

        self.assertTrue(
            serializer.is_valid(),
            serializer.errors,
        )

    def test_create_serializer_creates_ticket_for_received_user(self):
        serializer = TicketCreateSerializer(
            data={
                "title": "Erro na agenda",
                "description": "O evento não foi exibido.",
                "module": Ticket.ModuleChoices.CALENDAR,
            }
        )

        serializer.is_valid(raise_exception=True)

        ticket = serializer.save(
            created_by=self.client_user,
        )

        self.assertEqual(
            ticket.created_by,
            self.client_user,
        )

        self.assertEqual(
            ticket.status,
            Ticket.TicketStatus.OPEN,
        )

        self.assertIsNone(ticket.assigned_to)

    def test_create_serializer_rejects_invalid_module(self):
        serializer = TicketCreateSerializer(
            data={
                "title": "Erro",
                "description": "Descrição do erro.",
                "module": "modulo_inexistente",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("module", serializer.errors)

    def test_create_serializer_rejects_title_longer_than_limit(self):
        serializer = TicketCreateSerializer(
            data={
                "title": "x" * 101,
                "description": "Descrição.",
                "module": Ticket.ModuleChoices.CLIENTS,
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("title", serializer.errors)

    def test_content_update_changes_sent_field(self):
        original_description = self.ticket.description
        original_module = self.ticket.module

        serializer = TicketContentUpdateSerializer(
            self.ticket,
            data={
                "title": "Título atualizado",
            },
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        updated_ticket = serializer.save()

        self.assertEqual(
            updated_ticket.title,
            "Título atualizado",
        )

        self.assertEqual(
            updated_ticket.description,
            original_description,
        )

        self.assertEqual(
            updated_ticket.module,
            original_module,
        )

    def test_content_update_rejects_empty_payload(self):
        serializer = TicketContentUpdateSerializer(
            self.ticket,
            data={},
            partial=True,
        )

        self.assertFalse(serializer.is_valid())

        self.assertIn(
            "non_field_errors",
            serializer.errors,
        )

    def test_support_update_accepts_support_user_as_assigned_to(self):
        serializer = TicketSupportUpdateSerializer(
            self.ticket,
            data={
                "assigned_to": self.support_user.pk,
            },
            partial=True,
        )

        self.assertTrue(
            serializer.is_valid(),
            serializer.errors,
        )

        updated_ticket = serializer.save()

        self.assertEqual(
            updated_ticket.assigned_to,
            self.support_user,
        )

    def test_support_update_rejects_client_as_assigned_to(self):
        serializer = TicketSupportUpdateSerializer(
            self.ticket,
            data={
                "assigned_to": self.other_client.pk,
            },
            partial=True,
        )

        self.assertFalse(serializer.is_valid())

        self.assertIn(
            "assigned_to",
            serializer.errors,
        )

    def test_support_update_allows_removing_assigned_to(self):
        serializer = TicketSupportUpdateSerializer(
            self.ticket,
            data={
                "assigned_to": None,
            },
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        updated_ticket = serializer.save()

        self.assertIsNone(updated_ticket.assigned_to)

    def test_support_update_rejects_empty_payload(self):
        serializer = TicketSupportUpdateSerializer(
            self.ticket,
            data={},
            partial=True,
        )

        self.assertFalse(serializer.is_valid())

        self.assertIn(
            "non_field_errors",
            serializer.errors,
        )

    def test_marking_ticket_as_resolved_sets_resolved_at(self):
        serializer = TicketSupportUpdateSerializer(
            self.ticket,
            data={
                "status": Ticket.TicketStatus.RESOLVED,
            },
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        updated_ticket = serializer.save()

        self.assertEqual(
            updated_ticket.status,
            Ticket.TicketStatus.RESOLVED,
        )

        self.assertIsNotNone(
            updated_ticket.resolved_at,
        )

    def test_changing_assigned_to_does_not_change_existing_resolved_at(self):
        original_resolved_at = (
            timezone.now() - timedelta(hours=2)
        )

        self.ticket.status = Ticket.TicketStatus.RESOLVED
        self.ticket.resolved_at = original_resolved_at
        self.ticket.save()

        second_support = create_user(
            username="segundo_suporte",
            role=User.RoleOptions.SUPPORT,
        )

        serializer = TicketSupportUpdateSerializer(
            self.ticket,
            data={
                "assigned_to": second_support.pk,
            },
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        updated_ticket = serializer.save()

        self.assertEqual(
            updated_ticket.resolved_at,
            original_resolved_at,
        )

    def test_closing_resolved_ticket_preserves_resolved_at(self):
        original_resolved_at = (
            timezone.now() - timedelta(hours=2)
        )

        self.ticket.status = Ticket.TicketStatus.RESOLVED
        self.ticket.resolved_at = original_resolved_at
        self.ticket.save()

        serializer = TicketSupportUpdateSerializer(
            self.ticket,
            data={
                "status": Ticket.TicketStatus.CLOSED,
            },
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        updated_ticket = serializer.save()

        self.assertEqual(
            updated_ticket.status,
            Ticket.TicketStatus.CLOSED,
        )

        self.assertEqual(
            updated_ticket.resolved_at,
            original_resolved_at,
        )

    def test_reopening_resolved_ticket_clears_resolved_at(self):
        self.ticket.status = Ticket.TicketStatus.RESOLVED
        self.ticket.resolved_at = (
            timezone.now() - timedelta(hours=2)
        )
        self.ticket.save()

        serializer = TicketSupportUpdateSerializer(
            self.ticket,
            data={
                "status": Ticket.TicketStatus.IN_ANALYSIS,
            },
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        updated_ticket = serializer.save()

        self.assertEqual(
            updated_ticket.status,
            Ticket.TicketStatus.IN_ANALYSIS,
        )

        self.assertIsNone(
            updated_ticket.resolved_at,
        )


# =============================================================================
# SERIALIZERS DE COMENTÁRIOS
# =============================================================================


class TicketCommentSerializerTests(TestCase):
    def setUp(self):
        self.client_user = create_user(
            username="cliente_comment",
        )

        self.ticket = create_ticket(
            created_by=self.client_user,
        )

    def test_comment_read_serializer_returns_expected_data(self):
        comment = TicketComment.objects.create(
            ticket=self.ticket,
            author=self.client_user,
            content="Detalhes adicionais.",
        )

        serializer = TicketCommentSerializer(comment)

        self.assertEqual(
            serializer.data["id"],
            comment.pk,
        )

        self.assertEqual(
            serializer.data["author"],
            str(self.client_user),
        )

        self.assertEqual(
            serializer.data["content"],
            "Detalhes adicionais.",
        )

        self.assertIn(
            "created_at",
            serializer.data,
        )

    def test_comment_create_serializer_creates_comment(self):
        serializer = TicketCreateCommentSerializer(
            data={
                "content": "Novo comentário.",
            }
        )

        serializer.is_valid(raise_exception=True)

        comment = serializer.save(
            ticket=self.ticket,
            author=self.client_user,
        )

        self.assertEqual(
            comment.ticket,
            self.ticket,
        )

        self.assertEqual(
            comment.author,
            self.client_user,
        )

        self.assertEqual(
            comment.content,
            "Novo comentário.",
        )

    def test_comment_create_serializer_rejects_empty_content(self):
        serializer = TicketCreateCommentSerializer(
            data={
                "content": "",
            }
        )

        self.assertFalse(serializer.is_valid())

        self.assertIn(
            "content",
            serializer.errors,
        )


# =============================================================================
# SERIALIZERS DE ANEXOS
# =============================================================================


class TicketAttachmentSerializerTests(TestCase):
    def setUp(self):
        self.media_directory = TemporaryDirectory()

        self.media_settings = override_settings(
            MEDIA_ROOT=self.media_directory.name,
        )

        self.media_settings.enable()

        self.addCleanup(self.media_settings.disable)
        self.addCleanup(self.media_directory.cleanup)

        self.client_user = create_user(
            username="cliente_attachment",
        )

        self.ticket = create_ticket(
            created_by=self.client_user,
        )

    def test_attachment_read_serializer_returns_expected_data(self):
        attachment = TicketAttachment.objects.create(
            ticket=self.ticket,
            uploaded_by=self.client_user,
            file=SimpleUploadedFile(
                "erro.txt",
                b"conteudo",
                content_type="text/plain",
            ),
        )

        serializer = TicketAttachmentSerializer(
            attachment,
        )

        self.assertEqual(
            serializer.data["id"],
            attachment.pk,
        )

        self.assertEqual(
            serializer.data["uploaded_by"],
            str(self.client_user),
        )

        self.assertIn(
            "erro",
            serializer.data["file"],
        )

        self.assertIn(
            "created_at",
            serializer.data,
        )

    def test_attachment_create_serializer_creates_attachment(self):
        serializer = TicketCreateAttachmentSerializer(
            data={
                "file": SimpleUploadedFile(
                    "print.txt",
                    b"conteudo do print",
                    content_type="text/plain",
                )
            }
        )

        serializer.is_valid(raise_exception=True)

        attachment = serializer.save(
            ticket=self.ticket,
            uploaded_by=self.client_user,
        )

        self.assertEqual(
            attachment.ticket,
            self.ticket,
        )

        self.assertEqual(
            attachment.uploaded_by,
            self.client_user,
        )

        self.assertTrue(
            attachment.file.name.endswith("print.txt"),
        )

    def test_attachment_create_serializer_requires_file(self):
        serializer = TicketCreateAttachmentSerializer(
            data={},
        )

        self.assertFalse(serializer.is_valid())

        self.assertIn(
            "file",
            serializer.errors,
        )


# =============================================================================
# SERIALIZER DE DETALHES COM RELAÇÕES
# =============================================================================


class TicketDetailSerializerTests(TestCase):
    def setUp(self):
        self.media_directory = TemporaryDirectory()

        self.media_settings = override_settings(
            MEDIA_ROOT=self.media_directory.name,
        )

        self.media_settings.enable()

        self.addCleanup(self.media_settings.disable)
        self.addCleanup(self.media_directory.cleanup)

        self.client_user = create_user(
            username="cliente_detail",
        )

        self.ticket = create_ticket(
            created_by=self.client_user,
        )

    def test_detail_serializer_includes_comments(self):
        TicketComment.objects.create(
            ticket=self.ticket,
            author=self.client_user,
            content="Comentário incluído.",
        )

        serializer = TicketDetailSerializer(
            self.ticket,
        )

        self.assertEqual(
            len(serializer.data["comments"]),
            1,
        )

        self.assertEqual(
            serializer.data["comments"][0]["content"],
            "Comentário incluído.",
        )

    def test_detail_serializer_includes_files(self):
        TicketAttachment.objects.create(
            ticket=self.ticket,
            uploaded_by=self.client_user,
            file=SimpleUploadedFile(
                "arquivo.txt",
                b"conteudo",
                content_type="text/plain",
            ),
        )

        serializer = TicketDetailSerializer(
            self.ticket,
        )

        self.assertEqual(
            len(serializer.data["files"]),
            1,
        )

        self.assertIn(
            "arquivo",
            serializer.data["files"][0]["file"],
        )


# =============================================================================
# VIEWS / ENDPOINTS
# =============================================================================


class TicketAPIViewTests(APITestCase):
    def setUp(self):
        self.client_user = create_user(
            username="cliente_view",
        )

        self.other_client = create_user(
            username="outro_cliente_view",
        )

        self.support_user = create_user(
            username="suporte_view",
            role=User.RoleOptions.SUPPORT,
        )

        self.client_ticket = create_ticket(
            created_by=self.client_user,
            title="Ticket do cliente",
        )

        self.other_ticket = create_ticket(
            created_by=self.other_client,
            title="Ticket de outro cliente",
        )

        self.list_create_url = reverse(
            "ticket-list-create"
        )

    def detail_url(self, ticket):
        return reverse(
            "ticket-detail",
            kwargs={
                "pk": ticket.pk,
            },
        )

    def content_update_url(self, ticket):
        return reverse(
            "ticket-content-update",
            kwargs={
                "pk": ticket.pk,
            },
        )

    def support_update_url(self, ticket):
        return reverse(
            "ticket-support-update",
            kwargs={
                "pk": ticket.pk,
            },
        )

    def authenticate(self, user):
        self.client.force_authenticate(
            user=user,
        )

    def test_unauthenticated_user_cannot_list_tickets(self):
        client = APIClient()

        response = client.get(
            self.list_create_url,
        )

        self.assertIn(
            response.status_code,
            {
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN,
            },
        )

    def test_client_lists_only_own_tickets(self):
        self.authenticate(self.client_user)

        response = self.client.get(
            self.list_create_url,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        returned_ids = {
            ticket["id"]
            for ticket in response.data
        }

        self.assertEqual(
            returned_ids,
            {
                self.client_ticket.pk,
            },
        )

    def test_support_lists_all_tickets(self):
        self.authenticate(self.support_user)

        response = self.client.get(
            self.list_create_url,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        returned_ids = {
            ticket["id"]
            for ticket in response.data
        }

        self.assertEqual(
            returned_ids,
            {
                self.client_ticket.pk,
                self.other_ticket.pk,
            },
        )

    def test_client_creates_ticket_owned_by_authenticated_user(self):
        self.authenticate(self.client_user)

        payload = {
            "title": "Novo erro",
            "description": "Descrição do erro.",
            "module": Ticket.ModuleChoices.CLIENTS,
        }

        response = self.client.post(
            self.list_create_url,
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        ticket = Ticket.objects.get(
            title="Novo erro",
        )

        self.assertEqual(
            ticket.created_by,
            self.client_user,
        )

        self.assertEqual(
            ticket.status,
            Ticket.TicketStatus.OPEN,
        )

        self.assertEqual(
            response.data["id"],
            ticket.pk,
        )

    def test_create_ticket_rejects_invalid_payload(self):
        self.authenticate(self.client_user)

        response = self.client.post(
            self.list_create_url,
            {
                "title": "",
                "description": "Descrição.",
                "module": "modulo_invalido",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "title",
            response.data,
        )

        self.assertIn(
            "module",
            response.data,
        )

    def test_client_retrieves_own_ticket(self):
        self.authenticate(self.client_user)

        response = self.client.get(
            self.detail_url(
                self.client_ticket,
            ),
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["id"],
            self.client_ticket.pk,
        )

    def test_client_cannot_retrieve_another_clients_ticket(self):
        self.authenticate(self.client_user)

        response = self.client.get(
            self.detail_url(
                self.other_ticket,
            ),
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_support_can_retrieve_any_ticket(self):
        self.authenticate(self.support_user)

        response = self.client.get(
            self.detail_url(
                self.other_ticket,
            ),
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["id"],
            self.other_ticket.pk,
        )

    def test_client_updates_own_ticket_content(self):
        self.authenticate(self.client_user)

        response = self.client.patch(
            self.content_update_url(
                self.client_ticket,
            ),
            {
                "description": "Descrição corrigida.",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.client_ticket.refresh_from_db()

        self.assertEqual(
            self.client_ticket.description,
            "Descrição corrigida.",
        )

        self.assertEqual(
            response.data["description"],
            "Descrição corrigida.",
        )

    def test_client_cannot_update_another_clients_ticket(self):
        self.authenticate(self.client_user)

        response = self.client.patch(
            self.content_update_url(
                self.other_ticket,
            ),
            {
                "description": "Tentativa indevida.",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_content_update_rejects_empty_payload(self):
        self.authenticate(self.client_user)

        response = self.client.patch(
            self.content_update_url(
                self.client_ticket,
            ),
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_client_cannot_use_support_update_endpoint(self):
        self.authenticate(self.client_user)

        response = self.client.patch(
            self.support_update_url(
                self.client_ticket,
            ),
            {
                "status": Ticket.TicketStatus.IN_ANALYSIS,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_support_updates_ticket_status_and_assignee(self):
        self.authenticate(self.support_user)

        response = self.client.patch(
            self.support_update_url(
                self.client_ticket,
            ),
            {
                "status": Ticket.TicketStatus.IN_ANALYSIS,
                "assigned_to": self.support_user.pk,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.client_ticket.refresh_from_db()

        self.assertEqual(
            self.client_ticket.status,
            Ticket.TicketStatus.IN_ANALYSIS,
        )

        self.assertEqual(
            self.client_ticket.assigned_to,
            self.support_user,
        )

        self.assertEqual(
            response.data["status"],
            Ticket.TicketStatus.IN_ANALYSIS,
        )

        self.assertEqual(
            response.data["id"],
            self.client_ticket.pk,
        )

    def test_client_cannot_delete_ticket(self):
        self.authenticate(self.client_user)

        response = self.client.delete(
            self.detail_url(
                self.client_ticket,
            ),
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.assertTrue(
            Ticket.objects.filter(
                pk=self.client_ticket.pk,
            ).exists()
        )

    def test_support_can_delete_ticket(self):
        self.authenticate(self.support_user)

        response = self.client.delete(
            self.detail_url(
                self.client_ticket,
            ),
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            Ticket.objects.filter(
                pk=self.client_ticket.pk,
            ).exists()
        )


# =============================================================================
# URLS
# =============================================================================


class TicketURLTests(SimpleTestCase):
    def test_list_create_url_resolves_correct_view(self):
        url = reverse(
            "ticket-list-create",
        )

        match = resolve(url)

        self.assertIs(
            match.func.view_class,
            TicketListCreateAPIView,
        )

    def test_detail_url_resolves_correct_view(self):
        url = reverse(
            "ticket-detail",
            kwargs={
                "pk": 10,
            },
        )

        match = resolve(url)

        self.assertIs(
            match.func.view_class,
            TicketDetailAPIView,
        )

        self.assertEqual(
            match.kwargs["pk"],
            10,
        )

    def test_content_update_url_resolves_correct_view(self):
        url = reverse(
            "ticket-content-update",
            kwargs={
                "pk": 10,
            },
        )

        match = resolve(url)

        self.assertIs(
            match.func.view_class,
            TicketContentUpdateAPIView,
        )

    def test_support_update_url_resolves_correct_view(self):
        url = reverse(
            "ticket-support-update",
            kwargs={
                "pk": 10,
            },
        )

        match = resolve(url)

        self.assertIs(
            match.func.view_class,
            TicketSupportUpdateAPIView,
        )