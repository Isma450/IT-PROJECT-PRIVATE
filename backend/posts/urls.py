from django.urls import path
from .views import (
    PostListView, PostDetailView, PostCreateView, PostUpdateView,
    CommentCreateView, ReactionToggleView, AboutAuthorView , TagListView ,  SuggestImprovementsView
)

urlpatterns = [
    
    path('<int:pk>/suggestions/', SuggestImprovementsView.as_view(), name='post-suggestions'),

    path('', PostListView.as_view(), name='post_list'),
   
    path('<int:pk>/', PostDetailView.as_view(), name='post_detail'),
    
    path('create/', PostCreateView.as_view(), name='post_create'),

    path('<int:pk>/update/', PostUpdateView.as_view(), name='post_update'),
    
    path('<int:pk>/comment/', CommentCreateView.as_view(), name='comment_create'),
   
    path('<int:pk>/react/<str:emoji>/', ReactionToggleView.as_view(), name='reaction_toggle'),
    
    path('author/<int:author_id>/', AboutAuthorView.as_view(), name='about_author'),

    path('tags/', TagListView.as_view(), name='tag_list'),
]