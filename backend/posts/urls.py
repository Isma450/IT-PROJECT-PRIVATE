from django.urls import path
from .views import (
    PostListView, PostDetailView, PostCreateView, 
    CommentCreateView, ReactionToggleView, AboutAuthorView
)

urlpatterns = [
    path('', PostListView.as_view(), name='post_list'),
   
    path('<int:pk>/', PostDetailView.as_view(), name='post_detail'),
    
    path('create/', PostCreateView.as_view(), name='post_create'),
    
    path('<int:pk>/comment/', CommentCreateView.as_view(), name='comment_create'),
   
    path('<int:pk>/react/<str:emoji>/', ReactionToggleView.as_view(), name='reaction_toggle'),
    
    path('author/<int:author_id>/', AboutAuthorView.as_view(), name='about_author'),
]