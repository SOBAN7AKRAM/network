from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass
class Post(models.Model):
    postedBy = models.ForeignKey(User, on_delete = models.CASCADE)
    content = models.TextField()
    dateAndTime = models.DateTimeField()
    likes = models.IntegerField()

class Follow(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    following = models.ManyToManyField(User, related_name='followingTo')
    followers = models.ManyToManyField(User, related_name='followedBy')

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="liked_by")
    class Meta:
        unique_together = ('user', 'post')