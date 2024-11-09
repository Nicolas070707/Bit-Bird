// Hole das Canvas-Element und setze den 2D-Kontext
var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

// Block-Eigenschaften
var block = {
    x: 50,  // Startposition X
    y: 50,  // Startposition Y
    size: 30, // Größe des Blocks
    speed: 5, // Geschwindigkeit der Bewegung
    velocityY: 0, // Vertikale Geschwindigkeit
    gravity: 0.2, // Stärke der Gravitation
    jumpStrength: -5 // Sprungstärke
};

var isGameOver = false; // Game Over Status

// Erstelle den Restart-Button
var restartButton = document.createElement('button');
restartButton.innerHTML = 'Restart';
restartButton.style.position = 'absolute';
restartButton.style.top = '60%';
restartButton.style.left = '50%';
restartButton.style.transform = 'translate(-50%, -50%)';
restartButton.style.padding = '10px 20px';
restartButton.style.fontSize = '16px';
restartButton.style.display = 'none'; // Startet als unsichtbar
document.body.appendChild(restartButton);

// Erstelle den Highscore-Button
var highscoreButton = document.createElement('button'); // Korrektur der Variablenname
highscoreButton.innerHTML = 'Share Highscore';
highscoreButton.style.position = 'absolute';
highscoreButton.style.top = '70%';  // Position leicht nach unten verschieben
highscoreButton.style.left = '50%';
highscoreButton.style.transform = 'translate(-50%, -50%)';
highscoreButton.style.padding = '10px 20px';
highscoreButton.style.fontSize = '16px';
highscoreButton.style.display = 'none'; // Startet als unsichtbar
document.body.appendChild(highscoreButton);

// Zeichne den Block
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Lösche das Canvas, um das Bild zu aktualisieren

    // Wenn das Spiel vorbei ist, zeige die Game Over Nachricht und den Restart-Button
    if (isGameOver) {
        displayGameOver();
        return;
    }

    // Zeichne den Block
    ctx.fillStyle = 'blue';
    ctx.fillRect(block.x, block.y, block.size, block.size);
}

// Bewege den Block basierend auf den Tasten
function moveBlock(event) {
    if (isGameOver) return; // Blockiere Eingaben, wenn das Spiel vorbei ist

    if (event.key === ' ') {  // Leertaste für den Sprung
        block.velocityY = block.jumpStrength;
    }
    if (event.key === 'ArrowLeft') {
        block.x -= block.speed;
    }
    if (event.key === 'ArrowRight') {
        block.x += block.speed;
    }
}

// Kollisionsüberprüfung zwischen Block und Bildschirmrändern
function checkCollision() {
    // Prüfe, ob der Block den unteren Rand erreicht (Game Over)
    if (block.y + block.size > canvas.height) {
        isGameOver = true;
    }
}

// Game Over Nachricht anzeigen
function displayGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvas leeren
    ctx.fillStyle = 'Red'; // Textfarbe
    ctx.font = '30px Arial'; // Schriftart und -größe
    ctx.textAlign = 'center'; // Zentrierter Text
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2); // Nachricht

    // Zeige den Restart-Button
    restartButton.style.display = 'block';
    // Zeige den Highscore-Button
    highscoreButton.style.display = 'block';
}

// Restart-Button Funktionalität
restartButton.addEventListener('click', function() {
    isGameOver = false; // Spiel auf aktiv setzen
    block.x = 50; // Zurücksetzen der Blockposition
    block.y = 50;
    block.velocityY = 0; // Geschwindigkeit zurücksetzen
    restartButton.style.display = 'none'; // Button ausblenden
    highscoreButton.style.display = 'none'; // Highscore-Button ausblenden
    update(); // Starten des Spiels
});

// Update- und Schwerkraft-Logik
function update() {
    if (isGameOver) return; // Stoppe das Update, wenn das Spiel vorbei ist

    // Schwerkraft zur vertikalen Geschwindigkeit hinzufügen
    block.velocityY += block.gravity;
    block.y += block.velocityY;

    checkCollision(); // Prüfe Kollision mit den Rändern
    draw(); // Zeichne das Canvas neu
    requestAnimationFrame(update); // Loop
}

// Event Listener für Tastatur-Input
window.addEventListener('keydown', moveBlock);

// Start der Animation
update();
