import random
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from tickets.models import Ticket, TicketAttachment, TicketComment


User = get_user_model()


class Command(BaseCommand):
    help = "Popula o banco com usuários, tickets, comentários e anexos de teste."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Remove os dados anteriores da seed antes de criar novos.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["clear"]:
            self.clear_seed_data()

        clients, supports = self.create_users()
        tickets = self.create_tickets(
            clients=clients,
            supports=supports,
            amount=20,
        )

        self.create_comments(
            tickets=tickets,
            clients=clients,
            supports=supports,
            amount=20,
        )

        self.create_attachments(
            tickets=tickets,
            clients=clients,
            supports=supports,
            amount=20,
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Seed concluída: "
                f"{len(clients) + len(supports)} usuários, "
                "20 tickets, 20 comentários e 20 anexos."
            )
        )

        self.stdout.write("")
        self.stdout.write("Credenciais de teste:")
        self.stdout.write("Cliente: cliente1 / teste123")
        self.stdout.write("Suporte: suporte1 / teste123")
        self.stdout.write("Admin: admin_seed / teste123")

    def clear_seed_data(self):
        """
        Apaga apenas registros reconhecidos como parte desta seed.

        Os tickets são removidos primeiro porque usuários podem estar
        protegidos por ForeignKeys com on_delete=PROTECT.
        """
        seed_tickets = Ticket.objects.filter(
            title__startswith="[SEED]"
        )

        deleted_tickets = seed_tickets.count()
        seed_tickets.delete()

        seed_users = User.objects.filter(
            username__in=[
                "cliente1",
                "cliente2",
                "cliente3",
                "suporte1",
                "suporte2",
                "admin_seed",
            ]
        )

        deleted_users = seed_users.count()
        seed_users.delete()

        self.stdout.write(
            self.style.WARNING(
                f"Seed anterior removida: "
                f"{deleted_tickets} tickets e "
                f"{deleted_users} usuários."
            )
        )

    def create_users(self):
        client_data = [
            {
                "username": "cliente1",
                "first_name": "Ana",
                "last_name": "Oliveira",
                "email": "ana.seed@example.com",
                "whatsapp_number": "69999990001",
            },
            {
                "username": "cliente2",
                "first_name": "Bruno",
                "last_name": "Almeida",
                "email": "bruno.seed@example.com",
                "whatsapp_number": "69999990002",
            },
            {
                "username": "cliente3",
                "first_name": "Carla",
                "last_name": "Ferreira",
                "email": "carla.seed@example.com",
                "whatsapp_number": "69999990003",
            },
        ]

        support_data = [
            {
                "username": "suporte1",
                "first_name": "Diego",
                "last_name": "Suporte",
                "email": "diego.seed@example.com",
                "whatsapp_number": "69999990101",
            },
            {
                "username": "suporte2",
                "first_name": "Eduarda",
                "last_name": "Suporte",
                "email": "eduarda.seed@example.com",
                "whatsapp_number": "69999990102",
            },
        ]

        clients = [
            self.create_or_update_user(
                **data,
                role=User.RoleOptions.CLIENT,
            )
            for data in client_data
        ]

        supports = [
            self.create_or_update_user(
                **data,
                role=User.RoleOptions.SUPPORT,
            )
            for data in support_data
        ]

        admin = self.create_or_update_user(
            username="admin_seed",
            first_name="Administrador",
            last_name="Seed",
            email="admin.seed@example.com",
            whatsapp_number="69999990999",
            role=User.RoleOptions.SUPPORT,
            is_staff=True,
            is_superuser=True,
        )

        supports.append(admin)

        return clients, supports

    def create_or_update_user(
        self,
        *,
        username,
        first_name,
        last_name,
        email,
        whatsapp_number,
        role,
        is_staff=False,
        is_superuser=False,
    ):
        user, _ = User.objects.get_or_create(
            username=username,
        )

        user.first_name = first_name
        user.last_name = last_name
        user.email = email
        user.whatsapp_number = whatsapp_number
        user.role = role
        user.notify_email = True
        user.notify_whatsapp = False
        user.is_active = True
        user.is_staff = is_staff
        user.is_superuser = is_superuser
        user.set_password("teste123")
        user.save()

        return user

    def create_tickets(
        self,
        *,
        clients,
        supports,
        amount,
    ):
        titles = [
            "Erro ao cadastrar cliente",
            "Filtro de processos não funciona",
            "Evento não aparece na agenda",
            "Documento não foi gerado",
            "Página permanece carregando",
            "Erro ao editar telefone",
            "Busca não encontra o cliente",
            "Status do processo não atualiza",
            "Modal não abre corretamente",
            "Arquivo não aparece no documento",
            "Usuário sem acesso ao módulo",
            "Data exibida incorretamente",
            "Erro ao salvar endereço",
            "Agenda mostra evento duplicado",
            "Tela fecha após clicar em salvar",
            "Melhoria na busca de processos",
            "Mensagem de erro pouco clara",
            "Documento com informação incorreta",
            "Cliente duplicado no sistema",
            "Problema ao alterar responsável",
        ]

        descriptions = [
            (
                "Ao executar a ação, o sistema não conclui a operação "
                "e apresenta um comportamento diferente do esperado."
            ),
            (
                "O problema foi reproduzido mais de uma vez. "
                "É necessário analisar a requisição enviada pelo frontend."
            ),
            (
                "A página carrega normalmente, mas a alteração não aparece "
                "depois que o usuário salva os dados."
            ),
            (
                "O usuário tentou novamente após atualizar a página, "
                "mas o mesmo comportamento continuou acontecendo."
            ),
        ]

        statuses = list(Ticket.TicketStatus.values)
        modules = list(Ticket.ModuleChoices.values)

        tickets = []

        for index in range(amount):
            status_value = random.choice(statuses)
            created_at = timezone.now() - timedelta(
                days=random.randint(0, 30),
                hours=random.randint(0, 23),
            )

            assigned_to = random.choice(
                [None, *supports]
            )

            resolved_at = None

            if status_value in {
                Ticket.TicketStatus.RESOLVED,
                Ticket.TicketStatus.CLOSED,
            }:
                resolved_at = created_at + timedelta(
                    hours=random.randint(1, 72)
                )

            ticket = Ticket.objects.create(
                title=f"[SEED] {titles[index]}",
                description=random.choice(descriptions),
                module=random.choice(modules),
                status=status_value,
                created_by=random.choice(clients),
                assigned_to=assigned_to,
                created_at=created_at,
                resolved_at=resolved_at,
            )

            tickets.append(ticket)

        return tickets

    def create_comments(
        self,
        *,
        tickets,
        clients,
        supports,
        amount,
    ):
        contents = [
            "O problema continua acontecendo.",
            "Você consegue enviar mais informações sobre o erro?",
            "Testei novamente e apareceu a mesma mensagem.",
            "Estamos analisando o comportamento informado.",
            "O erro acontece ao clicar no botão Salvar.",
            "A correção foi aplicada. Pode testar novamente?",
            "O problema ocorre apenas nesse cliente.",
            "Depois de atualizar a página, voltou a funcionar.",
            "Enviei mais informações no anexo.",
            "Consegui reproduzir o erro no ambiente de teste.",
        ]

        possible_authors = [*clients, *supports]

        for _ in range(amount):
            ticket = random.choice(tickets)

            TicketComment.objects.create(
                ticket=ticket,
                author=random.choice(possible_authors),
                content=random.choice(contents),
                created_at=(
                    ticket.created_at
                    + timedelta(
                        hours=random.randint(1, 96)
                    )
                ),
            )

    def create_attachments(
        self,
        *,
        tickets,
        clients,
        supports,
        amount,
    ):
        possible_uploaders = [*clients, *supports]

        for index in range(1, amount + 1):
            ticket = random.choice(tickets)
            uploaded_by = random.choice(possible_uploaders)

            attachment = TicketAttachment(
                ticket=ticket,
                uploaded_by=uploaded_by,
                created_at=(
                    ticket.created_at
                    + timedelta(
                        hours=random.randint(1, 96)
                    )
                ),
            )

            file_content = (
                f"Arquivo fictício da seed.\n"
                f"Ticket: {ticket.pk}\n"
                f"Título: {ticket.title}\n"
                f"Enviado por: {uploaded_by.username}\n"
            )

            attachment.file.save(
                f"seed_attachment_{index}.txt",
                ContentFile(file_content.encode("utf-8")),
                save=False,
            )

            attachment.save()