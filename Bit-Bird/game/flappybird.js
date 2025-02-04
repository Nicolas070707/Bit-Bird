//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;


let gameStarted = false;


window.onload = function() {
    const startScreen = document.getElementById("start-screen");
    const playButton = document.getElementById("play-button");

    playButton.addEventListener("click", () => {
        if (!gameStarted) {
            startScreen.style.display = "none"; // Verstecke den Startbildschirm
            initializeGame(); // Starte das Spiel
            gameStarted = true;
        }
    });
    
    document.addEventListener("keydown", (event) => {
        if ((event.key === " " || event.code === "Space") && !gameStarted) {
            startScreen.style.display = "none"; // Verstecke den Startbildschirm
            initializeGame(); // Starte das Spiel
            gameStarted = true;
        }
    });
}

function initializeGame() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    birdImg = new Image();
    birdImg.src = "./BitBird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };

    topPipeImg = new Image();
    topPipeImg.src = "./skyscrapertop.png";
    bottomPipeImg = new Image();
    bottomPipeImg.src = "./skyscraperbot.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
    document.addEventListener("keydown", moveBird);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return; // Entferne den Soundaufruf
    }
    context.clearRect(0, 0, board.width, board.height);
    

    //bird
    velocityY += gravity;
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
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
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

   // Score
    context.fillStyle = "white";
    context.font = "45px sans-serif";

    // Positioniere den Score horizontal in der Mitte der Canvas
    const scoreText = score.toString();
    const scoreWidth = context.measureText(scoreText).width;
    const scoreX = (board.width - scoreWidth) / 2;
    const scoreY = board.height / 4; // Vertikal etwa im oberen Drittel
    context.fillText(scoreText, scoreX, scoreY);

    let fadeOpacity = 0; // Start mit vollständiger Transparenz
    let fadeIn = true;   // Steuert das Ein- oder Ausblenden

    function drawGameOverText() {
        const text = "YOU DIED";
        const textColor = `rgba(255, 0, 0, ${fadeOpacity})`; // Rot mit variabler Deckkraft

        context.clearRect(0, 0, board.width, board.height); // Canvas leeren

        // Hintergrund mit 20 px oben und unten schwarz
        context.fillStyle = "black";
        context.fillRect(0, 0, board.width, 20);   // Oben
        context.fillRect(0, board.height - 20, board.width, 20); // Unten
        context.fillRect(0, 20, board.width, board.height - 40);  // Hauptinhalt schwarz

        context.font = "70px serif"; // Schriftart und Größe
        context.fillStyle = textColor; // Dynamische Farbe basierend auf der Deckkraft

        // Text zentrieren
        const textWidth = context.measureText(text).width;
        const textX = (board.width - textWidth) / 2;
        const textY = board.height / 2;

        context.fillText(text, textX, textY);

        // Fade-In/Fade-Out Logik
        if (fadeIn) {
            fadeOpacity += 0.01; // Erhöhe die Deckkraft langsam
            if (fadeOpacity >= 1) {
                fadeIn = false; // Wechsle zu Fade-Out
            }
        } else {
            fadeOpacity -= 0.01; // Verringere die Deckkraft langsam
            if (fadeOpacity <= 0) {
                cancelAnimationFrame(drawGameOverText); // Effekt abschließen
                return; // Animation beenden
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

function placePipes() {
    if (gameOver) {
        return;
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

let lastGameOverTime = 0; // Speichert die Zeit des letzten Spiels, um die 3.5 Sekunden zu messen

function moveBird(e) {
    const restartDelay = 5000; // 5 Sekunden in Millisekunden
    let currentTime = new Date().getTime(); // Zeit in Millisekunden seit dem letzten Spielende

    if (gameOver) {
        if (currentTime - lastGameOverTime >= restartDelay) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
            lastGameOverTime = currentTime; // Aktualisiert die Zeit des letzten Spiels
        }
    }

    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        velocityY = -6;
    }
}


function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}
