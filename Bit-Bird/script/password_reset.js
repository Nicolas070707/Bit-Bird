import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";

// Firebase-Konfiguration
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
const auth = getAuth(app);

// Event Listener für das Formular
document.addEventListener("DOMContentLoaded", () => {
  const resetForm = document.getElementById("login-form");

  resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailInput = document.getElementById("email").value;

    if (!emailInput) {
      alert("Bitte gib deine E-Mail-Adresse ein!");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, emailInput);
      alert("Falls diese E-Mail existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet.");
      resetForm.reset();
    } catch (error) {
      console.error("Fehler beim Zurücksetzen des Passworts:", error);
      alert("Fehler beim Senden des Links. Bitte überprüfe die eingegebene E-Mail-Adresse oder versuche es später erneut.");
    }
  });
});
