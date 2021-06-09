import json
import re
from datetime import date, datetime

from tzlocal import get_localzone
from dateutil.tz import *
from django.conf import settings
from django.core.exceptions import ValidationError
from rest_framework import serializers
from rest_framework.reverse import reverse

from . import models


#####################################################
# For relation field. follow user & follower user
#####################################################

class FollowRelationSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField(source="destination.id")
    username = serializers.ReadOnlyField(source="destination.username")

    class Meta:
        model = models.FollowRelation
        read_only_fields = ("id", "username")
        fields =("id", "username")


class FollowerRelationSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField(source="source.id")
    username = serializers.ReadOnlyField(source="source.username")

    class Meta:
        model = models.FollowRelation
        read_only_fields = ("id", "username")
        fields =("id", "username")


########################################
# User model
########################################

class UserSerializer(serializers.ModelSerializer):
    follow_user_url = serializers.SerializerMethodField(read_only=True)
    follower_user_url = serializers.SerializerMethodField(read_only=True)

    # It give follow user data of json format.
    def get_follow_user_url(self, obj):
        request = self.context.get('request')
        hyper_link = request.build_absolute_uri(
            reverse(
                "user-follow_user", 
                kwargs={"pk": obj.pk}
            )
        )

        return hyper_link 

    
    # It give follower user data of json format.
    def get_follower_user_url(self, obj):
        request = self.context.get('request')
        hyper_link = request.build_absolute_uri(
            reverse(
                "user-follower_user", 
                kwargs={"pk": obj.pk}
            )
        )

        return hyper_link 


    class Meta:
        model = models.User
        read_only_fields = ("id", "username", "follow_count", "follower_count")
        fields = ("id", "username", "follow_count", "follower_count", "follow_user_url", "follower_user_url")


########################################
# Post model
########################################

class PostSerializer(serializers.ModelSerializer):

    like_user_url = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    created_by = UserSerializer(read_only=True)

    # user_url = serializers.HyperlinkedRelatedField(
    #     source="created_by",
    #     many=False,
    #     read_only=True,
    #     view_name="user-detail"
    # )

    # It give Liked user data of json format.
    def get_like_user_url(self, obj):
        request = self.context.get('request')
        hyper_link = request.build_absolute_uri(
            reverse(
                "post-like_user", 
                kwargs={"pk": obj.pk}
            )
        )

        return hyper_link


    def get_is_liked(self, obj):
        user = self.context.get('request').user
        models.Post.objects.prefetch_related('like') \
            .get(pk=obj.id).like.filter(id__in=[user.id]) 

        return True if models.Post.objects.prefetch_related('like') \
            .get(pk=obj.id).like.filter(id__in=[user.id]) else False


    # Only response, It give converted a created_at to localize.
    def to_representation(self, instance):
        """Convert `created_at` to localize."""
        ret = super().to_representation(instance)
        local = get_localzone()
        
        # 2021-05-15T11:33:21.099588Z
        created_at = datetime.fromisoformat(ret["created_at"].replace("Z", "+00:00"))
        ret['created_at'] = f'{created_at.astimezone(local):%Y-%m-%d %H:%M}'

        if ret["updated_at"] is not None:
            # 2021-05-15T11:33:21.099588Z
            updated_at = datetime.fromisoformat(ret["updated_at"].replace("Z", "+00:00"))
            ret['updated_at'] = f'{updated_at.astimezone(local):%Y-%m-%d %H:%M}'

        return ret


    class Meta:
        model = models.Post
        read_only_fields = ("id", "created_by", "updated_at", "like_count", "like_user_url", "is_liked")
        fields = (
            "id", "text", "created_by", "created_at", "updated_at", "like_count", "like_user_url", "is_liked"
        )


class PostLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Post
        read_only_fields = ("id",)
        fields = ("id",)