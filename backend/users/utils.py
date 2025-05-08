import secrets
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import User, PasswordResetToken


def send_reset_email(user, token):
    subject = "Réinitialisation de votre mot de passe"
    reset_url = f"http://localhost:5173/reset-password/{token}/"
    message = f"""
    Bonjour {user.username},

    Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous :
    {reset_url}

    Ce lien expire dans 1 heure.

    Si vous n'avez pas fait cette demande, ignorez cet email.
    """
    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=False,
    )