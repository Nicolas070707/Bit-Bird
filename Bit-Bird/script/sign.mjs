import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
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
  // Registrierungsformular
  document
    .getElementById("signup-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const username = document.getElementById("username").value;

      if (!email || !password || !username) {
        showMessage("Bitte alle Felder ausfüllen!", "error");
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await set(ref(database, "users/" + user.uid), {
          username: username,
          email: email,
        });

        showMessage("Registration successful", "success");

        setTimeout(() => {
          window.location.href = "./login.html";
        }, 3000);
      } catch (error) {
        console.error("Fehler bei der Registrierung:", error);

        if (error.code === "auth/email-already-in-use") {
          showMessage("Email is already in use", "error");
        } else if (error.code === "auth/weak-password") {
          showMessage("Password is too weak", "error");
        } else {
          showMessage("Registration error", "error");
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
