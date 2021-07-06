CS50’s Web Programming with Python and JavaScript: Network

# Network API

## ENDPOINT

| URL | METHOD | QUERY | BODY | DESCRIPTION |
|:---|:---|:---|:---|:---|
| `/api/v1/post/` | GET | page <br> id || It gives all posts of all users. |
| `/api/v1/post/` | POST | | text `required` | Create post of request users. Text maxlength is 128. |
| `/api/v1/post/{id}/` | PUT <br> PATCH | id `required` | text `required` | Update the id post. |
| `/api/v1/post/{id}/like-user/` | GET | id `required` || It gives users data what 'Liked' the id post. |
| `/api/v1/post/{id}/like/` | PUT <br> DELETE | id `required` || Like or Unlike the id post. |
| `/api/v1/user/` | GET | page <br> id || It gives all users data. |
| `/api/v1/user/{id}/` | GET | id `required`|| It gives user data of id. |
| `/api/v1/user/{id}/follow-user/` | GET | id `required` || It gives users who the id user follows. |
| `/api/v1/user/{id}/follower-user/` | GET | id  `required`|| It gives users who the id user is followed. |
| `/api/v1/user/check-follow/{id}/` | GET | id `required` || It gives whether request user followed the id user. |
| `/api/v1/user/{id}/posts/` | GET | page <br> id `required` || It gives all posts of the id user. | 
| `/api/v1/user/{id}/following/` | GET | id `required` || It gives posts what is users post that user of id follows. |
| `/api/v1/user/{id}/follow/` | PUT <br> DELETE | id `required`|| Request user Follow or Unfollow of the is user. |


## ERROR FORMAT

`{ detail: "non filed error" }` 
`{ field name: [ "field error message" ] }`


## STATU CODE

`GET` `/api/v1/post/`

| STATUS CODE | DESCRIPTION |  
|:---|:---|  
| 200 | All post data |


`POST` `/api/v1/post/`

| STATUS CODE | DESCRIPTION |  
|:---|:---|  
| 201 | created post data |


`GET` `/api/v1/post/{id}/`

| STATUS CODE | DESCRIPTION |  
|:---|:---|  
| 200 | The id post data |


`GET` `/api/v1/post/{id}/like-user/`

| STATUS CODE | DESCRIPTION |  
|:---|:---|  
| 200 | "Liked" who user datas |


`PUT` `/api/v1/post/{id}/like/`

| STATUS CODE | DESCRIPTION |  
|:---|:---|  
| 201 | A "Like" count of post of id |


`DELETE` `/api/v1/post/{id}/like/`

| STATUS CODE | DESCRIPTION |  
|:---|:---|  
| 201 | A "Like" count of post of id |


`GET` `/api/v1/user/`

| STATUS CODE | DESCRIPTION |  
|:---|:---|  
| 200 | All user data |


`GET` `/api/v1/user/{id}`

| STATUS CODE | DESCRIPTION |  
|:---|:---|  
| 200 | The id user data |


`GET` `/api/v1/user/{id}/follow-user/`

| STATUS CODE | DESCRIPTION |  
|:---|:---|  
| 200 | User datas what the id user is follows |


`GET` `/api/v1/user/{id}/follower-user/`

| STATUS CODE | DESCRIPTION |  
|:---|:---|  
| 200 | User datas what the id user is followed |


`GET` `/api/v1/user/check-follow/{id}/` 

| STATUS CODE | DESCRIPTION |  
|:---|:---| 
| 200 | Request user is whether following the id user |


`GET` `/api/v1/user/{id}/following/`

| STATUS CODE | DESCRIPTION |  
|:---|:---|  
| 200 | All post data of users what the id user follows  |


`PUT` `/api/v1/user/{id}/follow/`

| STATUS CODE | DESCRIPTION |  
|:---|:---|  
| 201 | The id user data |


`DELETE` `/api/v1/user/{id}/follow/`

| STATUS CODE | DESCRIPTION |  
|:---|:---|  
| 201 | The id user data |


## RESPONSE

### Multiple Posts

```json
{
    "count": 38,
    "next": "http://127.0.0.1:8000/api/v1/post/?page=2",
    "previous": null,
    "results": [
        {
            "id": 38,
            "text": "Doubt is the origin of wisdom.
            疑いは知のはじまりである。

            René Descartes",
            "created_by": {
                "id": 1,
                "username": "noriko",
                "follow_count": "2",
                "follower_count": "0",
                "follow_user_url": "http://127.0.0.1:8000/api/v1/user/1/follow-user/",
                "follower_user_url": "http://127.0.0.1:8000/api/v1/user/1/follower-user/"
            },
            "created_at": "2021-06-06 23:38",
            "updated_at": null,
            "like_count": "1",
            "like_user_url": "http://127.0.0.1:8000/api/v1/post/38/like-user/",
            "is_liked": true
        },
        ...
    ]
}
```


### Specific Post

```json
{
    "id": 38,
    "text": "Doubt is the origin of wisdom. 疑いは知のはじまりである。  René Descartes(edit)",
    "created_by": {
        "id": 1,
        "username": "noriko",
        "follow_count": "2",
        "follower_count": "0",
        "follow_user_url": "http://127.0.0.1:8000/api/v1/user/1/follow-user/",
        "follower_user_url": "http://127.0.0.1:8000/api/v1/user/1/follower-user/"
    },
    "created_at": "2021-06-06 23:38",
    "updated_at": "2021-06-07 21:28",
    "like_count": "1",
    "like_user_url": "http://127.0.0.1:8000/api/v1/post/38/like-user/",
    "is_liked": true
}
```


### Multiple Users

```json
[
    {
        "id": 1,
        "username": "noriko",
        "follow_count": "2",
        "follower_count": "0",
        "follow_user_url": "http://127.0.0.1:8000/api/v1/user/1/follow-user/",
        "follower_user_url": "http://127.0.0.1:8000/api/v1/user/1/follower-user/"
    }
    ...
]
```

### Specific User

```json
{
    "id": 1,
    "username": "noriko",
    "follow_count": "2",
    "follower_count": "0",
    "follow_user_url": "http://127.0.0.1:8000/api/v1/user/1/follow-user/",
    "follower_user_url": "http://127.0.0.1:8000/api/v1/user/1/follower-user/"
}
```


### Follow true/false

```json
{
    "check_follow": false
}
```

## Token

Set `X-NETWORKTOKEN` in headers. How to get `csrf cookie` is `Cookies.get('networktoken)`


## Migrate

This command is providing initial data for models.

```
$ python manage.py migrate network
$ python manage.py migrate
```

## Default Users

`noriko` `noriko2` `noriko3` `noriko4` `noriko5`  
All users password is `project4`.
