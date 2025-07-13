// Import Firebase (v9+ modular syntax for Firestore)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
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
//  ✅ FIX: MOVE ALL FUNCTION DECLARATIONS HERE (BEFORE THEY ARE CALLED)
// ===================================================================

function toggleOverlay(overlay) {
  if (overlay) {
    overlay.style.display =
      overlay.style.display === "block" ? "none" : "block";
  }
}

function listenForPosts() {
  if (!postsRef || !postContainer) return;

  onSnapshot(
    postsRef,
    (snapshot) => {
      postContainer.innerHTML = ""; // Clear previous posts
      snapshot.forEach((doc) => {
        const post = doc.data();
        const postId = doc.id; // Unique ID for the post
        const postCard = document.createElement("div");
        
        postCard.className = "post-card";
        postCard.innerHTML = `
          <div class="top" onclick="window.open('${post.socialLink || '#'}', '_blank')">
            <div class="profilepic"></div>
            <div class="profile">${post.name || "Unknown"}</div>
          </div>

          <div class="content">${post.suggestion || ""}</div>

          <div class="post-actions">
            <div class="action-group">
              <button class="action-btn" onclick="likePost(this, '${postId}')" aria-label="Like">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                    <path d="M12.781 2.375c.383-1.29 2.055-1.29 2.438 0l1.218 4.114c.13.44.532.748 1 .748h4.328c1.32 0 1.874 1.703.813 2.51l-3.499 2.544c-.38.275-.56.75-.43 1.19l1.218 4.114c.383 1.29-1.045 2.438-2.106 1.624l-3.5-2.544c-.38-.275-.87-.275-1.25 0l-3.499 2.544c-1.06.814-2.489-.334-2.106-1.624l1.218-4.114c.13-.44-.05-.885-.43-1.19L1.99 9.747C.93 8.94.375 7.237 1.695 7.237h4.328c.468 0 .87-.308 1-.748l1.218-4.114z" />
                </svg>
              </button>
              <button class="action-btn" onclick="dislikePost(this, '${postId}')" aria-label="Dislike">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                    <path d="M11.219 21.625c-.383 1.29-2.055 1.29-2.438 0l-1.218-4.114a1.249 1.249 0 0 0-1-.748H2.235c-1.32 0-1.874-1.703-.813-2.51l3.499-2.544c.38-.275.56-.75.43-1.19l-1.218-4.114c-.383-1.29 1.045-2.438 2.106-1.624l3.5 2.544c.38.275.87.275 1.25 0l3.499-2.544c1.06-.814 2.489.334 2.106 1.624l-1.218 4.114c-.13.44.05.885.43 1.19l3.499 2.544c1.06.814.506 2.51-.813 2.51h-4.328a1.249 1.249 0 0 0-1-.748l-1.218-4.114z" />
                </svg>
              </button>
            </div>
            <button class="action-btn save-btn" onclick="savePost(this, '${postId}')" aria-label="Save">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                  <path d="M5 2h14a1 1 0 0 1 1 1v19.143a.5.5 0 0 1-.766.424L12 18.03l-7.234 4.536A.5.5 0 0 1 4 22.143V3a1 1 0 0 1 1-1z" />
              </svg>
            </button>
          </div>
        `;

        postContainer.appendChild(postCard);
      });
    },
    (error) => {
      console.error("Error fetching posts:", error);
    }
  );
}






function searchPosts() {
  const searchTerm = searchInput.value.toLowerCase();

  if (!searchResults || !postContainer) return;
  searchResults.innerHTML = "";
  searchResults.classList.remove("active");

  if (searchTerm) {
    const allPosts = postContainer.getElementsByClassName("post-card");
    let found = false;

    Array.from(allPosts).forEach((post) => {
      const name =
        post.querySelector(".profile")?.textContent.toLowerCase() || "";
      const content =
        post.querySelector(".content")?.textContent.toLowerCase() || "";
      if (name.includes(searchTerm) || content.includes(searchTerm)) {
        found = true;
        const clone = post.cloneNode(true);
        searchResults.appendChild(clone);
      }
    });

    if (found) {
      searchResults.classList.add("active");
    }
  }
}

// ===================================================================
//  END OF FUNCTIONS
// ===================================================================

// --- Initialize Firebase ---
// This block runs immediately. Now it can safely call listenForPosts().
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  postsRef = collection(db, "posts");
  console.log("Firebase initialized successfully");
  listenForPosts(); // This will now work correctly
} catch (error) {
  console.error("Firebase initialization failed:", error);
  alert(
    "Could not connect to the database. Please check the console for errors."
  );
}

// --- Event Listeners ---
suggestionForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name")?.value.trim();
  const suggestion = document.getElementById("suggestion")?.value.trim();
  const socialLink = document.getElementById("social-link")?.value.trim();

  if (name && suggestion && socialLink && /^https?:\/\//.test(socialLink)) {
    try {
      await addDoc(postsRef, {
        name: name,
        suggestion: suggestion,
        socialLink: socialLink,
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
    alert(
      "Please fill in all fields. The URL must start with http:// or https://"
    );
  }
});

searchInput?.addEventListener("keyup", searchPosts);

document
  .querySelector(".search-icon")
  ?.addEventListener("click", () => toggleOverlay(searchOverlay));
document
  .querySelector(".toggle")
  ?.addEventListener("click", () => toggleOverlay(formOverlay));
document
  .querySelector("#search-overlay .close-btn")
  ?.addEventListener("click", () => toggleOverlay(searchOverlay));
document
  .querySelector("#form-overlay .close-btn")
  ?.addEventListener("click", () => toggleOverlay(formOverlay));
