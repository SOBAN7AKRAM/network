// const { json } = require("react-router-dom");

document.addEventListener('DOMContentLoaded', () => {
    
    showAllPostPage();
    getPostsByPage(1).then(post => {
        makePagination(post.totalPages)
        updatePagination();
        post.posts.forEach(p => {
            showPost(p);
        })
        

    });
    history.replaceState({page : 'allPosts'}, '', '/');
    document.querySelector('#newPostBtn').onclick = () => {
        showNewPostPage();
        history.pushState({page : 'newPost'}, '', 'new-post');
        document.querySelector('#newPostForm').onsubmit = (event) => {
            event.preventDefault();
            postNewPost().then(async () => {
                await new Promise((resolve) => {
                    history.replaceState({ page: 'allPosts' }, '', '/');
                    resolve();
                });
            
                document.querySelector('.postsContainer').innerHTML = '';
                showAllPostPage();
                getPostsByPage(1).then(post => {
                    addPageToPagination(post.totalPages)
                    post.posts.forEach(p => {
                        showPost(p);
                    });
                });
            });
            
            
        }
    }
})
function addPageToPagination(page)
{
    const pagination = document.querySelector('.pagination')
    const li = document.createElement('li');
    li.innerHTML = page;
    li.classList.add('page-item', 'page-link');
    pagination.append(li);
}
function makePagination(pages)
{
    const pagination = document.querySelector('.pagination')
    const previous = document.createElement('li');
    previous.innerHTML = 'Previous';
    previous.classList.add('page-item', 'page-link', 'disabled');
    pagination.append(previous);
    for (let i  = 0; i < pages; i++)    {
       const li = document.createElement('li');
        li.innerHTML = i + 1;
        li.classList.add('page-item', 'page-link');
        if (i == 0)
            {
                li.classList.add('active');
            }
        pagination.append(li);
    }
    const li2 = document.createElement('li');
    li2.innerHTML = 'Next';
    li2.classList.add('page-item', 'page-link');
    pagination.append(li2);
}
function updatePagination()
{
    const li = document.querySelectorAll('.page-link');
    let page = 0;
    console.log(li);
    li.forEach(element => {
        element.onclick = () => {
            if (element.innerHTML === 'Previous')
                {
                    
                }
            else if (element.innerHTML === 'Next')
                {

                }
                else 
                {
                    
                    element.classList.add('active');
                    page = parseInt(element.innerHTML);
                    console.log(page);
                }
                li.forEach(e => {
                    if (e.classList.contains('active') && e != element)
                        {
                            e.classList.remove('active');
                        }
                })
                getPostsByPage(page).then((post) => {
                    document.querySelector('.postsContainer').innerHTML = '';
                    post.posts.forEach((p) => {
                        showPost(p);
                    })
                })
        }
    });
}
function showPost(post)
{
    let postsContainer = document.querySelector('.postsContainer');
    const item = document.createElement('div');
    const header = document.createElement('div');
    const heading = document.createElement('h3');
    const editBtn = document.createElement('button');
    const container = document.createElement('div');
    const content = document.createElement('p');
    const date = document.createElement('div');
    const bottom = document.createElement('div');
    const likes = document.createElement('div');
    const comment = document.createElement('div');
    item.classList.add('postItem');
    header.classList.add('postHeader');
    editBtn.classList.add('btn', 'btn-outline-primary', 'editBtn')
    container.classList.add('postContentContainer');
    content.classList.add('postContent');
    date.classList.add('postDate');
    bottom.classList.add('postBottom');
    likes.classList.add('postLikes');
    comment.classList.add('postComment');
    heading.innerHTML = post.postedBy;
    editBtn.innerHTML = 'Edit';
    if (!post.isOwner)
        {
            editBtn.style.display = 'none';
        }
    header.append(heading, editBtn);
    content.innerHTML = post.content;
    date.innerHTML = formatTimestamp(post.dateAndTime);
    container.append(content, date);
    likes.innerHTML ="Likes "+ post.likes;
    comment.innerHTML = 'Comment';
    bottom.append(likes, comment);
    item.append(header, container, bottom);
    postsContainer.append(item);

}
function showEditButton(){
    let postItem = document.querySelector('.postItem').all();
    postItem.forEach(item => {
        // if (item.post)
    })
}
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    };
    return date.toLocaleString('en-US', options);
}
function showAllPostPage()
{
    const newPost = document.querySelector('#newPost');
    const allPosts = document.querySelector('#allPosts');
    const pagination = document.querySelector('.pagination')
    const postsContainer = document.querySelector('.postsContainer')
    newPost.style.display = 'none';
    allPosts.style.display = 'block';
    pagination.style.display = 'flex';
    postsContainer.style.display = 'block';
}
function showNewPostPage()
{
    const newPost = document.querySelector('#newPost');
    const allPosts = document.querySelector('#allPosts');
    const pagination = document.querySelector('.pagination')
    const postsContainer = document.querySelector('.postsContainer')
    newPost.style.display = 'block';
    allPosts.style.display = 'none';
    pagination.style.display = 'none';
    postsContainer.style.display = 'none';
}

async function getPostsByPage(page)
{
    try{
        const response = await fetch(`/get-posts?page=${page}`, {
            method: 'GET', 
        })
        const data = await response.json();
        console.log(data);
        return data;
    }
    catch(err){
        console.log(err);
        return null;
    }
    
}


async function postNewPost()
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
