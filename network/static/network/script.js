// const { json } = require("react-router-dom");

document.addEventListener('DOMContentLoaded', () => {
    
    showAllPostPage();
    history.replaceState({page : 'allPosts'}, '', '');
    document.querySelector('#newPostBtn').onclick = () => {
        showNewPostPage();
        history.pushState({page : 'newPost'}, '', 'new-post');
        document.querySelector('#newPostForm').onsubmit = (event) => {
            event.preventDefault();
            postNewPost();
          
        }
    }
})
function showAllPostPage()
{
    const newPost = document.querySelector('#newPost');
    newPost.style.display = 'none';
    const allPosts = document.querySelector('#allPosts');
    allPosts.style.display = 'block';
}
function showNewPostPage()
{
    const newPost = document.querySelector('#newPost');
    const allPosts = document.querySelector('#allPosts');
    newPost.style.display = 'block';
    allPosts.style.display = 'none';
}
function postNewPost()
{
    let content = document.querySelector('#postContent').value;
    let timeStamp = Date.now();
    const csrfToken = document.querySelector('#newPostForm [name="csrfmiddlewaretoken"]').value;
    fetch('/new-post', {
        method: 'POST', 
        headers: {
            'X-CSRFToken' : csrfToken,
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
            postContent : content,
            datetime : timeStamp
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.error)
            {
                if (data.error == "User not authenticated")
                    {
                        window.location.href = '/login';
                    }
            }
    })
    .catch(err => {
        console.log(err);
    })
}
window.onpopstate = function(event){
    if (event.state) {
        if (event.state.page === 'allPosts') {
            showAllPostPage();
        } else if (event.state.page === 'newPost') {
            showNewPostPage();
        }
    }
};