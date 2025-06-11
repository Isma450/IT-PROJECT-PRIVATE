import os
import json
import logging
import openai
import tiktoken
from openai import OpenAI,OpenAIError, RateLimitError, APIError, Timeout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.utils import timezone
from .models import Post, Comment, Reaction , Tag
from .serializers import PostSerializer, CommentSerializer, ReactionSerializer , TagSerializer, SuggestionSerializer
from users.models import User
from .permissions import IsAuthenticatedByRefreshToken
from users.serializers import UserSerializer
import logging
from django.db.models import Count

logger = logging.getLogger('posts')

# Limites de tokens pour réduire les coûts
MAX_INPUT_TOKENS = 3000
MAX_RESPONSE_TOKENS = 500
ENCODING_NAME = "cl100k_base"

# Instanciation du client OpenAI via OpenRouter (Deepseek)
openai_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.OPENROUTER_API_KEY
)

def truncate_text(text: str, max_tokens: int) -> str:
    """
    Tronque le texte pour qu'il ne dépasse pas max_tokens.
    """
    encoding = tiktoken.get_encoding(ENCODING_NAME)
    tokens = encoding.encode(text)
    if len(tokens) <= max_tokens:
        return text
    truncated = encoding.decode(tokens[:max_tokens])
    logger.info(f"Texte tronqué de {len(tokens)} à {max_tokens} tokens pour optimiser les coûts.")
    return truncated


class SuggestImprovementsView(APIView):
    """
    POST /api/posts/<pk>/suggestions/
    Renvoie dans "réponse" le texte réécrit via Deepseek, pur et sans code.
    """
    permission_classes = [IsAuthenticatedByRefreshToken, permissions.IsAdminUser]

    def post(self, request, pk):
        # Récupérer et vérifier l'auteur
        post = get_object_or_404(Post, pk=pk, author=request.user)
        original_text = request.data.get("text", post.content)

        # Tronquer pour limiter la consommation de tokens
        safe_text = truncate_text(original_text, MAX_INPUT_TOKENS)

        # Construire un prompt clair pour que le modèle renvoie uniquement le texte réécrit
        prompt = (
            "Réécris ce paragraphe en français, de manière fluide et enrichie, "
            "prêt à être publié. Ne renvoie que le texte, sans balises, sans code, "
            "sans explications :\n\n"
            f"{safe_text}"
        )

        try:
            # Appel à l'endpoint completions de Deepseek
            response = openai_client.completions.create(
                model="deepseek/deepseek-r1-0528:free",
                prompt=prompt,
                max_tokens=MAX_RESPONSE_TOKENS,
                temperature=0.5,
                top_p=1.0,
                frequency_penalty=0.0,
                presence_penalty=0.0,
            )

            rewritten = (response.choices[0].text or "").strip()
            if not rewritten:
                logger.error("Deepseek a renvoyé un texte vide")
                return Response(
                    {"error": "Réponse IA vide"},
                    status=status.HTTP_502_BAD_GATEWAY
                )

            # Répondre dans la propriété "réponse"
            return Response({"réponse": rewritten}, status=status.HTTP_200_OK)

        except RateLimitError as e:
            retry_after = e.headers.get("Retry-After", "60")
            logger.warning(f"Rate limit atteint, retry_after={retry_after}s")
            return Response(
                {"error": "Limite de débit atteinte", "retry_after": retry_after},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
                headers={"Retry-After": retry_after},
            )

        except APIError as e:
            logger.error(f"Erreur API Deepseek : {e}")
            return Response(
                {"error": "Service IA temporairement indisponible"},
                status=status.HTTP_502_BAD_GATEWAY
            )

        except OpenAIError as e:
            logger.exception(f"OpenAIError : {e}")
            return Response(
                {"error": "Erreur interne IA"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        except Exception as e:
            logger.exception(f"Erreur inattendue : {e}")
            return Response(
                {"error": "Erreur serveur inattendue"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# 5 pour les commentaires
class CommentPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 100

class PostListView(APIView):
    permission_classes = [permissions.AllowAny] 

    def get(self, request):
        tag_slug = request.query_params.get('tag', None)
        posts = Post.objects.all()
        if tag_slug:
            posts = posts.filter(tags__slug=tag_slug)
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PostDetailView(APIView):
    permission_classes = [permissions.AllowAny]  

    def get(self, request, pk):
        post = get_object_or_404(Post, pk=pk, published_at__lte=timezone.now())
        serializer = PostSerializer(post)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PostCreateView(APIView):
    permission_classes = [IsAuthenticatedByRefreshToken, permissions.IsAdminUser]

    def post(self, request):
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            logger.info(f"Post créé par {request.user.username}: {serializer.data['title']}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.warning(f"Échec de la création du post : {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PostUpdateView(APIView):
    permission_classes = [IsAuthenticatedByRefreshToken, permissions.IsAdminUser]

    def put(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        if post.author != request.user and not request.user.is_superuser:
            return Response({'error': 'Vous n’êtes pas autorisé à modifier ce post.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = PostSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Post mis à jour par {request.user.username}: {post.title}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        logger.warning(f"Échec de la mise à jour du post : {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CommentCreateView(APIView):
    permission_classes = [IsAuthenticatedByRefreshToken]  
    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk, published_at__lte=timezone.now())
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user, post=post)
            logger.info(f"Commentaire ajouté par {request.user.username} sur le post {post.title}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.warning(f"Échec de la création du commentaire : {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class ReactionToggleView(APIView):
    permission_classes = [IsAuthenticatedByRefreshToken]  

    def post(self, request, pk, emoji):
        post = get_object_or_404(Post, pk=pk, published_at__lte=timezone.now())

        if emoji not in dict(Reaction.EMOJI_CHOICES).keys():
            return Response({'error': 'Emoji invalide'}, status=status.HTTP_400_BAD_REQUEST)
        
        reaction = Reaction.objects.filter(post=post, user=request.user, emoji=emoji).first()
        if reaction:
            reaction.delete()
        else:
            Reaction.objects.create(post=post, user=request.user, emoji=emoji)

        
        serializer = PostSerializer(post, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class AboutAuthorView(APIView):
    permission_classes = [permissions.AllowAny]  

    def get(self, request, author_id):
        author = get_object_or_404(User, pk=author_id)
        posts = Post.objects.filter(author=author, published_at__lte=timezone.now())
        author_data = UserSerializer(author).data
        posts_data = PostSerializer(posts, many=True).data
        return Response({
            'author': author_data,
            'posts': posts_data
        }, status=status.HTTP_200_OK)

class TagListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        tags = Tag.objects.all()
        serializer = TagSerializer(tags, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)