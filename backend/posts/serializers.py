from rest_framework import serializers
from .models import Post, Comment, Reaction
from users.serializers import UserSerializer

class ReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reaction
        fields = ['id', 'emoji', 'created_at']
        read_only_fields = ['id', 'created_at']

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    reactions = ReactionSerializer(many=True, read_only=True)
    reaction_counts = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'author', 'created_at', 'updated_at', 'published_at', 'comments', 'reactions', 'reaction_counts']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 'published_at', 'comments', 'reactions']

    def get_reaction_counts(self, obj):
        counts = {}
        for emoji, _ in Reaction.EMOJI_CHOICES:
            counts[emoji] = obj.reactions.filter(emoji=emoji).count()
        return counts