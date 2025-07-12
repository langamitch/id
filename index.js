// Firebase Configuration (Replace with your config)
  const firebaseConfig = {
    apiKey: "AIzaSyDb2cl7lsypR1ZoqHGD-mKhzN_lnDcyVEQ",
    authDomain: "website-6a5f1.firebaseapp.com",
    projectId: "website-6a5f1",
    storageBucket: "website-6a5f1.firebasestorage.app",
    messagingSenderId: "510903945172",
    appId: "1:510903945172:web:a5f5120db75c938721f841"
  };
  // Import Firebase (v9+ modular syntax for Firestore)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// Initialize Firebase
try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app); // Firestore instance
    const postsRef = collection(db, 'posts'); // Reference to 'posts' collection
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization failed:", error);
}

// Toggle Overlay Function
function toggleOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);
    overlay.style.display = overlay.style.display === 'block' ? 'none' : 'block';
}

// Submit Form
document.getElementById('suggestion-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("Form submission triggered");

    const name = document.getElementById('name')?.value.trim();
    const suggestion = document.getElementById('suggestion')?.value.trim();
    const socialLink = document.getElementById('social-link')?.value.trim();

    console.log("Form data:", { name, suggestion, socialLink });

    if (name && suggestion && socialLink && /^https?:\/\//.test(socialLink)) {
        console.log("Validation passed");
        const newPost = {
            name: name,
            suggestion: suggestion,
            socialLink: socialLink,
            timestamp: Date.now()
        };
        try {
            await addDoc(postsRef, newPost);
            console.log("Data written successfully to Firestore");
            document.getElementById('suggestion-form').reset();
            toggleOverlay('form-overlay');
            alert('Suggestion submitted successfully!');
        } catch (error) {
            console.error("Error writing to Firestore:", error);
            alert('Failed to submit suggestion. Check console for details.');
        }
    } else {
        console.log("Validation failed");
        alert('Please fill in all fields with a valid URL starting with http:// or https://');
    }
});

// Retrieve and Display All Posts
onSnapshot(postsRef, (snapshot) => {
    const postContainer = document.getElementById('post-container');
    if (postContainer) {
        postContainer.innerHTML = '';
        snapshot.forEach((doc) => {
            const post = doc.data();
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            postCard.innerHTML = `
                <div class="profile" onclick="window.open('${post.socialLink || '#'}', '_blank')">${post.name || 'Unknown'}</div>
                <div class="content">${post.suggestion || ''}</div>
                <div class="empty"></div>
            `;
            postContainer.appendChild(postCard);
        });
        console.log("Posts displayed:", snapshot.docs.map(doc => doc.data()));
    } else {
        console.error("post-container element not found");
    }
}, (error) => {
    console.error("Error fetching posts:", error);
});

// Search Functionality
function searchPosts() {
    const searchInput = document.getElementById('search-input')?.value.toLowerCase();
    const searchResults = document.getElementById('search-results');
    const postContainer = document.getElementById('post-container');

    if (searchResults && postContainer) {
        searchResults.innerHTML = '';
        searchResults.classList.remove('active');

        if (searchInput) {
            let found = false;
            const allPosts = postContainer.getElementsByClassName('post-card');
            Array.from(allPosts).forEach(post => {
                const name = post.getElementsByClassName('profile')[0]?.textContent.toLowerCase() || '';
                const content = post.getElementsByClassName('content')[0]?.textContent.toLowerCase() || '';
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
    } else {
        console.error("search-results or post-container not found");
    }
}

// Open search overlay when clicking the icon
document.querySelector('.search-icon')?.addEventListener('click', () => {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = ''; // Clear search input
        searchPosts(); // Clear previous results
        toggleOverlay('search-overlay');
    } else {
        console.error("search-input not found");
    }
});
