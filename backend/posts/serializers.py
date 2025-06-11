from rest_framework import serializers
from .models import Post, Comment, Reaction , Tag
from users.serializers import UserSerializer

class SuggestionSerializer(serializers.Serializer):
    """
    Serializer pour chaque suggestion d'amélioration.
    Contient la plage de caractères, le texte original et la proposition.
    """
    range = serializers.DictField(
        child=serializers.IntegerField(),
        help_text="{\"start\": int, \"end\": int}"
    )
    original = serializers.CharField(help_text="Segment de texte original")
    proposal = serializers.CharField(help_text="Proposition d'amélioration")

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']
        read_only_fields = ['id', 'slug']


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
    tags = TagSerializer(many=True, read_only=True)
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50),
        write_only=True,
        required=False
    )
    reaction_counts = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'author', 'created_at', 'updated_at', 'published_at', 'comments', 'reactions', 'tags', 'tag_names', 'reaction_counts']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 'published_at', 'comments', 'reactions', 'tags']


    def get_reaction_counts(self, obj):
        counts = {}
        for emoji, _ in Reaction.EMOJI_CHOICES:
            counts[emoji] = obj.reactions.filter(emoji=emoji).count()
        return counts

    def create(self, validated_data):
        tag_names = validated_data.pop('tag_names', [])
        post = Post.objects.create(**validated_data)
        self._add_tags(post, tag_names)
        return post

    def update(self, instance, validated_data):
        tag_names = validated_data.pop('tag_names', None)
        instance = super().update(instance, validated_data)
        if tag_names is not None:
            instance.tags.clear()  
            self._add_tags(instance, tag_names)
        return instance

    def _add_tags(self, post, tag_names):
        for tag_name in tag_names:
            tag, created = Tag.objects.get_or_create(
                name=tag_name.strip(),
                defaults={'slug': tag_name.lower().replace(' ', '-')}
            )
            post.tags.add(tag)

