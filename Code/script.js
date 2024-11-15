// Hole das Canvas-Element und setze den 2D-Kontext
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

// Block-Eigenschaften
var block = {
  x: 50,
  y: canvas.height - 290,
  size: 30,
  speed: 5,
  velocityY: 0,
  gravity: 0.5  ,
  jumpStrength: -7,
};

var score = 0;
var isGameOver = false;

// Röhreneigenschaften
var pipes = [];
var pipeWidth = 70;
var pipeGap = 150;
var pipeSpeed = 2;

// Erstelle den Restart-Button
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

// Erstelle den Highscore-Button
var highscoreButton = document.createElement("button");
highscoreButton.innerHTML = "Share Highscore";
highscoreButton.style.position = "absolute";
highscoreButton.style.top = "70%";
highscoreButton.style.left = "50%";
highscoreButton.style.transform = "translate(-50%, -50%)";
highscoreButton.style.padding = "10px 20px";
highscoreButton.style.fontSize = "16px";
highscoreButton.style.display = "none";
document.body.appendChild(highscoreButton);

// Zeichne den Block
function drawBlock() {
  ctx.fillStyle = "blue";
  ctx.fillRect(block.x, block.y, block.size, block.size);
}

// Zeichne den Score
function drawScore() {
  ctx.fillStyle = "black";
  ctx.font = "40px Arial";
  ctx.fillText(score, 135, 50);
}

// Bewege den Block basierend auf den Tasten
function moveBlock(event) {
  if (isGameOver) return;
  if (event.key === " ") {
    // Leertaste für den Sprung
    block.velocityY = block.jumpStrength;
  }
}

// Kollisionsüberprüfung zwischen Block und Bildschirmrändern und Röhren
function checkCollision() {
  if (block.y + block.size > canvas.height || block.y < 0) {
    isGameOver = true;
  }

  // Kollision mit den Röhren
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

// Erstelle eine neue Röhre mit einer sicheren Lücke
function createPipe() {
  var maxPipeY = canvas.height - pipeGap - 50;
  var gapPosition = Math.floor(Math.random() * maxPipeY) + 25;
  pipes.push({
    x: canvas.width,
    gapY: gapPosition,
    passed: false,
  });
}

// Röhren aktualisieren
function updatePipes() {
  for (var i = 0; i < pipes.length; i++) {
    var pipe = pipes[i];
    pipe.x -= pipeSpeed;

    // Erhöhe die Punktzahl, wenn der Block eine Röhre passiert hat
    if (!pipe.passed && pipe.x + pipeWidth < block.x) {
      score++;
      pipe.passed = true;
    }
  }

  // Entferne Röhren, die den linken Rand des Canvas verlassen haben
  if (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
    pipes.shift();
  }

  // Füge neue Röhren hinzu, wenn nötig
  if (pipes.length < 1 || pipes[pipes.length - 1].x < canvas.width - 200) {
    createPipe();
  }
}

// Röhren zeichnen
function drawPipes() {
  ctx.fillStyle = "green";
  for (var i = 0; i < pipes.length; i++) {
    var pipe = pipes[i];

    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.gapY);

    ctx.fillRect(
      pipe.x,
      pipe.gapY + pipeGap,
      pipeWidth,
      canvas.height - pipe.gapY - pipeGap
    );
  }
}

// Game Over Nachricht anzeigen
function displayGameOver() {
  ctx.fillStyle = "Red";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);

  restartButton.style.display = "block";
  highscoreButton.style.display = "block";
}

// Restart-Button Funktionalität
restartButton.addEventListener("click", function () {
  isGameOver = false;
  block.x = 50;
  block.y = canvas.height - 290;
  block.velocityY = 0;
  pipes = [];
  score = 0;
  restartButton.style.display = "none";
  highscoreButton.style.display = "none";
  createPipe();
  updateGame();
});

// Spiel-Update-Funktion
function updateGame() {
  if (isGameOver) {
    displayGameOver();
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update und Zeichnen der Röhren
  updatePipes();
  drawPipes();

  // Block-Logik
  block.velocityY += block.gravity;
  block.y += block.velocityY;
  drawBlock();

  // Zeichne die Punktzahl
  drawScore();

  checkCollision();

  requestAnimationFrame(updateGame);
}

window.addEventListener("keydown", moveBlock);

createPipe();
updateGame();
