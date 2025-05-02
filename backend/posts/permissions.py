# posts/permissions.py
from rest_framework import permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model

User = get_user_model()

class IsAuthenticatedByRefreshToken(permissions.BasePermission):
    message = "Vous devez être connecté pour effectuer cette action."  

    def has_permission(self, request, view):
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            self.message = "Aucun token trouvé dans les cookies. Veuillez vous connecter."
            return False

        try:
            token = RefreshToken(refresh_token)
            token.verify()  

           
            user_id = token.payload.get('user_id')
            if not user_id:
                self.message = "Utilisateur non trouvé dans le token."
                return False

            user = User.objects.get(id=user_id)
            if not user.is_active:
                self.message = "Cet utilisateur est désactivé."
                return False

            
            request.user = user
            return True

        except InvalidToken:
            self.message = "token est invalide ou a expiré."
            return False
        except TokenError:
            self.message = "Erreur lors de la validation du token."
            return False
        except User.DoesNotExist:
            self.message = "Utilisateur associé au token non trouvé."
            return False