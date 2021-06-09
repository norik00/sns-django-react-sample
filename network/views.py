from datetime import datetime

from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from rest_framework import mixins, pagination, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ParseError, PermissionDenied
from rest_framework.response import Response

from . import models, serializers


def index(request):
    return render(request, "network/index.html")


########################################
# regster, login & logout
########################################

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = models.User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")



########################################
# User
########################################

class UserViewSet(mixins.ListModelMixin,
                mixins.RetrieveModelMixin,
                viewsets.GenericViewSet):

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = pagination.PageNumberPagination

    queryset = models.User.objects.all()
    serializer_class = serializers.UserSerializer
    filter_fields = ("id",)


    def get_permissions(self):
        if self.action == "check_follow":
            self.permission_classes =  [permissions.IsAuthenticated]
        else:
            self.permission_classes = [permissions.IsAuthenticatedOrReadOnly]
        return super(self.__class__, self).get_permissions()


    def get_serializer_class(self):
        if self.action == "following_posts" or self.action == "posts":
            return serializers.PostSerializer
        return serializers.UserSerializer


    @action(detail=True, methods=["GET"], url_name="posts", url_path="posts")
    def posts(self, request, pk):
        try:
            models.User.objects.get(pk=pk)
        except models.User.DoesNotExist:
            raise NotFound(
                    { "detail": "Not Found." }
                )
                
        posts_query = models.Post.objects.filter(created_by__id=pk).order_by("-id")

        page = self.paginate_queryset(posts_query)

        serial = self.get_serializer(page, many=True)
        return self.get_paginated_response(serial.data)


    @action(detail=True, methods=["GET"], url_name="follow_user", url_path="follow-user")
    def follow_user(self, request, pk):
        try:
            user_query = models.User.objects.get(pk=pk).follow_user.values_list("destination_id", flat=True)
        except models.User.DoesNotExist:
            raise NotFound(
                    { "detail": "Not Found." }
                )

        follow_user_posts = models.User.objects.filter(id__in=user_query)
            
        serial = self.get_serializer(follow_user_posts, many=True)
        return Response(serial.data, status=200)


    @action(detail=True, methods=["GET"], url_name="follower_user", url_path="follower-user")
    def follower_user(self, request, pk):
        try:
            user_query = models.User.objects.get(pk=pk).follower_user.values_list("source_id", flat=True)
        except models.User.DoesNotExist:
            raise NotFound(
                    { "detail": "Not Found." }
                )

        follower_user_posts = models.User.objects.filter(id__in=user_query)
        
        serial = self.get_serializer(follower_user_posts, many=True)
        return Response(serial.data, status=200)


    # It give a request user data of json format after follow or unfollow.
    @action(detail=True, methods=["PUT", "DELETE"], url_name="follow", url_path="follow")
    def follow(self, request, pk):
        if request.method == "PUT":
            try:
                follow_user = models.User.objects.get(pk=pk)
            except models.User.DoesNotExist:
                raise NotFound(
                    { "detail": "Not Found." }
                )

            # Check duplicate
            try:
                models.FollowRelation.objects.get(source=request.user, destination=follow_user)
                raise ParseError(
                    { "detail": "The id user is already followed." }
                )
            except models.FollowRelation.DoesNotExist:
                fr = models.FollowRelation(source=request.user, destination=follow_user)
                fr.save()
                
                serial = self.get_serializer(follow_user)
                return Response(serial.data, status=201)  
        elif request.method == "DELETE":
            try:
                follow_user = models.User.objects.get(pk=pk)
            except models.User.DoesNotExist:
                raise NotFound(
                    { "detail": "Not Found." }
                )

            # Check duplicate
            try:
                fr = models.FollowRelation.objects.get(source=request.user, destination=follow_user)
            except models.FollowRelation.DoesNotExist:
                raise ParseError(
                    { "detail": "The id user is not followed." }
                )

            fr.delete()

            serial = self.get_serializer(follow_user)
            return Response(serial.data, status=201)


    # Give all posts made by users that the pk user follows.
    @action(detail=True, methods=["GET"], url_name="following_post", url_path="following-posts")
    def following_posts(self, request, pk):
        try:
            follow_users_list = models.User.objects.get(pk=pk).follow.values_list("id", flat=True)
        except models.User.DoesNotExist:
            raise NotFound(
                    { "detail": "Not Found." }
                )

        follow_posts = models.Post.objects.filter(created_by__id__in=follow_users_list).order_by("-id")
        
        page = self.paginate_queryset(follow_posts)
        
        serial = self.get_serializer(page, many=True)
        return self.get_paginated_response(serial.data)


    @action(detail=False, methods=["GET"], url_name="check_follow", url_path="check-follow/(?P<id>[^/.]+)")
    def check_follow(self, request, id):
        # whether request user is following pk user.
        user = request.user
        queryset = user.follow_user.filter(destination_id__in=[id])  
        if queryset:
            return Response({"check_follow": True}, status=200)
        else:
            return Response({"check_follow": False}, status=200)



########################################
# Post
########################################

class PostViewSet(mixins.CreateModelMixin,
                mixins.ListModelMixin,
                mixins.UpdateModelMixin,
                viewsets.GenericViewSet):

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    queryset = models.Post.objects.all().order_by("-id")
    serializer_class = serializers.PostSerializer
    filter_fields = ("id",)

    def get_serializer_class(self):
        if self.action == "like_user":
            return serializers.UserSerializer
        elif self.action == "like":
            return serializers.PostLikeSerializer
        return serializers.PostSerializer


    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    
    def perform_update(self, serializer):
        pk = self.kwargs['pk']
        user = self.request.user
        try:
            created_by = models.Post.objects.get(pk=pk).created_by
        except models.Post.DoesNotExist:
            raise NotFound(
                    { "detail": "Not Found." }
                )
        
        if created_by != user:
            raise PermissionDenied(
                { "detail": "Permission denied." }
            )

        serializer.save(updated_at=datetime.utcnow())


    # It give lists of json format Liked users.
    @action(detail=True, methods=["GET"], url_name="like_user", url_path="like-user")
    def like_user(self, request, pk):
        try:
            post_obj = models.Post.objects.get(pk=pk)
        except models.Post.DoesNotExist:
            raise NotFound(
                    { "detail": "Not Found." }
                )

        serial = self.get_serializer(post_obj.like, many=True)
        return Response(serial.data, status=200)


    @action(detail=True, methods=["PUT", "DELETE"], url_name="like", url_path="like")
    def like(self, request, pk):
        if request.method == "PUT":
            if request.user.like_post.filter(pk=pk):
                raise ParseError(
                    { "detail": "The id post is already Liked." }
                )
            
            try:
                post_obj = models.Post.objects.get(pk=pk)
            except models.Post.DoesNotExist:
                raise NotFound(
                    { "detail": "Not Found." }
                )

            post_obj.like.add(request.user)
            return Response({"count": post_obj.like.count()}, status=201)
        elif request.method == "DELETE":
            if request.user.like_post.filter(pk=pk) is None:
                raise ParseError(
                    { "detail": "The id post is already Unliked." }
                )
            
            try:
                post_obj = models.Post.objects.get(pk=pk)
            except models.Post.DoesNotExist:
                raise NotFound(
                    { "detail": "Not Found." }
                )

            post_obj.like.remove(request.user)
            return Response({"count": post_obj.like.count()}, status=201)
