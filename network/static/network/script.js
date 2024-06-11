// const { json } = require("react-router-dom");

// const { json } = require("react-router-dom");

document.addEventListener('DOMContentLoaded', () => {

    showAllPostPage();
    getPostsByPage(1).then(post => {
        makePagination(post.totalPages)
        post.posts.forEach(p => {
            showPost(p);
        })
        updatePagination(post.totalPages);


    });
    history.replaceState({ page: 'allPosts' }, '', '/');
    document.querySelector('#newPostBtn').onclick = () => {
        showNewPostPage();
        history.pushState({ page: 'newPost' }, '', 'new-post');
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
                    updatePagination(post.totalPages);
                });
            });


        }
    }

})
function addPageToPagination(page) {
    const pagination = document.querySelector('.pagination')
    const li = document.createElement('li');
    li.innerHTML = page;
    li.classList.add('page-item', 'page-link');
    pagination.append(li);
}
function makePagination(pages) {
    const pagination = document.querySelector('.pagination')
    const previous = document.createElement('li');
    previous.innerHTML = 'Previous';
    previous.classList.add('page-item', 'page-link', 'disabled', 'previous');
    pagination.append(previous);
    for (let i = 0; i < pages; i++) {
        const li = document.createElement('li');
        li.innerHTML = i + 1;
        li.classList.add('page-item', 'page-link');
        if (i == 0) {
            li.classList.add('active');
        }
        pagination.append(li);
    }
    const li2 = document.createElement('li');
    li2.innerHTML = 'Next';
    li2.classList.add('page-item', 'page-link', 'next');
    pagination.append(li2);
}

function updatePagination(totalPages) {
    const li = document.querySelectorAll('.page-link');
    li.forEach(element => {
        element.onclick = () => {
            let active = document.querySelector('.active');
            let currentPage = parseInt(active.innerHTML);
            let newPage = currentPage;
            if (element.innerHTML === 'Previous') {
                if (currentPage > 1) {
                    newPage = currentPage - 1;
                }
            } else if (element.innerHTML === 'Next') {
                if (currentPage < totalPages) {
                    newPage = currentPage + 1;
                }
            } else {
                newPage = parseInt(element.innerHTML);
            }
            if (newPage !== currentPage) {
                document.querySelector('.postsContainer').innerHTML = '';
                getPostsByPage(newPage).then(post => {
                    post.posts.forEach(p => {
                        showPost(p);
                    });
                    active.classList.remove('active');
                    document.querySelectorAll('.page-link')[newPage].classList.add('active');
                    const previousButton = document.querySelector('.page-link.previous');
                    const nextButton = document.querySelector('.page-link.next');

                    if (newPage === 1) {
                        previousButton.classList.add('disabled');
                    } else {
                        previousButton.classList.remove('disabled');
                    }

                    if (newPage === totalPages) {
                        nextButton.classList.add('disabled');
                    } else {
                        nextButton.classList.remove('disabled');
                    }
                });
            }
        }
    });
}
function showPost(post) {
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
    item.dataset.postId = post.id;

    heading.innerHTML = post.postedBy;
    editBtn.innerHTML = 'Edit';
    if (!post.isOwner) {
        editBtn.style.display = 'none';
    }
    header.append(heading, editBtn);
    content.innerHTML = post.content;
    date.innerHTML = formatTimestamp(post.dateAndTime);
    container.append(content, date);


    // creating a img container
    const likeImage = document.createElement('img');
    getHasLikedPost(post.id).then(data => {
        if (data && data.liked) {
            likeImage.src = staticUrl + 'redHeart.png';
        }
        else {
            likeImage.src = staticUrl + 'blackHeart.png';
        }
    })
    likeImage.classList.add('heartImg');
    likes.id = `likes-${post.id}`;
    likes.append(likeImage, post.likes);
    likes.onclick = function () { likePost(post.id) }
    comment.innerHTML = 'Comment';
    bottom.append(likes, comment);
    item.append(header, container, bottom);
    postsContainer.append(item);

}
function likePost(id) {
    fetch(`like-post/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
    })
        .then((response) => {
            if (response.status === 403) {
                window.location.href = '/login';
            }
            else {
                return response.json();
            }
        })
        .then(data => {
            if (data) {
                const likesElement = document.querySelector(`#likes-${id}`);
                if (likesElement) {
                    if (data.liked) {
                        likesElement.innerHTML = `<img src="${staticUrl}redHeart.png" class="heartImg"> ${data.likes}`;
                    }
                    else {
                        likesElement.innerHTML = `<img src="${staticUrl}blackHeart.png" class="heartImg"> ${data.likes}`;

                    }
                }
            }
        })
}
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
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
function showAllPostPage() {
    const newPost = document.querySelector('#newPost');
    const allPosts = document.querySelector('#allPosts');
    const pagination = document.querySelector('.pagination')
    const postsContainer = document.querySelector('.postsContainer')
    newPost.style.display = 'none';
    allPosts.style.display = 'block';
    pagination.style.display = 'flex';
    postsContainer.style.display = 'block';
}
function showNewPostPage() {
    const newPost = document.querySelector('#newPost');
    const allPosts = document.querySelector('#allPosts');
    const pagination = document.querySelector('.pagination')
    const postsContainer = document.querySelector('.postsContainer')
    newPost.style.display = 'block';
    allPosts.style.display = 'none';
    pagination.style.display = 'none';
    postsContainer.style.display = 'none';
}
async function getHasLikedPost(id) {
    return fetch(`has-liked/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (response.status === 403) {
            // Handle response errors
            return null;
        }
        return response.json();
    })
    .catch(error => {
        console.error('Error fetching like status:', error);
        return null;
    });

}
async function getPostsByPage(page) {
    try {
        const response = await fetch(`/get-posts?page=${page}`, {
            method: 'GET',
        })
        const data = await response.json();
        console.log(data);
        return data;
    }
    catch (err) {
        console.log(err);
        return null;
    }

}


async function postNewPost() {
    let content = document.querySelector('#postContent').value;
    let timeStamp = Date.now();
    const csrfToken = document.querySelector('#newPostForm [name="csrfmiddlewaretoken"]').value;
    fetch('/new-post', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            postContent: content,
            datetime: timeStamp
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.error) {
                if (data.error == "User not authenticated") {
                    window.location.href = '/login';
                }
            }
        })
        .catch(err => {
            console.log(err);
        })
}
window.onpopstate = function (event) {
    if (event.state) {
        if (event.state.page === 'allPosts') {
            showAllPostPage();
        } else if (event.state.page === 'newPost') {
            showNewPostPage();
        }
    }
};
