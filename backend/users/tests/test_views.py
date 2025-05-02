# users/tests/test_views.py
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from users.models import User, PasswordResetToken
from users.serializers import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
import logging

# Désactiver les logs pendant les tests pour éviter le bruit
logging.disable(logging.CRITICAL)

class RegisterViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')

    def test_register_success(self):
        data = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'TestPassword123'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertIn('access', response.data)
        self.assertIn('refresh_token', response.cookies)
        user = User.objects.get(username='testuser')
        self.assertEqual(user.email, 'testuser@example.com')

    def test_register_invalid_data(self):
        data = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'short'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

    def test_register_duplicate_username(self):
        user = User(username='testuser', email='test1@example.com')
        user.set_password('TestPassword123')
        user.save()
        data = {
            'username': 'testuser',
            'email': 'test2@example.com',
            'password': 'TestPassword123'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)

class LoginViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.login_url = reverse('login')
        self.user = User(username='testuser', email='testuser@example.com')
        self.user.set_password('TestPassword123')
        self.user.save()

    def test_login_success(self):
        data = {
            'username': 'testuser',
            'password': 'TestPassword123'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertIn('access', response.data)
        self.assertIn('refresh_token', response.cookies)

    def test_login_wrong_password(self):
        data = {
            'username': 'testuser',
            'password': 'WrongPassword'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

    def test_login_user_not_found(self):
        data = {
            'username': 'nonexistent',
            'password': 'TestPassword123'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

class RefreshTokenViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.refresh_url = reverse('token_refresh')
        self.user = User(username='testuser', email='testuser@example.com')
        self.user.set_password('TestPassword123')
        self.user.save()
        self.refresh_token = RefreshToken.for_user(self.user)

    def test_refresh_success(self):
        self.client.cookies['refresh_token'] = str(self.refresh_token)
        response = self.client.post(self.refresh_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh_token', response.cookies)

    def test_refresh_no_token(self):
        response = self.client.post(self.refresh_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_refresh_invalid_token(self):
        self.client.cookies['refresh_token'] = 'invalid_token'
        response = self.client.post(self.refresh_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

class LogoutViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.logout_url = reverse('logout')
        self.user = User(username='testuser', email='testuser@example.com')
        self.user.set_password('TestPassword123')
        self.user.save()
        self.refresh_token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(self.refresh_token.access_token)}')

    def test_logout_success(self):
        self.client.cookies['refresh_token'] = str(self.refresh_token)
        response = self.client.post(self.logout_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)
        self.assertIn('message', response.data)

        self.assertIn('refresh_token', response.cookies)
        self.assertEqual(response.cookies['refresh_token'].value, '')
        self.assertEqual(response.cookies['refresh_token']['max-age'], 0)

    def test_logout_no_token(self):
        response = self.client.post(self.logout_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

class PasswordResetRequestViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.password_reset_url = reverse('password_reset_request')
        self.user = User(username='testuser', email='testuser@example.com')
        self.user.set_password('TestPassword123')
        self.user.save()

    def test_password_reset_request_success(self):
        data = {'email': 'testuser@example.com'}
        response = self.client.post(self.password_reset_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertTrue(PasswordResetToken.objects.filter(user=self.user).exists())

    def test_password_reset_request_user_not_found(self):
        data = {'email': 'nonexistent@example.com'}
        response = self.client.post(self.password_reset_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)

    def test_password_reset_request_invalid_data(self):
        data = {}
        response = self.client.post(self.password_reset_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

class PasswordResetConfirmViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User(username='testuser', email='testuser@example.com')
        self.user.set_password('TestPassword123')
        self.user.save()
        self.token = PasswordResetToken.objects.create(
            user=self.user,
            created_at=timezone.now(),
            expires_at=timezone.now() + timedelta(hours=1)
        )
        self.password_reset_confirm_url = reverse('password_reset_confirm', args=[self.token.token])

    def test_password_reset_confirm_success(self):
        data = {'password': 'NewPassword123'}
        response = self.client.post(self.password_reset_confirm_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPassword123'))
        self.assertFalse(PasswordResetToken.objects.filter(token=self.token.token).exists())

    def test_password_reset_confirm_invalid_token(self):
        url = reverse('password_reset_confirm', args=['invalid_token'])
        data = {'password': 'NewPassword123'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_password_reset_confirm_expired_token(self):
        self.token.expires_at = timezone.now() - timedelta(hours=1)
        self.token.save()
        data = {'password': 'NewPassword123'}
        response = self.client.post(self.password_reset_confirm_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)