from django.core.mail.backends.smtp import EmailBackend as SMTPBackend
from django.conf import settings

class CustomEmailBackend(SMTPBackend):
    def open(self):
        if hasattr(settings, 'EMAIL_SSL_CONTEXT'):
            self.ssl_context = settings.EMAIL_SSL_CONTEXT
        return super().open()