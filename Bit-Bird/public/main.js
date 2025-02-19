import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

// Firebase-Config laden
async function loadFirebaseConfig() {
  const response = await fetch("/config.json");  // Holt die Config
  const firebaseConfig = await response.json();  // Wandelt sie in JSON um
  return firebaseConfig;
}

// Firebase initialisieren, nachdem die Config geladen wurde
loadFirebaseConfig().then((firebaseConfig) => {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const database = getDatabase(app);

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("login-form").addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      if (!email || !password) {
        alert("Bitte alle Felder ausfüllen!");
        return;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userRef = ref(database, "users/" + user.uid);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          console.log("Benutzerdaten:", snapshot.val());

          showMessage("Login erfolgreich!", "success");
          setTimeout(() => {
            window.location.href = "./game.html";
          }, 3000);
        } else {
          showMessage("Benutzer existiert nicht in der Datenbank.", "error");
        }
      } catch (error) {
        showMessage("Falsche E-Mail oder Passwort.", "error");
      }
    });
  });

  function showMessage(message, type) {
    const messageDiv = document.getElementById("error-message");
    messageDiv.style.color = type === "success" ? "green" : "red";
    messageDiv.textContent = message;
    messageDiv.style.display = "block";
    
    setTimeout(() => {
      messageDiv.style.display = "none";
    }, 3000);
  }
});
