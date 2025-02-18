import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCs0sQ_kO3m5JATqAA-tojCpSElMQnqvlI",
  authDomain: "bit-bird-8d89c.firebaseapp.com",
  databaseURL: "https://bit-bird-8d89c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bit-bird-8d89c",
  storageBucket: "bit-bird-8d89c.firebasestorage.app",
  messagingSenderId: "902957493686",
  appId: "1:902957493686:web:7b085d35862317b78d2517",
  measurementId: "G-EBELKBFYPH"
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
