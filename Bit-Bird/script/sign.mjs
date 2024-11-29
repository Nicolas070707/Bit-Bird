import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_DATABASE_URL,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Function to write user data
function writeUserData(nickname, password) {
  const reference = ref(db, "users/" + nickname);
  set(reference, {
    username: nickname,
    password: password,
    score: 0
  })
  .then(() => {
    alert("User successfully registered!");
  })
  .catch((error) => {
    console.error("Error writing data:", error);
  });
}

// Handle form submission
document.getElementById("signup-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const nickname = document.getElementById("nickname").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm_password").value;

  if (!nickname || !password || !confirmPassword) {
    alert("Please fill out all fields!");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  writeUserData(nickname, password);
});
