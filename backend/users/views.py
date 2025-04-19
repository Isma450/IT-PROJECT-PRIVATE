from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from rest_framework.permissions import AllowAny
from .models import User, PasswordResetToken
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer
from .utils import send_reset_email
import logging

logger = logging.getLogger('users')

class RegisterView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(ratelimit(key='ip', rate='5/m', method='POST'))
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            response = Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                httponly=True,
                secure=False,  
                samesite='Lax',
                max_age=7*24*60*60
            )
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(ratelimit(key='ip', rate='5/m', method='POST'))
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            try:
                user = User.objects.get(username=username)
                if user.check_password(password):
                    refresh = RefreshToken.for_user(user)
                    response = Response({
                        'user': UserSerializer(user).data,
                        'access': str(refresh.access_token),
                    }, status=status.HTTP_200_OK)
                    response.set_cookie(
                        key='refresh_token',
                        value=str(refresh),
                        httponly=True,
                        secure=False,  
                        samesite='Lax',
                        max_age=7*24*60*60
                    )
                    return response
                logger.warning(f"Échec de connexion pour {username}: mot de passe incorrect")
                return Response({'error': 'Mot de passe incorrect'}, status=status.HTTP_401_UNAUTHORIZED)
            except User.DoesNotExist:
                logger.warning(f"Échec de connexion: utilisateur {username} non trouvé")
                return Response({'error': 'Utilisateur non trouvé'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RefreshTokenView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        logger.info(f"Refresh token reçu : {refresh_token}")
        if not refresh_token:
            logger.warning("Tentative de rafraîchissement sans refresh token")
            return Response(
                {'error': 'Refresh token non fourni'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            token = RefreshToken(refresh_token)
            logger.info(f"Token payload : {token.payload}")
            access_token = str(token.access_token)
            logger.info("Access token généré avec succès")
            token.blacklist()
            logger.info("Token blacklisté avec succès")
            user_id = token.payload.get('user_id')
            logger.info(f"User ID extrait : {user_id}")
            user = User.objects.get(id=user_id)
            new_refresh = RefreshToken.for_user(user)
            logger.info("Nouveau refresh token généré")
            response = Response(
                {'access': access_token},
                status=status.HTTP_200_OK
            )
            response.set_cookie(
                key='refresh_token',
                value=str(new_refresh),
                httponly=True,
                secure=False,
                samesite='Lax',
                max_age=7*24*60*60
            )
            return response
        except Exception as e:
            logger.error(f"Erreur lors du rafraîchissement du token: {str(e)}")
            return Response(
                {'error': 'Token invalide ou expiré'},
                status=status.HTTP_401_UNAUTHORIZED
            )

class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            logger.warning("Tentative de déconnexion sans refresh token")
            return Response(
                {'error': 'Refresh token non fourni'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            response = Response({'message': 'Déconnexion réussie'}, status=status.HTTP_205_RESET_CONTENT)
            response.delete_cookie('refresh_token')
            return response
        except Exception as e:
            logger.error(f"Erreur lors de la déconnexion: {str(e)}")
            return Response({'error': 'Erreur lors de la déconnexion'}, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(ratelimit(key='ip', rate='100/h', method='POST'))
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                token = PasswordResetToken(user=user)
                token.save()
                send_reset_email(user, token.token)
                return Response({'message': 'Email de réinitialisation envoyé'}, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                logger.warning(f"Tentative de réinitialisation pour email non trouvé: {email}")
                return Response({'error': 'Email non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, token):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            try:
                reset_token = PasswordResetToken.objects.get(token=token)
                if not reset_token.is_valid():
                    return Response({'error': 'Token expiré'}, status=status.HTTP_400_BAD_REQUEST)
                user = reset_token.user
                user.set_password(serializer.validated_data['password'])
                user.save()
                reset_token.delete()
                return Response({'message': 'Mot de passe réinitialisé'}, status=status.HTTP_200_OK)
            except PasswordResetToken.DoesNotExist:
                return Response({'error': 'Token invalide'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)