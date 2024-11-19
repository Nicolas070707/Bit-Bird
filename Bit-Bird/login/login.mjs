import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

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




// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Funktion für die Benutzerüberprüfung
async function checkLogin(username, password) {
  const userRef = ref(database, "users/" + username);

  // Benutzerinformationen aus Firebase abrufen
  const snapshot = await get(userRef);
  if (!snapshot.exists()) {
    alert("Benutzername existiert nicht!");
    return false;
  }

  const userData = snapshot.val();

  // Passwort prüfen
  if (userData.password === password) {
    return true;
  } else {
    alert("Falsches Passwort!");
    return false;
  }
}

// Event-Listener für das Login-Formular
document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!username || !password) {
    alert("Bitte alle Felder ausfüllen!");
    return;
  }

  const loginSuccessful = await checkLogin(username, password);

  if (loginSuccessful) {
    window.location.href = "../index.html";
  }
});
