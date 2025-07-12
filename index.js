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
        const postCard = document.createElement("div");
        
        postCard.className = "post-card";
        postCard.innerHTML = `
                <div class="profile" onclick="window.open('${
                  post.socialLink || "#"
                }', '_blank')">${post.name || "Unknown"}</div>
                <div class="content">${post.suggestion || ""}</div>
                <div class="empty"></div>
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
