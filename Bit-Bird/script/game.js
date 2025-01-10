import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

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
const db = getDatabase(app);
const auth = getAuth(app);

var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var block = {
  x: 50,
  y: canvas.height - 290,
  size: 30,
  speed: 5,
  velocityY: 0,
  gravity: 0.5,
  jumpStrength: -7,
};

var score = 0;
var isGameOver = false;

var pipes = [];
var pipeWidth = 70;
var pipeGap = 150;
var pipeSpeed = 2;

var restartButton = document.createElement("button");
restartButton.innerHTML = "Restart";
restartButton.style.position = "absolute";
restartButton.style.top = "60%";
restartButton.style.left = "50%";
restartButton.style.transform = "translate(-50%, -50%)";
restartButton.style.padding = "10px 20px";
restartButton.style.fontSize = "16px";
restartButton.style.display = "none";
document.body.appendChild(restartButton);



function drawBlock() {
  ctx.fillStyle = "blue";
  ctx.fillRect(block.x, block.y, block.size, block.size);
}


function drawScore() {
  ctx.fillStyle = "black";
  ctx.font = "40px Arial";
  ctx.fillText(score, 135, 50);
}


function saveHighestScore(userId, newScore) {
  const scoreRef = ref(db, `users/${userId}/score`);  

  get(scoreRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const currentScore = snapshot.val();

        if (newScore > currentScore) {
          set(scoreRef, newScore)
            .then(() => {
              console.log("Neuer Highscore gespeichert!");
            })
            .catch((error) => {
              console.error("Fehler beim Speichern des Highscores:", error);
            });
        } else {
          console.log("Aktueller Highscore ist höher oder gleich. Kein Update erforderlich.");
        }
      } else {
        set(scoreRef, newScore)
          .then(() => {
            console.log("Score erfolgreich zum ersten Mal gespeichert!");
          })
          .catch((error) => {
            console.error("Fehler beim Speichern des Scores:", error);
          });
      }
    })
    .catch((error) => {
      console.error("Fehler beim Abrufen des aktuellen Scores:", error);
    });
}


function displayGameOver(userId) {
  ctx.fillStyle = "Red";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);

  if (userId) {
    console.log(`Game Over! Current score: ${score}. Saving high score for user: ${userId}.`);
    saveHighestScore(userId, score); 
  } else {
    console.log("Kein Benutzer eingeloggt. Highscore wird nicht gespeichert.");
  }

  restartButton.style.display = "block";
  
}

onAuthStateChanged(auth, (user) => {
  let userId = null;

  if (user) {
    userId = user.uid;  
    console.log(`User logged in with userId: ${userId}`);

   
    if (isGameOver) {
      console.log(`Game Over! Current score: ${score}. Saving high score for user: ${userId}.`);
      saveHighestScore(userId, score); 
    }

  } else {
    console.log("No user is logged in.");
  }

 
  if (isGameOver) {
    displayGameOver(userId);
  }
});


function moveBlock(event) {
  if (isGameOver) return;
  if (event.key === " ") {
    block.velocityY = block.jumpStrength;
  }
}

function checkCollision() {
  if (block.y + block.size > canvas.height || block.y < 0) {
    isGameOver = true;
  }

  for (var i = 0; i < pipes.length; i++) {
    var pipe = pipes[i];

    if (block.x < pipe.x + pipeWidth && block.x + block.size > pipe.x) {
      if (block.y < pipe.gapY || block.y + block.size > pipe.gapY + pipeGap) {
        isGameOver = true;
        break;
      }
    }
  }
}

function createPipe() {
  var maxPipeY = canvas.height - pipeGap - 50;
  var gapPosition = Math.floor(Math.random() * maxPipeY) + 25;
  pipes.push({
    x: canvas.width,
    gapY: gapPosition,
    passed: false,
  });
}

function updatePipes() {
  for (var i = 0; i < pipes.length; i++) {
    var pipe = pipes[i];
    pipe.x -= pipeSpeed;

    if (!pipe.passed && pipe.x + pipeWidth < block.x) {
      score++;
      pipe.passed = true;
    }
  }

  if (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
    pipes.shift();
  }

  if (pipes.length < 1 || pipes[pipes.length - 1].x < canvas.width - 200) {
    createPipe();
  }
}

function drawPipes() {
  ctx.fillStyle = "green";
  for (var i = 0; i < pipes.length; i++) {
    var pipe = pipes[i];

    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.gapY);
    ctx.fillRect(pipe.x, pipe.gapY + pipeGap, pipeWidth, canvas.height - pipe.gapY - pipeGap);
  }
}

restartButton.addEventListener("click", function () {
  isGameOver = false;
  block.x = 50;
  block.y = canvas.height - 290;
  block.velocityY = 0;
  pipes = [];
  score = 0;
  restartButton.style.display = "none";
  createPipe();
  updateGame();
});


function updateGame() {
  if (isGameOver) {
    onAuthStateChanged(auth, (user) => {
      let userId = user ? user.uid : null;
      displayGameOver(userId);
    });
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePipes();
  drawPipes();

  block.velocityY += block.gravity;
  block.y += block.velocityY;
  drawBlock();

  drawScore();

  checkCollision();

  requestAnimationFrame(updateGame);
}

window.addEventListener("keydown", moveBlock);

createPipe();
updateGame();
