from django.contrib import admin
from .models import Post, Comment, Reaction

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'published_at', 'created_at')
    list_filter = ('published_at', 'author')
    search_fields = ('title', 'content')
    ordering = ('-published_at',)

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('post', 'author', 'created_at')
    list_filter = ('created_at', 'author')
    search_fields = ('content',)
    ordering = ('-created_at',)

@admin.register(Reaction)
class ReactionAdmin(admin.ModelAdmin):
    list_display = ('post', 'user', 'emoji', 'created_at')
    list_filter = ('emoji', 'created_at')
    ordering = ('-created_at',)