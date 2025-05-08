from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Post, Comment, Reaction , Tag
from .serializers import PostSerializer, CommentSerializer, ReactionSerializer , TagSerializer
from users.models import User
from .permissions import IsAuthenticatedByRefreshToken
from users.serializers import UserSerializer
import logging

logger = logging.getLogger('posts')

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

from django.db.models import Count

class ReactionToggleView(APIView):
    permission_classes = [IsAuthenticatedByRefreshToken]  

    def post(self, request, pk, emoji):
        post = get_object_or_404(Post, pk=pk, published_at__lte=timezone.now())

        if emoji not in dict(Reaction.EMOJI_CHOICES).keys():
            logger.warning(f"Emoji invalide {emoji} par {request.user.username}")
            return Response({'error': 'Emoji invalide'}, status=status.HTTP_400_BAD_REQUEST)
        
        reaction = Reaction.objects.filter(post=post, user=request.user, emoji=emoji).first()
        if reaction:
            reaction.delete()
            action = 'removed'
            logger.info(f"Réaction {emoji} supprimée par {request.user.username} sur le post {post.title}")
        else:
            Reaction.objects.create(post=post, user=request.user, emoji=emoji)
            action = 'added'
            logger.info(f"Réaction {emoji} ajoutée par {request.user.username} sur le post {post.title}")

        # Compter toutes les réactions actuelles par emoji pour ce post
        reaction_counts = Reaction.objects.filter(post=post).values('emoji').annotate(count=Count('id'))

        # Formater sous forme de dictionnaire
        counts = {item['emoji']: item['count'] for item in reaction_counts}

        return Response({
            'action': action,
            'emoji': emoji,
            'counts': counts
        }, status=status.HTTP_200_OK)


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