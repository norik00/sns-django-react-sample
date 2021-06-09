
from django.urls import path 
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register('v1/user', views.UserViewSet, basename="user")
router.register('v1/post', views.PostViewSet, basename="post")

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
]
