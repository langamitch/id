// ✅ UPDATED: Import necessary Firebase v9+ modules (without Auth)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  doc,
  runTransaction,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  increment, // ✅ NEW: Explicitly import increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- IMPORTANT ---
const firebaseConfig = {
    apiKey: "AIzaSyDb2cl7lsypR1ZoqHGD-mKhzN_lnDcyVEQ",
    authDomain: "website-6a5f1.firebaseapp.com",
    databaseURL: "https://website-6a5f1-default-rtdb.firebaseio.com",
    projectId: "website-6a5f1",
    storageBucket: "website-6a5f1.firebasestorage.app",
    messagingSenderId: "510903945172",
    appId: "1:510903945172:web:a5f5120db75c938721f841"
};

// --- Global Variables ---
let db, postsRef;

// --- DOM Elements ---
const formOverlay = document.getElementById("form-overlay");
const searchOverlay = document.getElementById("search-overlay");
const suggestionForm = document.getElementById("suggestion-form");
const postContainer = document.getElementById("post-container");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

// ===================================================================
//  ✅ NEW AND UPDATED FUNCTIONS
// ===================================================================

function toggleOverlay(overlay) {
  if (overlay) {
    overlay.style.display =
      overlay.style.display === "block" ? "none" : "block";
  }
}

/**
 * ✅ UPDATED: Listens for posts and renders them with view/like counts.
 */
function listenForPosts() {
  if (!postsRef || !postContainer) return;
  const q = query(postsRef, orderBy("timestamp", "desc"));

  onSnapshot(q, (snapshot) => {
    postContainer.innerHTML = ""; // Clear previous posts
    snapshot.forEach((doc) => {
      const post = doc.data();
      const postId = doc.id;
      
      incrementViewCount(postId); // Increment view count for each post rendered

      const postCard = document.createElement("div");
      postCard.className = "post-card";
      postCard.innerHTML = `
        <div class="top">
            <div class="post-stats">
              <span class="material-symbols-outlined">visibility</span>
              <span>${post.viewCount || 0}</span>
            </div>
            <div class="profile-info" onclick="window.open('${post.socialLink || '#'}', '_blank')">
              <div class="profilepic"></div>
              <div class="profile">${post.name || "Unknown"}</div>
            </div>
        </div>

        <div class="content">${post.suggestion || ""}</div>

        <div class="post-actions">
            <button class="action-btn like-btn" onclick="likePost('${postId}')" aria-label="Like">
              <span class="like-count">${post.likeCount || 0}</span>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg>
            </button>
            <button class="action-btn save-btn" onclick="savePost('${postId}')" aria-label="Save">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/></svg>
            </button>
        </div>
      `;
      postContainer.appendChild(postCard);
      checkInitialButtonState(postCard, postId);
    });
  });
}

/**
 * ✅ NEW: Checks localStorage to set the initial state of buttons.
 */
function checkInitialButtonState(postCard, postId) {
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');

    if (likedPosts.includes(postId)) {
        postCard.querySelector(".like-btn").classList.add("active");
    }
    if (savedPosts.includes(postId)) {
        postCard.querySelector(".save-btn").classList.add("saved");
    }
}

/**
 * ✅ UPDATED: Handles like/unlike logic using localStorage and Firestore transactions.
 */
async function likePost(postId) {
  const postRef = doc(db, "posts", postId);
  const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
  const isLiked = likedPosts.includes(postId);
  
  const amountToIncrement = isLiked ? -1 : 1;

  if (isLiked) {
    const index = likedPosts.indexOf(postId);
    likedPosts.splice(index, 1);
  } else {
    likedPosts.push(postId);
  }
  localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
  
  await runTransaction(db, async (transaction) => {
    transaction.update(postRef, { likeCount: increment(amountToIncrement) });
  });
}

/**
 * ✅ UPDATED: Handles save/unsave logic using localStorage and Firestore.
 */
async function savePost(postId) {
  const postRef = doc(db, "posts", postId);
  const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');
  const isSaved = savedPosts.includes(postId);
  
  const amountToIncrement = isSaved ? -1 : 1;

  if (isSaved) {
    const index = savedPosts.indexOf(postId);
    savedPosts.splice(index, 1);
  } else {
    savedPosts.push(postId);
  }
  localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
  
  await runTransaction(db, async (transaction) => {
    transaction.update(postRef, { savedCount: increment(amountToIncrement) });
  });
}

/**
 * ✅ NEW: Increments the view count, tracked per browser session.
 */
async function incrementViewCount(postId) {
    const viewedPosts = JSON.parse(sessionStorage.getItem('viewedPosts') || '[]');
    if (!viewedPosts.includes(postId)) {
        viewedPosts.push(postId);
        sessionStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
        
        const postRef = doc(db, "posts", postId);
        await runTransaction(db, async (transaction) => {
            transaction.update(postRef, { viewCount: increment(1) });
        });
    }
}

/**
 * ✅ UPDATED: Searches the entire Firestore database using a keywords array.
 */
async function searchPosts() {
  const searchTerm = searchInput.value.toLowerCase().trim();

  if (!searchResults) return;
  searchResults.innerHTML = "";
  searchResults.classList.remove("active");

  if (searchTerm) {
    const keywords = searchTerm.split(' ').filter(k => k);
    const q = query(postsRef, where("keywords", "array-contains-any", keywords), limit(10));
    
    try {
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            searchResults.innerHTML = '<p class="no-results">No results found.</p>';
        } else {
            snapshot.forEach(doc => {
                const post = doc.data();
                const resultCard = document.createElement('div');
                resultCard.className = 'result-card';
                resultCard.innerHTML = `
                    <div class="result-name">${post.name}</div>
                    <div class="result-suggestion">${post.suggestion}</div>
                `;
                searchResults.appendChild(resultCard);
            });
        }
        searchResults.classList.add("active");
    } catch (error) {
        console.error("Error searching posts:", error);
        searchResults.innerHTML = '<p class="no-results">Error during search.</p>';
        searchResults.classList.add("active");
    }
  }
}

// ===================================================================
//  INITIALIZATION & EVENT LISTENERS
// ===================================================================

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  postsRef = collection(db, "posts");
  console.log("Firebase initialized successfully");
  listenForPosts(); 
} catch (error) {
  console.error("Firebase initialization failed:", error);
  alert("Could not connect to the database. Check console for errors.");
}

/**
 * ✅ UPDATED: Form submission now creates keywords and initializes counts.
 */
suggestionForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name")?.value.trim();
  const suggestion = document.getElementById("suggestion")?.value.trim();
  const socialLink = document.getElementById("social-link")?.value.trim();

  const textToProcess = `${name} ${suggestion}`.toLowerCase();
  const keywords = [...new Set(textToProcess.match(/(\w+)/g) || [])]; 

  if (name && suggestion && socialLink && /^https?:\/\//.test(socialLink)) {
    try {
      await addDoc(postsRef, {
        name,
        suggestion,
        socialLink,
        keywords, 
        likeCount: 0,
        savedCount: 0,
        viewCount: 0,
        timestamp: serverTimestamp(),
      });
      suggestionForm.reset();
      toggleOverlay(formOverlay);
      alert("Suggestion submitted successfully!");
    } catch (error) {
      console.error("Error writing to Firestore:", error);
      alert("Failed to submit suggestion. Check console for details.");
    }
  } else {
    alert("Please fill in all fields. The URL must start with http:// or https://");
  }
});

// --- Other Event Listeners ---
searchInput?.addEventListener("keyup", searchPosts);
document.querySelector(".search-icon")?.addEventListener("click", () => toggleOverlay(searchOverlay));
document.querySelector(".toggle")?.addEventListener("click", () => toggleOverlay(formOverlay));
document.querySelector("#search-overlay .close-btn")?.addEventListener("click", () => {
    toggleOverlay(searchOverlay);
    searchResults.classList.remove("active");
    searchInput.value = '';
});
document.querySelector("#form-overlay .close-btn")?.addEventListener("click", () => toggleOverlay(formOverlay));

// Make functions globally accessible for inline onclick handlers
window.likePost = likePost;
window.savePost = savePost;

