import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

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

//board
let board;
let boardWidth = 288;
let boardHeight = 512;
let context;

//bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
  x: birdX,
  y: birdY,
  width: birdWidth,
  height: birdHeight,
};

//pipes
let pipeArray = [];
let pipeWidth = 64; 
let pipeHeight = 410;
let pipeX = boardWidth;
let pipeY = 0;

let currentUserId = null;

let topPipeImg;
let bottomPipeImg;


let velocityX = -2; 
let velocityY = 0; 
let gravity = 0.4;

let gameOver = false;
let score = 0;

let gameStarted = false;

window.onload = function () {
  board = document.getElementById("board");

  const startScreen = document.getElementById("start-screen");
  const playButton = document.getElementById("play-button");
  const music = document.getElementById('background-music');
  

  playButton.addEventListener("click", () => {
    if (!gameStarted) {
        startScreen.style.display = "none"; // Verstecke den Startbildschirm
        startGame(); // Starte das Spiel
        gameStarted = true;
        music.play();
    }
});

function startGameFromInput() {
  if (!gameStarted) {
      startScreen.style.display = "none"; // Verstecke den Startbildschirm
      startGame();
      gameStarted = true;
      music.play();
  }
}

playButton.addEventListener("click", startGameFromInput);

// Auch Start mit der Leertaste ermöglichen
document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
      startGameFromInput();
  }
});


function resizeCanvas() {
  board.width = boardWidth;
  board.height = boardHeight;
  bird.x = board.width / 8;
  bird.y = board.height / 2;
}

  resizeCanvas(); 
  window.addEventListener("resize", resizeCanvas); 
  
  context = board.getContext("2d");
 
  birdImg = new Image();
  birdImg.src = "../Texturen/BitBird.png";
  birdImg.onload = function () {
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  };

  topPipeImg = new Image();
  topPipeImg.src = "../Texturen/skyscrapertop.png";

  bottomPipeImg = new Image();
  bottomPipeImg.src = "../Texturen/skyscraperbot.png";

  document.addEventListener("keysdown", startGame)

  document.addEventListener("keydown", moveBird);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUserId = user.uid; 
    } else {
      console.log("No user is logged in.");
    }
  });
};

function startGame(){
  gameOver = false;
  score = 0;
  pipeArray = []; // Entferne vorherige Pipes
  bird.y = birdY;
  velocityY = 0;
  
  requestAnimationFrame(update);
  setInterval(placePipes, 1500);
}

function update() {
  requestAnimationFrame(update);
  if (gameOver) {
    saveHighestScore(currentUserId, score);
    return;
  }
  context.clearRect(0, 0, board.width, board.height);


  velocityY += gravity;
  bird.y = Math.max(bird.y + velocityY, 0); 
  context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  if (bird.y > board.height) {
    gameOver = true;
  }

  //pipes
  for (let i = 0; i < pipeArray.length; i++) {
    let pipe = pipeArray[i];
    pipe.x += velocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 0.5; 
      pipe.passed = true;
    }

    if (detectCollision(bird, pipe)) {
      gameOver = true;
    }
  }

  //clear pipes
  while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
    pipeArray.shift(); 
  }

  // Score
  context.fillStyle = "white";
  context.font = "45px sans-serif";

  // Positioniere den Score horizontal in der Mitte der Canvas
  const scoreText = score.toString();
  const scoreWidth = context.measureText(scoreText).width;
  const scoreX = (board.width - scoreWidth) / 2;
  const scoreY = board.height / 4; 
  context.fillText(scoreText, scoreX, scoreY);

  let fadeOpacity = 0; 
  let fadeIn = true; 

  function drawGameOverText() {
    const text = "YOU DIED";
    const textColor = `rgba(255, 0, 0, ${fadeOpacity})`; // Rot mit variabler Deckkraft

    context.clearRect(0, 0, board.width, board.height); // Canvas leeren

    // Hintergrund mit 20 px oben und unten schwarz
    context.fillStyle = "black";
    context.fillRect(0, 0, board.width, 20); 
    context.fillRect(0, board.height - 20, board.width, 20); 
    context.fillRect(0, 20, board.width, board.height - 40); 

    context.font = "50px serif"; 
    context.fillStyle = textColor; 

    // Text zentrieren
    const textWidth = context.measureText(text).width;
    const textX = (board.width - textWidth) / 2;
    const textY = board.height / 2;

    context.fillText(text, textX, textY);

    // Fade-In/Fade-Out Logik
    if (fadeIn) {
      fadeOpacity += 0.01; 
      if (fadeOpacity >= 1) {
        fadeIn = false; 
      }
    } else {
      fadeOpacity -= 0.01;
      if (fadeOpacity <= 0 && !fadeIn) {
        cancelAnimationFrame(drawGameOverText); 
        return; 
      }
    }

    // Wiederhole die Animation
    requestAnimationFrame(drawGameOverText);
  }

  // Aufrufen, wenn das Spiel vorbei ist
  if (gameOver) {
    drawGameOverText();
  }
}

function saveHighestScore(userId, newScore) {
  if (!userId) {
    console.log("No user is logged in. Can't save score.");
    return;
  }

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
          console.log(
            "Aktueller Highscore ist höher oder gleich. Kein Update erforderlich."
          );
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

function placePipes() {
  if (gameOver) {
    return;
  }

  //(0-1) * pipeHeight/2.
  // 0 -> -128 (pipeHeight/4)
  // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
  let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
  let openingSpace = board.height / 4;

  let topPipe = {
    img: topPipeImg,
    x: pipeX,
    y: randomPipeY,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(topPipe);

  let bottomPipe = {
    img: bottomPipeImg,
    x: pipeX,
    y: randomPipeY + pipeHeight + openingSpace,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(bottomPipe);
}

let lastGameOverTime = 0;

function moveBird(e) {
  const restartDelay = 5000;
  let currentTime = new Date().getTime();

  if (gameOver) {
    if (currentTime - lastGameOverTime >= restartDelay) {
      bird.y = birdY;
      pipeArray = [];
      score = 0;
      gameOver = false;
      lastGameOverTime = currentTime; 
    }
  }

  if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
    velocityY = -6;
  }
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width && 
    a.x + a.width > b.x && 
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  ); 
}
