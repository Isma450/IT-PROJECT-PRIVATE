from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Post, Comment, Reaction
from .serializers import PostSerializer, CommentSerializer, ReactionSerializer
from users.models import User
from users.serializers import UserSerializer
import logging

logger = logging.getLogger('posts')

# 5 pour les commentaires
class CommentPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 100

class PostListView(APIView):
    permission_classes = [permissions.AllowAny] #à tous

    def get(self, request):
        # que posts publiés
        posts = Post.objects.filter(published_at__lte=timezone.now())
        for post in posts:
            lines = post.content.splitlines()[:5]
            post.content = "\n".join(lines)
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PostDetailView(APIView):
    permission_classes = [permissions.AllowAny]  

    def get(self, request, pk):
        post = get_object_or_404(Post, pk=pk, published_at__lte=timezone.now())
        serializer = PostSerializer(post)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PostCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]  #  admins

    def post(self, request):
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            logger.info(f"Post créé par {request.user.username}: {serializer.data['title']}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.warning(f"Échec de la création du post : {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CommentCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]  
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
    permission_classes = [permissions.IsAuthenticated]  

    def post(self, request, pk, emoji):
        post = get_object_or_404(Post, pk=pk, published_at__lte=timezone.now())
        # Valider l'emoji
        if emoji not in dict(Reaction.EMOJI_CHOICES).keys():
            logger.warning(f"Emoji invalide {emoji} par {request.user.username}")
            return Response({'error': 'Emoji invalide'}, status=status.HTTP_400_BAD_REQUEST)
        
        reaction = Reaction.objects.filter(post=post, user=request.user, emoji=emoji).first()
        if reaction:
            
            reaction.delete()
            logger.info(f"Réaction {emoji} supprimée par {request.user.username} sur le post {post.title}")
            return Response({'message': 'Réaction supprimée'}, status=status.HTTP_200_OK)
        else:
            # Si aucune réaction(activation)
            reaction = Reaction(post=post, user=request.user, emoji=emoji)
            reaction.save()
            logger.info(f"Réaction {emoji} ajoutée par {request.user.username} sur le post {post.title}")
            return Response(ReactionSerializer(reaction).data, status=status.HTTP_201_CREATED)

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