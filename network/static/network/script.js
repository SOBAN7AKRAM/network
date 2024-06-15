
document.addEventListener('DOMContentLoaded', () => {
    
    const navProfile = document.querySelector('#navProfile');
    if (navProfile != undefined && navProfile != null){
        navProfile.onclick = () => {
            history.pushState({page: "user", userId: navProfile.dataset.id}, '', '/user')
            showProfilePage(navProfile.dataset.id);
        }
    }
    const following = document.querySelector('#followingLink');
    if (following != undefined && following != null){
        following.onclick = () => {
            history.pushState({ page: 'following', pageNo: 1 }, '', '/following');
            showFollowingPage();
        }
    }
    showAllPostPage();
    getPostsByPage(1, "allPost").then(post => {
        makePagination(post.totalPages)
        document.querySelector('.postsContainer').innerHTML = '';
        post.posts.forEach(p => {
            showPost(p);
        })
        updatePagination(post.totalPages);


    });
    history.replaceState({ page: 'allPosts', pageNo: 1 }, '', '/');
    document.querySelector('#newPostBtn').onclick = () => {
        showNewPostPage();
        history.pushState({ page: 'newPost' }, '', 'new-post');
        document.querySelector('#newPostForm').onsubmit = (event) => {
            event.preventDefault();
            postNewPost();
            
        }
                
        
    }

})



function showFollowingPage(){
    const newPost = document.querySelector('#newPost');
    const allPosts = document.querySelector('#allPosts');
    const pagination = document.querySelector('.pagination')
    const postsContainer = document.querySelector('.postsContainer')
    const makeCommment = document.querySelector('#makeComment');
    const comments = document.querySelector('#comments');
    const editPost = document.querySelector('#editPost');
    const profile = document.querySelector('#profile');
    const followingPage = document.querySelector('#followingPage');
    followingPage.style.display = 'block';
    profile.style.display = 'none';
    editPost.style.display = 'none';
    newPost.style.display = 'none';
    allPosts.style.display = 'none';
    pagination.style.display = 'flex';
    postsContainer.style.display = 'block';
    makeCommment.style.display = 'none';
    comments.style.display = 'none';
    pagination.innerHTML = '';
    postsContainer.innerHTML = '';
    history.pushState({page: 'following'}, '', `/following`)
    getPostsByPage(1, "followerPost").then(post => {

        makePagination(post.totalPages)
        post.posts.forEach(p => {
            showPost(p);
        })
        updatePagination(post.totalPages, "followPost");
    })
}

function addPageToPagination(page) {
    const pagination = document.querySelector('.pagination')
    const li = document.createElement('li');
    li.innerHTML = page;
    li.classList.add('page-item', 'page-link');
    pagination.append(li);
}
function makePagination(pages) {
    const pagination = document.querySelector('.pagination')
    pagination.innerHTML = '';
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

function updatePagination(totalPages, page, userId) {
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
                    if (page === "followPost")
                        {
                            getPostsByPage(newPage, "followerPost").then(post => {
                                post.posts.forEach(p => {
                                    showPost(p);
                                });
                            });
                            
                        }
                        else if (page === "userPost")
                            {
                                getUserPosts(userId, newPage).then(post => {
                                    post.posts.forEach(p => {
                                        showPost(p);
                                    })
                                })
                            }
                        else
                        {
                            getPostsByPage(newPage, "allPost").then(post => {
                                post.posts.forEach(p => {
                                    showPost(p);
                                });
                            });
                        }
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
                
            }
            history.replaceState({ page: 'allPosts', pageNo: newPage }, '', '/');
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
    heading.classList.add('postHeading');
    item.dataset.postId = post.id;
    heading.innerHTML = post.postedBy;
    heading.onclick = function () {showProfilePage(post.userId)};
    editBtn.innerHTML = 'Edit';
    if (!post.isOwner) {
        editBtn.style.display = 'none';
    }
    editBtn.onclick = function () { showEditPostPage(post) };
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
    comment.id = `comment-${post.id}`
    comment.onclick = function () { showCommentsPage(post.id, post) }
    bottom.append(likes, comment);
    item.append(header, container, bottom);
    postsContainer.append(item);

}
function getUser(userId){
    fetch(`get-user-profile/${userId}`, {
        method: "GET", 
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        updateProfile(data, userId);
    })
    .catch(err => console.log(err))
}
function postFollow(userId){
    fetch(`/get-user-profile/${userId}`, {
        method: "POST", 
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        updateProfile(data, userId);
    })
    .catch(err => console.log(err))
}


function updateProfile(data, userId){
    document.querySelector('#userName').innerHTML = (`${data.username}`);
        document.querySelector('#follower strong').innerHTML = (`${data.follower}`);
        document.querySelector('#following strong').innerHTML = (`${data.following}`);
        const followBtn = document.querySelector('#followBtn');
        if (data.isOwner){
            followBtn.style.display = 'none';
        }
        if (data.isFollowed){
            followBtn.classList.remove('btn-outline-primary');
            followBtn.classList.add('btn-outline-secondary');
            followBtn.innerHTML = 'Unfollow';
        }
        else{
            followBtn.classList.add('btn-outline-primary');
            followBtn.classList.remove('btn-outline-secondary');
            followBtn.innerHTML = 'Follow';
        }
        followBtn.onclick = function () {postFollow(userId)};
}
function showEditPostPage(post){
    const newPost = document.querySelector('#newPost');
    const allPosts = document.querySelector('#allPosts');
    const pagination = document.querySelector('.pagination')
    const postsContainer = document.querySelector('.postsContainer')
    const makeCommment = document.querySelector('#makeComment');
    const comments = document.querySelector('#comments');
    const editPost = document.querySelector('#editPost');
    const profile = document.querySelector('#profile');
    const followingPage = document.querySelector('#followingPage');
    followingPage.style.display = 'none';
    profile.style.display = 'none';
    editPost.style.display = 'block';
    newPost.style.display = 'none';
    allPosts.style.display = 'none';
    pagination.style.display = 'none';
    postsContainer.style.display = 'none';
    makeCommment.style.display = 'none';
    comments.style.display = 'none';
    history.pushState({page: 'editPost', post: post}, '', `/edit-post/${post.id}`)
    document.querySelector('#editPostContent').value = post.content;
    document.querySelector('#editPostForm').onsubmit = (event) => {
        event.preventDefault();
        putEditPost(post.id).then(() => {
            showAllPostPage();
            history.pushState({ page: 'allPosts' }, '', '/');
        });
    }
}
function showCommentsPage(id, post){
    const allPosts = document.querySelector('#allPosts');
    const pagination = document.querySelector('.pagination')
    const postsContainer = document.querySelector('.postsContainer')
    const makeCommment = document.querySelector('#makeComment')
    const comments = document.querySelector('#comments');
    const profile = document.querySelector('#profile');
    const followingPage = document.querySelector('#followingPage');
    followingPage.style.display = 'none';
    profile.style.display = 'none';
    allPosts.style.display = 'none';
    pagination.style.display = 'none';
    makeCommment.style.display = 'block';
    comments.style.display = 'block';
    postsContainer.style.display = 'none';
    history.pushState({page: 'commentPage', postId : id}, '', `/comment/post/${id}`);
    getComments(id).then(() => {})
    document.querySelector('#commentForm').onsubmit = (event) => {
        event.preventDefault();
        postComment(id).then(async () => {
            await new Promise((resolve) => {
                resolve();
            })
        })
    }
}
function showComments(comment){
    const commentsContainer = document.querySelector('#commentsContainer');
    const item = document.createElement('div');
    const header = document.createElement('div');
    const heading = document.createElement('h3');
    const container = document.createElement('div');
    const content = document.createElement('p');
    const date = document.createElement('div');
    item.classList.add('postItem');
    header.classList.add('postHeader');
    container.classList.add('postContentContainer');
    content.classList.add('postContent');
    date.classList.add('postDate');

    heading.innerHTML = comment.user;
    header.append(heading);
    content.innerHTML = comment.comment;
    date.innerHTML = formatTimestamp(comment.datetime);
    container.append(content, date);
    item.append(header, container);
    commentsContainer.append(item);

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
function showProfilePage(userId){
    const newPost = document.querySelector('#newPost');
    const allPosts = document.querySelector('#allPosts');
    const pagination = document.querySelector('.pagination')
    const postsContainer = document.querySelector('.postsContainer')
    const makeCommment = document.querySelector('#makeComment');
    const comments = document.querySelector('#comments');
    const editPost = document.querySelector('#editPost');
    const profile = document.querySelector('#profile');
    const followingPage = document.querySelector('#followingPage');
    followingPage.style.display = 'none';
    profile.style.display = 'block';
    editPost.style.display = 'none';
    newPost.style.display = 'none';
    allPosts.style.display = 'none';
    pagination.style.display = 'flex';
    postsContainer.style.display = 'block';
    makeCommment.style.display = 'none';
    comments.style.display = 'none';
    pagination.innerHTML = '';
    postsContainer.innerHTML = '';
    getUser(userId);
    history.pushState({page: 'user',  userId : userId}, '', `/user/${userId}`)
    getUserPosts(userId, 1).then(post => {

        makePagination(post.totalPages)
        post.posts.forEach(p => {
            showPost(p);
        })
        updatePagination(post.totalPages, "userPost", userId);
    })
}
async function getUserPosts(userId, page){
    try {
        const response = await fetch(`/get-user-posts/${userId}?page=${page}`, {
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

function showAllPostPage() {
    const newPost = document.querySelector('#newPost');
    const allPosts = document.querySelector('#allPosts');
    const pagination = document.querySelector('.pagination')
    const postsContainer = document.querySelector('.postsContainer')
    const makeCommment = document.querySelector('#makeComment');
    const comments = document.querySelector('#comments');
    const editPost = document.querySelector('#editPost');
    const profile = document.querySelector('#profile');
    const followingPage = document.querySelector('#followingPage');
    followingPage.style.display = 'none';
    profile.style.display = 'none';
    editPost.style.display = 'none';
    newPost.style.display = 'none';
    allPosts.style.display = 'block';
    pagination.style.display = 'flex';
    postsContainer.style.display = 'block';
    makeCommment.style.display = 'none';
    comments.style.display = 'none';
}
function showNewPostPage() {
    const newPost = document.querySelector('#newPost');
    const allPosts = document.querySelector('#allPosts');
    const pagination = document.querySelector('.pagination')
    const postsContainer = document.querySelector('.postsContainer')
    const makeCommment = document.querySelector('#makeComment');
    const comments = document.querySelector('#comments');
    const followingPage = document.querySelector('#followingPage');
    followingPage.style.display = 'none';
    newPost.style.display = 'block';
    allPosts.style.display = 'none';
    pagination.style.display = 'none';
    postsContainer.style.display = 'none';
    makeCommment.style.display = 'none';
    comments.style.display = 'none';

}
async function putEditPost(id){
    let postContent = document.querySelector('#editPostContent').value;
    const csrfToken = document.querySelector('#editPostForm [name="csrfmiddlewaretoken"]').value;
    fetch (`/edit-post/${id}`, {
        method: 'PUT', 
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content : postContent
        })
    })
    .then (response => {
        if (response.status === 403)
            {
                window.location.href = '/login';
            }
            const pContent = document.querySelector(`.postItem[data-post-id="${id}"] .postContent`);
            pContent.innerHTML = postContent;
        
    })
    .catch ( (err) => {
        console.log(err)
    });
}
async function getHasLikedPost(id) {
    return fetch(`/has-liked/${id}`, {
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
async function getPostsByPage(page, name) {
    try {
        const response = await fetch(`/get-posts/${name}?page=${page}`, {
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
async function getComments(postId){
    return fetch(`/get-comments/${postId}`, {
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
    .then((data) => {
        if (data)
            {
                data.comments.forEach((comment) => {
                    showComments(comment);
                })
            }
    })
    .catch(error => {
        console.error('Error fetching like status:', error);
        return null;
    });
}
async function postComment(id){
    let content = document.querySelector('#commentContent').value;
    let timeStamp = Date.now();
    const csrfToken = document.querySelector('#commentForm [name="csrfmiddlewaretoken"]').value;
    fetch(`/comment/${id}`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            comment: content,
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
            else{
                showComments({'comment': content, 'datetime': timeStamp, 'user': data.user});
            }
        })
        .catch(err => {
            console.log(err);
        })
}
function postNewPost() {
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
            else{
                document.querySelector('.postsContainer').innerHTML = '';
                history.pushState({ page: 'allPosts', pageNo: 1 }, '', '/');
                showAllPostPage();
                getPostsByPage(1, "allPost").then(post => {
                    addPageToPagination(post.totalPages)
                    post.posts.forEach(p => {
                        showPost(p);
                    });
                    updatePagination(post.totalPages);
                });
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
            getPostsByPage(event.state.pageNo, "allPost").then(post => {
                makePagination(post.totalPages)
                document.querySelector('.active').classList.remove('active');
                document.querySelectorAll('.page-link')[event.state.pageNo].classList.add('active');
                document.querySelector('.postsContainer').innerHTML = '';
                document.querySelector('.previous').classList.remove('disabled');
                post.posts.forEach(p => {
                    showPost(p);
                })
                updatePagination(post.totalPages);
            })

        } else if (event.state.page === 'newPost') {
            showNewPostPage();
        }
        else if (event.state.page === 'editPost'){
            showEditPostPage(event.state.post);
        }
        else if (event.state.page === 'commentPage'){
            showCommentsPage(event.state.postId);
        }
        else if (event.state.page === 'user'){
            showProfilePage(event.state.userId);
        }
        else if (event.state.page === 'following'){
            showFollowingPage();
        }
    }
};



