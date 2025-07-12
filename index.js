// Firebase Configuration (Replace with your config)
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    databaseURL: "your-database-url",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const postsRef = database.ref('posts');

function toggleOverlay(overlayId) {
    document.getElementById(overlayId).style.display =
        document.getElementById(overlayId).style.display === 'block' ? 'none' : 'block';
}

// Submit Form
document.getElementById('suggestion-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const suggestion = document.getElementById('suggestion').value;
    const socialLink = document.getElementById('social-link').value;

    postsRef.push({
        name: name,
        suggestion: suggestion,
        socialLink: socialLink,
        timestamp: Date.now()
    });

    document.getElementById('suggestion-form').reset();
    toggleOverlay('form-overlay');
});

// Retrieve and Display All Posts
postsRef.on('value', (snapshot) => {
    const postContainer = document.getElementById('post-container');
    postContainer.innerHTML = '';
    snapshot.forEach((childSnapshot) => {
        const post = childSnapshot.val();
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        postCard.innerHTML = `
            <div class="profile" onclick="window.open('${post.socialLink}', '_blank')">${post.name}</div>
            <div class="content">${post.suggestion}</div>
            <div class="empty"></div>
        `;
        postContainer.appendChild(postCard);
    });
});

// Search Functionality
function searchPosts() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const searchResults = document.getElementById('search-results');
    const postContainer = document.getElementById('post-container');
    const allPosts = postContainer.getElementsByClassName('post-card');

    searchResults.innerHTML = '';
    searchResults.classList.remove('active');

    if (searchInput) {
        let found = false;
        Array.from(allPosts).forEach(post => {
            const name = post.getElementsByClassName('profile')[0].textContent.toLowerCase();
            const content = post.getElementsByClassName('content')[0].textContent.toLowerCase();
            if (name.includes(searchInput) || content.includes(searchInput)) {
                found = true;
                const clone = post.cloneNode(true);
                searchResults.appendChild(clone);
            }
        });
        if (found) {
            searchResults.classList.add('active');
        }
    }
}

// Open search overlay when clicking the icon
document.querySelector('.search-icon').addEventListener('click', () => {
    document.getElementById('search-input').value = ''; // Clear search input
    searchPosts(); // Clear previous results
    toggleOverlay('search-overlay');
});
