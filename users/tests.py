from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase
from django.urls import resolve, reverse

from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from .serializers import (
    UserSerializer,
    UserProfileUpdateSerializer,
    UserCreateSerializer,
    UserLoginSerializer,
)
from .views import (
    UserLoginAPIView,
    UserLogoutAPIView,
    CurrentUserAPIView,
)


User = get_user_model()

DEFAULT_PASSWORD = "teste123"


def create_user(
    *,
    username,
    password=DEFAULT_PASSWORD,
    role=None,
    **extra_fields,
):
    """
    Cria um usuário usando o manager oficial do Django,
    garantindo que a senha seja armazenada com hash.
    """

    if role is None:
        role = User.RoleOptions.CLIENT

    return User.objects.create_user(
        username=username,
        password=password,
        role=role,
        **extra_fields,
    )


# =============================================================================
# MODEL
# =============================================================================


class UserModelTests(TestCase):
    def test_user_uses_client_role_by_default(self):
        user = User.objects.create_user(
            username="cliente_padrao",
            password=DEFAULT_PASSWORD,
        )

        self.assertEqual(
            user.role,
            User.RoleOptions.CLIENT,
        )

    def test_client_is_not_support(self):
        user = create_user(
            username="cliente",
            role=User.RoleOptions.CLIENT,
        )

        self.assertFalse(user.is_support)

    def test_support_user_is_support(self):
        user = create_user(
            username="suporte",
            role=User.RoleOptions.SUPPORT,
        )

        self.assertTrue(user.is_support)

    def test_password_is_stored_with_hash(self):
        user = create_user(
            username="usuario_senha",
            password=DEFAULT_PASSWORD,
        )

        self.assertNotEqual(
            user.password,
            DEFAULT_PASSWORD,
        )

        self.assertTrue(
            user.check_password(DEFAULT_PASSWORD),
        )

    def test_user_notification_defaults(self):
        user = create_user(
            username="usuario_notificacoes",
        )

        self.assertTrue(user.notify_email)
        self.assertFalse(user.notify_whatsapp)


# =============================================================================
# SERIALIZER DE LEITURA
# =============================================================================


class UserSerializerTests(TestCase):
    def setUp(self):
        self.user = create_user(
            username="joao",
            first_name="João",
            last_name="Silva",
            email="joao@example.com",
            whatsapp_number="69999999999",
            role=User.RoleOptions.SUPPORT,
        )

    def test_user_serializer_returns_expected_fields(self):
        serializer = UserSerializer(self.user)

        self.assertEqual(
            set(serializer.data.keys()),
            {
                "id",
                "username",
                "first_name",
                "last_name",
                "full_name",
                "email",
                "role",
                "role_display",
                "is_support",
                "whatsapp_number",
                "notify_whatsapp",
                "notify_email",
            },
        )

    def test_user_serializer_returns_full_name(self):
        serializer = UserSerializer(self.user)

        self.assertEqual(
            serializer.data["full_name"],
            "João Silva",
        )

    def test_user_serializer_returns_role(self):
        serializer = UserSerializer(self.user)

        self.assertEqual(
            serializer.data["role"],
            User.RoleOptions.SUPPORT,
        )

    def test_user_serializer_returns_role_display(self):
        serializer = UserSerializer(self.user)

        self.assertEqual(
            serializer.data["role_display"],
            self.user.get_role_display(),
        )

    def test_user_serializer_returns_is_support(self):
        serializer = UserSerializer(self.user)

        self.assertTrue(
            serializer.data["is_support"],
        )

    def test_user_serializer_never_returns_password(self):
        serializer = UserSerializer(self.user)

        self.assertNotIn(
            "password",
            serializer.data,
        )

    def test_user_serializer_never_returns_permission_fields(self):
        serializer = UserSerializer(self.user)

        self.assertNotIn(
            "is_superuser",
            serializer.data,
        )

        self.assertNotIn(
            "is_staff",
            serializer.data,
        )


# =============================================================================
# SERIALIZER DE ATUALIZAÇÃO
# =============================================================================


class UserProfileUpdateSerializerTests(TestCase):
    def setUp(self):
        self.user = create_user(
            username="cliente_update",
            first_name="Nome",
            last_name="Antigo",
            email="antigo@example.com",
            whatsapp_number="69911111111",
            role=User.RoleOptions.CLIENT,
        )

    def test_profile_update_accepts_valid_data(self):
        serializer = UserProfileUpdateSerializer(
            self.user,
            data={
                "first_name": "Novo",
                "last_name": "Nome",
                "email": "novo@example.com",
                "whatsapp_number": "69999999999",
                "notify_email": False,
                "notify_whatsapp": True,
            },
            partial=True,
        )

        self.assertTrue(
            serializer.is_valid(),
            serializer.errors,
        )

    def test_profile_update_updates_sent_fields(self):
        serializer = UserProfileUpdateSerializer(
            self.user,
            data={
                "first_name": "João",
                "email": "joao@example.com",
            },
            partial=True,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        updated_user = serializer.save()

        self.assertEqual(
            updated_user.first_name,
            "João",
        )

        self.assertEqual(
            updated_user.email,
            "joao@example.com",
        )

    def test_profile_update_preserves_fields_not_sent(self):
        original_last_name = self.user.last_name
        original_whatsapp = self.user.whatsapp_number

        serializer = UserProfileUpdateSerializer(
            self.user,
            data={
                "first_name": "João",
            },
            partial=True,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        updated_user = serializer.save()

        self.assertEqual(
            updated_user.last_name,
            original_last_name,
        )

        self.assertEqual(
            updated_user.whatsapp_number,
            original_whatsapp,
        )

    def test_profile_update_does_not_change_username(self):
        serializer = UserProfileUpdateSerializer(
            self.user,
            data={
                "username": "username_invasor",
                "first_name": "João",
            },
            partial=True,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        updated_user = serializer.save()

        self.assertEqual(
            updated_user.username,
            "cliente_update",
        )

    def test_profile_update_does_not_change_role(self):
        serializer = UserProfileUpdateSerializer(
            self.user,
            data={
                "role": User.RoleOptions.SUPPORT,
                "first_name": "João",
            },
            partial=True,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        updated_user = serializer.save()

        self.assertEqual(
            updated_user.role,
            User.RoleOptions.CLIENT,
        )

    def test_profile_update_does_not_change_password(self):
        original_password_hash = self.user.password

        serializer = UserProfileUpdateSerializer(
            self.user,
            data={
                "password": "senha_tentativa",
                "first_name": "João",
            },
            partial=True,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        updated_user = serializer.save()

        self.assertEqual(
            updated_user.password,
            original_password_hash,
        )

    def test_profile_update_rejects_invalid_email(self):
        serializer = UserProfileUpdateSerializer(
            self.user,
            data={
                "email": "email-invalido",
            },
            partial=True,
        )

        self.assertFalse(
            serializer.is_valid(),
        )

        self.assertIn(
            "email",
            serializer.errors,
        )


# =============================================================================
# SERIALIZER DE CRIAÇÃO
# =============================================================================


class UserCreateSerializerTests(TestCase):
    def valid_payload(self):
        return {
            "username": "novo_cliente",
            "first_name": "Novo",
            "last_name": "Cliente",
            "email": "novo@example.com",
            "whatsapp_number": "69999999999",
            "password": "senha_segura_123",
            "password_confirmation": "senha_segura_123",
        }

    def test_create_serializer_accepts_valid_data(self):
        serializer = UserCreateSerializer(
            data=self.valid_payload(),
        )

        self.assertTrue(
            serializer.is_valid(),
            serializer.errors,
        )

    def test_create_serializer_creates_client_user(self):
        serializer = UserCreateSerializer(
            data=self.valid_payload(),
        )

        serializer.is_valid(
            raise_exception=True,
        )

        user = serializer.save()

        self.assertEqual(
            user.role,
            User.RoleOptions.CLIENT,
        )

    def test_create_serializer_hashes_password(self):
        payload = self.valid_payload()

        serializer = UserCreateSerializer(
            data=payload,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        user = serializer.save()

        self.assertNotEqual(
            user.password,
            payload["password"],
        )

        self.assertTrue(
            user.check_password(
                payload["password"]
            )
        )

    def test_create_serializer_does_not_return_password(self):
        serializer = UserCreateSerializer(
            data=self.valid_payload(),
        )

        serializer.is_valid(
            raise_exception=True,
        )

        serializer.save()

        self.assertNotIn(
            "password",
            serializer.data,
        )

        self.assertNotIn(
            "password_confirmation",
            serializer.data,
        )

    def test_create_serializer_rejects_different_passwords(self):
        payload = self.valid_payload()

        payload["password_confirmation"] = (
            "senha_diferente_123"
        )

        serializer = UserCreateSerializer(
            data=payload,
        )

        self.assertFalse(
            serializer.is_valid(),
        )

        self.assertIn(
            "password_confirmation",
            serializer.errors,
        )

    def test_create_serializer_rejects_short_password(self):
        payload = self.valid_payload()

        payload["password"] = "123"
        payload["password_confirmation"] = "123"

        serializer = UserCreateSerializer(
            data=payload,
        )

        self.assertFalse(
            serializer.is_valid(),
        )

        self.assertIn(
            "password",
            serializer.errors,
        )

    def test_create_serializer_rejects_duplicate_username(self):
        create_user(
            username="novo_cliente",
        )

        serializer = UserCreateSerializer(
            data=self.valid_payload(),
        )

        self.assertFalse(
            serializer.is_valid(),
        )

        self.assertIn(
            "username",
            serializer.errors,
        )

    def test_create_serializer_does_not_allow_support_role(self):
        payload = self.valid_payload()

        payload["role"] = User.RoleOptions.SUPPORT

        serializer = UserCreateSerializer(
            data=payload,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        user = serializer.save()

        self.assertEqual(
            user.role,
            User.RoleOptions.CLIENT,
        )


# =============================================================================
# SERIALIZER DE LOGIN
# =============================================================================


class UserLoginSerializerTests(TestCase):
    def test_login_serializer_accepts_credentials(self):
        serializer = UserLoginSerializer(
            data={
                "username": "joao",
                "password": "senha123",
            }
        )

        self.assertTrue(
            serializer.is_valid(),
            serializer.errors,
        )

    def test_login_serializer_requires_username(self):
        serializer = UserLoginSerializer(
            data={
                "password": "senha123",
            }
        )

        self.assertFalse(
            serializer.is_valid(),
        )

        self.assertIn(
            "username",
            serializer.errors,
        )

    def test_login_serializer_requires_password(self):
        serializer = UserLoginSerializer(
            data={
                "username": "joao",
            }
        )

        self.assertFalse(
            serializer.is_valid(),
        )

        self.assertIn(
            "password",
            serializer.errors,
        )

    def test_login_serializer_does_not_return_password(self):
        serializer = UserLoginSerializer(
            data={
                "username": "joao",
                "password": "senha123",
            }
        )

        serializer.is_valid(
            raise_exception=True,
        )

        self.assertNotIn(
            "password",
            serializer.data,
        )


# =============================================================================
# ENDPOINTS
# =============================================================================


class UserAPIViewTests(APITestCase):
    def setUp(self):
        self.user = create_user(
            username="joao",
            password=DEFAULT_PASSWORD,
            first_name="João",
            last_name="Silva",
            email="joao@example.com",
            whatsapp_number="69999999999",
            role=User.RoleOptions.CLIENT,
        )

        self.support_user = create_user(
            username="suporte",
            password=DEFAULT_PASSWORD,
            role=User.RoleOptions.SUPPORT,
        )

        self.login_url = reverse("login")
        self.logout_url = reverse("logout")
        self.current_user_url = reverse(
            "current-user"
        )

    def login(self, username="joao", password=DEFAULT_PASSWORD):
        return self.client.post(
            self.login_url,
            {
                "username": username,
                "password": password,
            },
            format="json",
        )

    def test_login_with_valid_credentials(self):
        response = self.login()

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["id"],
            self.user.pk,
        )

        self.assertEqual(
            response.data["username"],
            self.user.username,
        )

    def test_login_returns_current_user_role(self):
        response = self.login()

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["role"],
            User.RoleOptions.CLIENT,
        )

        self.assertFalse(
            response.data["is_support"],
        )

    def test_login_with_wrong_password_is_rejected(self):
        response = self.login(
            password="senha_incorreta",
        )

        self.assertIn(
            response.status_code,
            {
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN,
            },
        )

    def test_login_with_unknown_username_is_rejected(self):
        response = self.login(
            username="usuario_inexistente",
        )

        self.assertIn(
            response.status_code,
            {
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN,
            },
        )

    def test_login_requires_username(self):
        response = self.client.post(
            self.login_url,
            {
                "password": DEFAULT_PASSWORD,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "username",
            response.data,
        )

    def test_login_requires_password(self):
        response = self.client.post(
            self.login_url,
            {
                "username": self.user.username,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "password",
            response.data,
        )

    def test_inactive_user_cannot_login(self):
        self.user.is_active = False
        self.user.save()

        response = self.login()

        self.assertIn(
            response.status_code,
            {
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN,
            },
        )

    def test_unauthenticated_user_cannot_access_me(self):
        client = APIClient()

        response = client.get(
            self.current_user_url,
        )

        self.assertIn(
            response.status_code,
            {
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN,
            },
        )

    def test_authenticated_user_can_access_me(self):
        login_response = self.login()

        self.assertEqual(
            login_response.status_code,
            status.HTTP_200_OK,
        )

        response = self.client.get(
            self.current_user_url,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["id"],
            self.user.pk,
        )

        self.assertEqual(
            response.data["username"],
            self.user.username,
        )

    def test_me_returns_authenticated_user_not_another_user(self):
        self.login()

        response = self.client.get(
            self.current_user_url,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertNotEqual(
            response.data["id"],
            self.support_user.pk,
        )

        self.assertEqual(
            response.data["id"],
            self.user.pk,
        )

    def test_authenticated_user_can_update_own_profile(self):
        self.login()

        response = self.client.patch(
            self.current_user_url,
            {
                "first_name": "João Pedro",
                "email": "joaopedro@example.com",
                "notify_email": False,
                "notify_whatsapp": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.user.refresh_from_db()

        self.assertEqual(
            self.user.first_name,
            "João Pedro",
        )

        self.assertEqual(
            self.user.email,
            "joaopedro@example.com",
        )

        self.assertFalse(
            self.user.notify_email,
        )

        self.assertTrue(
            self.user.notify_whatsapp,
        )

    def test_profile_update_returns_complete_user(self):
        self.login()

        response = self.client.patch(
            self.current_user_url,
            {
                "first_name": "Atualizado",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "id",
            response.data,
        )

        self.assertIn(
            "username",
            response.data,
        )

        self.assertIn(
            "role",
            response.data,
        )

        self.assertIn(
            "is_support",
            response.data,
        )

    def test_profile_update_cannot_change_role(self):
        self.login()

        response = self.client.patch(
            self.current_user_url,
            {
                "role": User.RoleOptions.SUPPORT,
                "first_name": "João",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.user.refresh_from_db()

        self.assertEqual(
            self.user.role,
            User.RoleOptions.CLIENT,
        )

    def test_profile_update_cannot_change_username(self):
        self.login()

        response = self.client.patch(
            self.current_user_url,
            {
                "username": "novo_username",
                "first_name": "João",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.user.refresh_from_db()

        self.assertEqual(
            self.user.username,
            "joao",
        )

    def test_profile_update_rejects_invalid_email(self):
        self.login()

        response = self.client.patch(
            self.current_user_url,
            {
                "email": "email-invalido",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "email",
            response.data,
        )

    def test_unauthenticated_user_cannot_update_profile(self):
        client = APIClient()

        response = client.patch(
            self.current_user_url,
            {
                "first_name": "Tentativa",
            },
            format="json",
        )

        self.assertIn(
            response.status_code,
            {
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN,
            },
        )

    def test_authenticated_user_can_logout(self):
        login_response = self.login()

        self.assertEqual(
            login_response.status_code,
            status.HTTP_200_OK,
        )

        response = self.client.post(
            self.logout_url,
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

    def test_logout_ends_session(self):
        self.login()

        logout_response = self.client.post(
            self.logout_url,
            {},
            format="json",
        )

        self.assertEqual(
            logout_response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        me_response = self.client.get(
            self.current_user_url,
        )

        self.assertIn(
            me_response.status_code,
            {
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN,
            },
        )

    def test_unauthenticated_user_cannot_logout(self):
        client = APIClient()

        response = client.post(
            self.logout_url,
            {},
            format="json",
        )

        self.assertIn(
            response.status_code,
            {
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN,
            },
        )


# =============================================================================
# URLS
# =============================================================================


class UserURLTests(SimpleTestCase):
    def test_login_url_resolves_correct_view(self):
        match = resolve(
            reverse("login")
        )

        self.assertIs(
            match.func.view_class,
            UserLoginAPIView,
        )

    def test_logout_url_resolves_correct_view(self):
        match = resolve(
            reverse("logout")
        )

        self.assertIs(
            match.func.view_class,
            UserLogoutAPIView,
        )

    def test_current_user_url_resolves_correct_view(self):
        match = resolve(
            reverse("current-user")
        )

        self.assertIs(
            match.func.view_class,
            CurrentUserAPIView,
        )