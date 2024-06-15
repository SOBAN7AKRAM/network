
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("new-post", views.new_post, name='new-post'),
    path("get-posts/<str:name>", views.get_posts, name="get-posts"), 
    path("like-post/<int:post_id>", views.like_post, name="like-post"), 
    path("has-liked/<int:post_id>", views.has_liked, name="has-liked"), 
    path('comment/<int:post_id>', views.comment, name = 'comment'),
    path("get-comments/<int:post_id>", views.get_comments, name = "get-comments"),
    path("edit-post/<int:post_id>", views.edit_post, name="edit_post"), 
    path("get-user-profile/<int:user_id>", views.get_user_profile, name="get-user-profile"),
    path("get-user-posts/<int:userId>", views.get_user_posts, name = "get-user-posts")
]
