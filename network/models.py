from django.contrib.auth.models import AbstractUser
from django.db import models
from pytz import timezone, utc


class User(AbstractUser):
    follow = models.ManyToManyField(
        "self",
        through="FollowRelation",
        through_fields=("source", "destination")
    )

    @property
    def follow_count(self):
        return f"{self.follow_user.count()}"
    
    @property
    def follower_count(self):
        return f"{self.follower_user.count()}"


class FollowRelation(models.Model):
    source = models.ForeignKey(User, on_delete=models.CASCADE, related_name="follow_user")
    destination = models.ForeignKey(User, on_delete=models.CASCADE, related_name="follower_user")


class Post(models.Model):
    text = models.CharField(max_length=128)
    created_by = models.ForeignKey("User", related_name="posted", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True)
    like = models.ManyToManyField("User", blank=True, related_name="like_post")

    def __str__(self):
        return f"{self.text[:10]}...({self.created_at})"

    @property
    def short_text(self):
        "Returns the first 10 character of text"
        return f"{self.text[:10]}..."

    @property
    def like_count(self):
        return f"{self.like.count()}"




    
