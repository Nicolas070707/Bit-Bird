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

// Flappy Bird implementation with a customizable background, pipes, and bird

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

// Customizable assets
const backgroundImg = new Image();
backgroundImg.src = 'path_to_background_image'; // Replace with your uploaded background image

const birdImg = new Image();
birdImg.src = 'path_to_bird_image.png';

const pipeTopImg = new Image();
pipeTopImg.src = 'path_to_pipe_top_image.png';

const pipeBottomImg = new Image();
pipeBottomImg.src = 'path_to_pipe_bottom_image.png';

const scoreBoxImg = new Image();
scoreBoxImg.src = '/mnt/data/Logo5-1.png.png'; // Replace with the uploaded score box

// Game variables
let bird = { x: 150, y: 200, width: 40, height: 30, gravity: 0.5, lift: -10, velocity: 0 };
let pipes = [];
let pipeInterval = 1500; // Time between pipes in ms
let lastPipeTime = Date.now();
let gameRunning = true;
let score = 0;

// Utility function to check collision
function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Create pipes
function createPipe() {
  const pipeGap = 150;
  const pipeWidth = 60;
  const pipeY = Math.random() * (canvas.height - pipeGap - 200) + 100;
  pipes.push({
    x: canvas.width,
    y: pipeY,
    width: pipeWidth,
    height: canvas.height,
  });
}

// Game loop
function update() {
  if (!gameRunning) return;

  // Bird physics
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (bird.y + bird.height > canvas.height || bird.y < 0) {
    gameRunning = false; // Bird hit the ground or flew too high
  }

  // Pipes logic
  if (Date.now() - lastPipeTime > pipeInterval) {
    createPipe();
    lastPipeTime = Date.now();
  }

  pipes.forEach((pipe, index) => {
    pipe.x -= 2; // Move pipes left

    // Check for collisions
    if (
      isColliding(bird, { x: pipe.x, y: 0, width: pipe.width, height: pipe.y }) ||
      isColliding(
        bird,
        { x: pipe.x, y: pipe.y + 150, width: pipe.width, height: canvas.height }
      )
    ) {
      gameRunning = false;
    }

    // Remove off-screen pipes and update score
    if (pipe.x + pipe.width < 0) {
      pipes.splice(index, 1);
      score++;
    }
  });

  render();

  if (gameRunning) {
    requestAnimationFrame(update);
  }
}

// Draw game
function render() {
  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

  // Draw pipes
  pipes.forEach((pipe) => {
    ctx.drawImage(pipeTopImg, pipe.x, pipe.y - pipeTopImg.height);
    ctx.drawImage(pipeBottomImg, pipe.x, pipe.y + 150);
  });

  // Draw bird
  ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  // Draw score box
  ctx.drawImage(scoreBoxImg, 10, 10, 100, 50);

  // Display score
  ctx.font = '24px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(`Score: ${score}`, 20, 40);
}

// Flap the bird
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    bird.velocity = bird.lift;
  }
});

// Start the game
update();
