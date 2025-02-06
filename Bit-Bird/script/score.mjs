import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

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
const auth = getAuth(app);

// Fetch and display scores in real-time
const scoresRef = ref(db, "users");

onValue(scoresRef, (snapshot) => {
  if (snapshot.exists()) {
    const users = snapshot.val();
    let displayContent = "<h3>Leaderboard</h3>"; // Überschrift für das Leaderboard

    // Sortiere die Benutzer nach ihrem Score in absteigender Reihenfolge
    const sortedUsers = Object.entries(users).sort(([, a], [, b]) => b.score - a.score);

    // Holen der ersten 4 Einträge
    const topUsers = sortedUsers.slice(0, 4); // Nur die Top 4 Spieler anzeigen

    // Schleife für die Top 4 Spieler
    topUsers.forEach(([uid, data], index) => {
      const position = index + 1; // Ranking
      const nickname = data.username || uid; // Verwende den Benutzernamen oder UID

      // Füge die Spielerinformationen hinzu (ohne Status)
      displayContent += `
        <p> 
          <strong>${position}. ${nickname}</strong> 
          <strong>Score:</strong> <strong>${data.score}</strong>
        </p>`;
    });

    // Aktualisiere die Anzeige des Leaderboards
    document.getElementById("score-display").innerHTML = displayContent;
  } else {
    document.getElementById("score-display").innerText = "Keine Benutzer in der Datenbank gefunden.";
  }
}, (error) => {
  console.error("Fehler beim Abrufen der Scores:", error);
  document.getElementById("score-display").innerText = "Fehler beim Laden der Scores.";
});

// Fetch and display logged-in user data
onAuthStateChanged(auth, (user) => {
  if (user) {
    const userRef = ref(db, `users/${user.uid}`);

    // Holen der Benutzerdaten des eingeloggten Nutzers
    onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();

        // Höchsten Score in der Datenbank holen
        onValue(scoresRef, (snapshot) => {
          if (snapshot.exists()) {
            const users = snapshot.val();
            
            // Sortiere alle Benutzer nach Score
            const sortedUsers = Object.entries(users).sort(([, a], [, b]) => b.score - a.score);

            // Hole die Position des eingeloggten Benutzers
            const userIndex = sortedUsers.findIndex(([uid]) => uid === user.uid);

            // Setze den Status je nach Rang
            let status = "";
            let statusColor = "";
            if (userIndex === 0) {

              status = "GOAT"; // Platz 1 - GOAT
              statusColor = "gold";
            } else if (userIndex === 1) {
              status = "Good"; // Platz 2 - Good
              statusColor = "green";
            } else if (userIndex === 2) {
              status = "Okay"; // Platz 3 - Okay
              statusColor = "grey";
            } else {
              status = "Trash"; // Alles darunter - Trash
            }

            // Den Status des Nutzers zusammen mit anderen Informationen anzeigen
            document.getElementById("player-display").innerHTML = `
              <h3>BitBird-Player</h3>
              <p><strong>Username:</strong> ${userData.username || "Unbekannt"}</p>
              <p><strong>Score:</strong> ${userData.score || 0}</p>
              <p style="color: ${statusColor}"><strong>Status:</strong> ${status}</p>
              <button class="button-52" onclick="window.location.href='../index.html'">Logout</button>
            `;
          } else {
            document.getElementById("player-display").innerText = "Keine Benutzer in der Datenbank gefunden.";
          }
        }, (error) => {
          console.error("Fehler beim Abrufen der Scores:", error);
          document.getElementById("player-display").innerText = "Fehler beim Laden der Scores.";
        });
      } else {
        document.getElementById("player-display").innerText = "Keine Benutzerdaten gefunden.";
      }
    }, (error) => {
      console.error("Fehler beim Abrufen der Benutzerdaten:", error);
      document.getElementById("player-display").innerText = "Fehler beim Laden der Benutzerdaten.";
    });
  } else {
    document.getElementById("player-display").innerText = "Bitte melde dich an.";
  }
});
