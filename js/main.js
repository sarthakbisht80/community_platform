// Initialize Quill editor
const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['clean'],
            ['link', 'image', 'video']
        ]
    },
    placeholder: 'Share your thoughts...'
});

// Data Management
const STORAGE_KEY = 'community_platform_data';

// Initialize data structure
function initializeData() {
    const data = {
        posts: [],
        users: [
            {
                id: 'user1',
                name: 'John Doe',
                avatar: 'https://via.placeholder.com/40',
                communities: ['Tech Enthusiasts', 'Book Club', 'Fitness Community']
            }
        ],
        communities: [
            {
                id: 'tech',
                name: 'Tech Enthusiasts',
                members: 1200,
                icon: 'fa-code'
            },
            {
                id: 'books',
                name: 'Book Club',
                members: 856,
                icon: 'fa-book'
            },
            {
                id: 'fitness',
                name: 'Fitness Community',
                members: 1500,
                icon: 'fa-dumbbell'
            }
        ]
    };

    if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
}

// Get data from localStorage
function getData() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initializeData();
}

// Save data to localStorage
function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Function to add a new post
function addPost(content) {
    const data = getData();
    const currentUser = data.users[0]; // For demo, using first user
    
    const post = {
        id: Date.now().toString(),
        author: {
            name: currentUser.name,
            avatar: currentUser.avatar
        },
        content,
        community: 'Tech Enthusiasts',
        timestamp: new Date().toISOString(),
        reactions: 0,
        comments: []
    };

    data.posts.unshift(post);
    saveData(data);
    return post;
}

// Function to add a reaction to a post
function addReaction(postId) {
    const data = getData();
    const post = data.posts.find(p => p.id === postId);
    if (post) {
        post.reactions += 1;
        saveData(data);
    }
    return post;
}

// Function to add a comment to a post
function addComment(postId, commentText) {
    const data = getData();
    const post = data.posts.find(p => p.id === postId);
    const currentUser = data.users[0]; // For demo, using first user

    if (post) {
        const comment = {
            id: Date.now().toString(),
            author: {
                name: currentUser.name,
                avatar: currentUser.avatar
            },
            content: commentText,
            timestamp: new Date().toISOString()
        };

        post.comments.push(comment);
        saveData(data);
    }
    return post;
}

// Function to add a new post to the feed
function addPostToFeed(post) {
    const feed = document.querySelector('#feedContent');
    const postElement = createPostElement(post);
    feed.insertBefore(postElement, feed.firstChild);
    postElement.classList.add('post-enter');
    setTimeout(() => {
        postElement.classList.add('post-enter-active');
    }, 0);
}

// Function to create a post element
function createPostElement(post) {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-lg shadow p-4 card-hover';
    div.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <img class="avatar avatar-md" src="${post.author.avatar}" alt="${post.author.name}">
                <div>
                    <h3 class="font-medium">${post.author.name}</h3>
                    <p class="text-sm text-gray-500">Posted in ${post.community}</p>
                </div>
            </div>
            <span class="text-sm text-gray-500">${formatTimeAgo(post.timestamp)}</span>
        </div>
        <div class="mt-4">
            <div class="ql-editor">${post.content}</div>
        </div>
        <div class="mt-4 flex items-center space-x-4">
            <button class="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100" onclick="handleReaction('${post.id}')">
                <i class="far fa-heart"></i>
                <span>${post.reactions}</span>
            </button>
            <button class="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100" onclick="showComments('${post.id}')">
                <i class="far fa-comment"></i>
                <span>${post.comments.length}</span>
            </button>
            <button class="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100" onclick="sharePost('${post.id}')">
                <i class="far fa-share-square"></i>
                <span>Share</span>
            </button>
        </div>
    `;
    return div;
}

// Function to handle post reactions
function handleReaction(postId) {
    const button = event.currentTarget;
    const icon = button.querySelector('i');
    const count = button.querySelector('span');
    
    // Toggle reaction
    if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas', 'text-red-500');
        const post = addReaction(postId);
        count.textContent = post.reactions;
    } else {
        icon.classList.remove('fas', 'text-red-500');
        icon.classList.add('far');
        const post = addReaction(postId);
        count.textContent = post.reactions;
    }
}

// Function to show comments
function showComments(postId) {
    const postElement = event.currentTarget.closest('.card-hover');
    const commentsSection = postElement.querySelector('.comments-section');
    
    if (!commentsSection) {
        const data = getData();
        const post = data.posts.find(p => p.id === postId);
        
        // Create comments section
        const section = document.createElement('div');
        section.className = 'comments-section mt-4 border-t pt-4';
        section.innerHTML = `
            <div class="flex items-center space-x-2 mb-4">
                <input type="text" class="flex-1 input-field" placeholder="Write a comment...">
                <button class="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700" onclick="addNewComment('${postId}', this)">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
            <div class="space-y-4">
                ${post.comments.map(comment => `
                    <div class="flex items-start space-x-3">
                        <img class="avatar avatar-sm" src="${comment.author.avatar}" alt="${comment.author.name}">
                        <div class="flex-1">
                            <div class="bg-gray-50 rounded-lg p-3">
                                <div class="flex items-center justify-between">
                                    <span class="font-medium">${comment.author.name}</span>
                                    <span class="text-sm text-gray-500">${formatTimeAgo(comment.timestamp)}</span>
                                </div>
                                <p class="mt-1 text-gray-700">${comment.content}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        postElement.appendChild(section);
    } else {
        commentsSection.remove();
    }
}

// Function to add a new comment
function addNewComment(postId, button) {
    const input = button.previousElementSibling;
    const commentText = input.value.trim();
    
    if (commentText) {
        const post = addComment(postId, commentText);
        input.value = '';
        showComments(postId); // Refresh comments section
        showNotification('Comment added!', 'success');
    }
}

// Function to share a post
function sharePost(postId) {
    if (navigator.share) {
        navigator.share({
            title: 'Check out this post!',
            text: 'I found this interesting post on Community Platform',
            url: window.location.href + '?post=' + postId
        }).catch(console.error);
    } else {
        // Fallback for browsers that don't support Web Share API
        const dummy = document.createElement('input');
        document.body.appendChild(dummy);
        dummy.value = window.location.href + '?post=' + postId;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        showNotification('Link copied to clipboard!', 'success');
    }
}

// Utility function to format time ago
function formatTimeAgo(timestamp) {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    let interval = seconds / 31536000;

    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
}

// Handle post submission
document.getElementById('submitPost').addEventListener('click', () => {
    const content = quill.root.innerHTML;
    if (content.trim() === '<p><br></p>') {
        showNotification('Please write something before posting', 'error');
        return;
    }

    // Show loading state
    const button = document.getElementById('submitPost');
    const originalText = button.innerHTML;
    button.innerHTML = '<div class="spinner"></div>';
    button.disabled = true;

    // Simulate network delay
    setTimeout(() => {
        const post = addPost(content);
        addPostToFeed(post);
        quill.root.innerHTML = '';
        button.innerHTML = originalText;
        button.disabled = false;
        showNotification('Post published!', 'success');
    }, 1000);
});

// Function to show notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white ${
        type === 'error' ? 'bg-red-500' :
        type === 'success' ? 'bg-green-500' :
        'bg-blue-500'
    }`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${
                type === 'error' ? 'fa-exclamation-circle' :
                type === 'success' ? 'fa-check-circle' :
                'fa-info-circle'
            } mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize tooltips
document.querySelectorAll('[data-tooltip]').forEach(element => {
    element.addEventListener('mouseenter', (e) => {
        const tooltip = document.createElement('div');
        tooltip.className = 'fixed bg-gray-800 text-white px-2 py-1 rounded text-sm z-50';
        tooltip.textContent = e.target.dataset.tooltip;
        document.body.appendChild(tooltip);
        
        const rect = e.target.getBoundingClientRect();
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
        tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2}px`;
    });
    
    element.addEventListener('mouseleave', () => {
        document.querySelector('.fixed.bg-gray-800')?.remove();
    });
});

// Initialize the application
initializeData();

// Load existing posts
const data = getData();
data.posts.forEach(post => addPostToFeed(post)); 