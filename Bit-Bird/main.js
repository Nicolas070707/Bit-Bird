import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
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
  // Login-Formular
  document
    .getElementById("login-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      if (!email || !password) {
        alert("Bitte alle Felder ausfüllen!");
        return;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        const userRef = ref(database, "users/" + user.uid);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const userData = snapshot.val();
          console.log("Benutzerdaten:", userData);

          showMessage("Login successful", "success"); 
          setTimeout(() => {
            window.location.href = "./game.html"; 
          }, 3000);
        } else {
          showMessage("Benutzer existiert nicht in der Datenbank.", "error"); 
        }
      } catch (error) {
        showMessage("Wrong e-mail or password", "error"); 
      }

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
});
