from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from datetime import datetime
from .models import User, Post, Follow, Like, Comment
from django.http import JsonResponse
from django.core.paginator import Paginator
import json





def index(request):
    return render(request, "network/index.html")

# @login_required
def new_post(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=403)
    if request.method != "POST":
        return JsonResponse({"error" : "POST request required"}, status=400)
    try:
        data = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError as e:
        return JsonResponse({"error": f"Invalid JSON: {str(e)}"}, status=400)
    content = data.get('postContent')
    timestamp = data.get('datetime')
    postedBy = request.user
    likes = 0
    if not content or content.strip() == "" or not timestamp:
        return JsonResponse({"error" : "Post content or datetime required"}, status = 400)
    # convert js datatime to python timstamp
    dateAndTime = datetime.fromtimestamp(timestamp/ 1000.0)
    post = Post.objects.create(postedBy = postedBy, content = content, dateAndTime = dateAndTime, likes = likes)
    post.save()
    return JsonResponse({"success" : "Posted Successfully"}, status = 201)

def get_user_profile(request, user_id):
    isFollowed = False
    # follow or unfollow the user on POST request
    if request.method == "POST" and not request.user.id == user_id:
        user= User.objects.get(id = user_id)
        follow, created = Follow.objects.get_or_create(user = user)
        rFollow, rCreated = Follow.objects.get_or_create(user = request.user)
        # if not created mean user already follow the person
        if not created: 
            rFollow.following.remove(user)
            follow.delete()
            isFollowed = False
        else:
            follow.followers.add(request.user)
            rFollow.following.add(user)
            isFollowed = True
    if request.method == "PUT":
        return JsonResponse({"error": "GET method required"}, status = 400)
    # GET method to get the total follower and following of user
    isOwner = False
    user = User.objects.get(id = user_id)
    if request.user == user:
        isOwner = True
    try:
        follow = Follow.objects.get(user = user)
    except Follow.DoesNotExist:
        data = {
            'isOwner' : isOwner,
            'username' : user.username,
            'following' : 0, 
            'follower' : 0, 
            'isFollowed': isFollowed
        }
        return JsonResponse(data, safe=False)
    
    
    # check if the user currently followed or not
    f = follow.followers.contains(request.user)
    if f:
        isFollowed = True
    else:
        isFollowed = False
    following = follow.following.all().count()
    follower = follow.followers.all().count()
    data = {
        "isOwner" : isOwner,
        "username" : user.username,
        "following": following, 
        "follower" : follower, 
        "isFollowed": isFollowed
    }
    return JsonResponse(data, safe=False)

def get_user_posts(request, userId):
    user = User.objects.get(id = userId)
    if request.method != "GET":
        return JsonResponse({"error" : "GET request required"}, status = 400)
    post_list = Post.objects.filter(postedBy = user).order_by("-dateAndTime")
    # get only 10 post per page
    paginator = Paginator(post_list, 10)
    # get page number from the fetch request
    page_Num = int(request.GET.get('page'))
    posts = paginator.get_page(page_Num)
    totalPages = paginator.num_pages
    
    
    post_json = []
    for post in posts: 
        isOwner = False
        if post.postedBy == request.user:
            isOwner = True
        post_json.append({
            'id' : post.id,
            'userId': post.postedBy.id,
            'postedBy': post.postedBy.username,
            'content' : post.content,
            'dateAndTime' : post.dateAndTime,
            'likes' : post.likes,
            'isOwner' : isOwner
        })
    data = {
        "posts" : post_json, 
        "totalPages": totalPages
    }
    return JsonResponse(data, safe=False)
    
def get_posts(request, name):
    if request.method != "GET":
        return JsonResponse({"error" : "GET request required"}, status = 400)
    if name == "allPost":
        post_list = Post.objects.all().order_by("-dateAndTime")
    elif name == "followerPost" and request.user.is_authenticated:
        follow = Follow.objects.get(user = request.user)
        following_user = follow.following.all()
        post_list = Post.objects.filter(postedBy__in = following_user)
    else:
        return JsonResponse({"error": "Invalid post name"}, status= 403)
    paginator = Paginator(post_list, 10)
    page_Num = int(request.GET.get('page'))
    posts = paginator.get_page(page_Num)
    totalPages = paginator.num_pages
    
    
    post_json = []
    for post in posts: 
        isOwner = False
        if post.postedBy == request.user:
            isOwner = True
        post_json.append({
            'id' : post.id,
            'userId': post.postedBy.id,
            'postedBy': post.postedBy.username,
            'content' : post.content,
            'dateAndTime' : post.dateAndTime,
            'likes' : post.likes,
            'isOwner' : isOwner
        })
    data = {
        "posts" : post_json, 
        "totalPages": totalPages
    }
    return JsonResponse(data, safe=False)
def like_post(request, post_id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Login required"}, status = 403)
    post = Post.objects.get(id=post_id)
    like, created = Like.objects.get_or_create(user = request.user, post = post)
    # user already liked the post
    if not created:
        like.delete()
        post.likes -= 1
        liked = False
    else:
        post.likes += 1
        liked = True
    post.save()
    return JsonResponse({'likes': post.likes, 'liked': liked})
def has_liked(request, post_id):
    if not request.user.is_authenticated:
        return JsonResponse({'liked': False})
    post = Post.objects.get(id=post_id)
    liked = Like.objects.filter(user = request.user, post = post).exists()
    return JsonResponse({'liked': liked})
def edit_post(request, post_id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User is not authenticated"}, status = 403)
    if request.method != "PUT":
        return JsonResponse({"error": "PUT method required"}, status = 400)
    try: 
        post = Post.objects.get(id = post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post does not found"}, status = 404)
    try:
        data = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError as e:
        return JsonResponse({"error": f"Invalid JSON: {str(e)}"}, status=400)
    if data.get('content') is not None:
        post.content = data['content']
    else:
        return JsonResponse({"error": "Post content required"}, status = 403)
    post.save()
    return HttpResponse(status = 204)
    
    
def comment(request, post_id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=403)
    if request.method != "POST":
        return JsonResponse({"error" : "POST request required"}, status=400)
    try:
        data = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError as e:
        return JsonResponse({"error": f"Invalid JSON: {str(e)}"}, status=400)
    commentContent = data.get('comment')
    timestamp = data.get('datetime')
    if not commentContent or commentContent.strip() == "" or not timestamp:
        return JsonResponse({"error" : "Comment content or datetime required"}, status = 400)
    dateAndTime = datetime.fromtimestamp(timestamp/ 1000.0)
    post = Post.objects.get(id = post_id)
    comment = Comment.objects.create(user = request.user, post = post, comment = commentContent, dateAndTime =dateAndTime)
    comment.save()
    return JsonResponse({"Success": "Commented Successfully", "user": request.user.username}, status = 201)
    
def get_comments(request, post_id):
    post = Post.objects.get(id = post_id)
    comments = Comment.objects.filter(post = post).order_by("-dateAndTime")
    json_data = []
    if comments:
        for comment in comments:
            json_data.append({
                'id' : comment.id, 
                'user' : comment.user.username,
                'datetime' : comment.dateAndTime,
                'comment': comment.comment
            })
    return JsonResponse({"comments": json_data}, status = 201)

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        print(f"username, {username}")
        print(f"password, {password}")
        
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
            user = User.objects.create(username = username, email = email)
            user.set_password(password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
