import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

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
const db = getDatabase(app);

function fetchAndDisplayScores() {
  const dbRef = ref(db);

  get(child(dbRef, "users"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const users = snapshot.val();
        let displayContent = "";

       
        const sortedUsers = Object.entries(users).sort(([, a], [, b]) => b.score - a.score);

      
        sortedUsers.forEach(([uid, data], index) => {
          const position = index + 1; 
          const nickname = data.username || uid; 
          displayContent += `<strong>${position}</strong>) <strong>${nickname}</strong> <strong>SCORE:</strong> <strong>${data.score}</strong></p>`;
        });

    
        document.getElementById("score-display").innerHTML = displayContent;
      } else {
        document.getElementById("score-display").innerText = "Keine Benutzer in der Datenbank gefunden.";
      }
    })
    .catch((error) => {
      console.error("Fehler beim Abrufen der Scores:", error);
      document.getElementById("score-display").innerText = "Fehler beim Laden der Scores.";
    });
}


setInterval(fetchAndDisplayScores, 5000);

fetchAndDisplayScores();
