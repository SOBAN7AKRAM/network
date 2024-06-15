from django.test import TestCase, Client
from .models import Post, Follow, Comment, User, Like
from datetime import datetime
from django.utils import timezone
# Create your tests here.




class ModelsTestCases(TestCase):
    def setUp(self):
        # create user objects
        self.u1 = User.objects.create_user(username = 'david', email = 'd@gmail.com', password = 'david')
        self.u2 = User.objects.create_user(username = 'harry', email = 'h@gmail.com', password = 'harry')
        # create post objects
        self.p1 = Post.objects.create(postedBy = self.u1, content = 'hello, world', likes = 0, dateAndTime = timezone.now())
        self.p2 = Post.objects.create(postedBy = self.u1, content = 'hello, fellows', likes = 5, dateAndTime = timezone.now())
        self.p3 = Post.objects.create(postedBy = self.u2, content = 'Go, world', likes = 4, dateAndTime = timezone.now())
        
    def test_post_count(self):
        u = User.objects.get(username = 'david')
        p = Post.objects.filter(postedBy = u)
        self.assertEqual(p.count(), 2)
    def test_notAccess_to_newPost(self):
        c = Client()
        response = c.get("/new-post")
        self.assertEqual(response.status_code, 403)
    def test_new_post_authenticated(self):
        c = Client()
        # Log in the user
        c.login(username='david', password='david')
        response = c.get("/new-post")
        self.assertEqual(response.status_code, 400)  # Expecting 400 because it's not a POST request

    def test_new_post_authenticated_post_request(self):
        c = Client()
        # Log in the user
        c.login(username='david', password='david')
        # Prepare the data for the POST request
        post_data = {
            'postContent': 'Test post content',
            'datetime': int(timezone.now().timestamp() * 1000)  # Convert to JavaScript timestamp
        }
        response = c.post("/new-post", post_data, content_type="application/json")
        self.assertEqual(response.status_code, 201)
    
    def test_get_post(self):
        c = Client()
        response = c.get("/get-posts/allPost?page=1")
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertEqual(len(response_data["posts"]), 3)