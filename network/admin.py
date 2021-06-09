from django.contrib import admin
<<<<<<< HEAD

# Register your models here.
=======
from .models import User, Post

# Register your models here.
class UserAdmin(admin.ModelAdmin):
    filter_horizontal = ('follow', )


class PostAdmin(admin.ModelAdmin):
    list_display = ("short_text", "created_at", "like_count")
    list_display_links = ("short_text",) 


admin.site.register(User, UserAdmin)
admin.site.register(Post, PostAdmin)
>>>>>>> a7cea81... first commit
