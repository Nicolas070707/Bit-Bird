import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  query,
  orderByChild,
  equalTo,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("reset-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value;

      if (!email) {
        showMessage("Please enter your email address", "error");
        return;
      }

      try {
        const usersRef = ref(database, "users");
        const emailQuery = query(usersRef, orderByChild("email"), equalTo(email));
        const snapshot = await get(emailQuery);

        if (!snapshot.exists()) {
          showMessage("Email does not exist in the database.", "error");
          return;
        }

        await sendPasswordResetEmail(auth, email);
        showMessage("Password reset link was sent.", "success");

        setTimeout(() => {
          window.location.href = "./login.html";
        }, 3000);
      } catch (error) {
        console.error("Fehler beim Zurücksetzen des Passworts:", error);

        if (error.code === "auth/user-not-found") {
          showMessage("Diese E-Mail ist nicht registriert.", "error");
        } else if (error.code === "auth/invalid-email") {
          showMessage("Invalid email address", "error");
        } else {
          showMessage("Failed to reset password", "error");
        }
      }
    });

  function showMessage(message, type) {
    const messageDiv = document.getElementById("error-message");

    if (type === "success") {
      messageDiv.style.color = "green";
    } else if (type === "error") {
      messageDiv.style.color = "red";
    }

    messageDiv.textContent = message;
    messageDiv.style.display = "block";
    messageDiv.classList.add("show");

    setTimeout(() => {
      messageDiv.classList.remove("show");
      messageDiv.classList.add("hide");

      setTimeout(() => {
        messageDiv.style.display = "none";
        messageDiv.classList.remove("hide");
      }, 500);
    }, 3000);
  }
});
