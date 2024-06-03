from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from datetime import datetime
from .models import User, Post, Follow
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
    dateAndTime = datetime.fromtimestamp(timestamp/ 1000.0)
    post = Post.objects.create(postedBy = postedBy, content = content, dateAndTime = dateAndTime, likes = likes)
    post.save()
    return JsonResponse({"success" : "Posted Successfully"}, status = 201)
def get_posts(request):
    pass


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
