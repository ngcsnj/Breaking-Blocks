const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// パドル
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

// ボール
const ballRadius = 8;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 3;
let dy = -3;

// ブロック
const brickRowCount = 5;
const brickColumnCount = 7;
const brickWidth = 55;
const brickHeight = 18;
const brickPadding = 8;
const brickOffsetTop = 30;
const brickOffsetLeft = 20;

// ブロック初期化関数と状態変数
let bricks = [];
function resetBricks() {
  bricks = [];
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }
}
resetBricks();

// ゲーム状態
let isPlaying = false;
let animationId = null;

// スコア・ライフ
let score = 0;
let lives = 3;

// キー操作
let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// スペースキーで開始
document.addEventListener("keydown", function(e) {
  if (!isPlaying && (e.code === "Space" || e.key === " ")) {
    startGame();
  }
});

// ボタンで開始
const startBtn = document.getElementById("startBtn");
if (startBtn) {
  startBtn.addEventListener("click", function() {
    if (!isPlaying) startGame();
  });
}

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status === 1) {
        // 円と矩形の衝突判定
        let closestX = Math.max(b.x, Math.min(x, b.x + brickWidth));
        let closestY = Math.max(b.y, Math.min(y, b.y + brickHeight));
        let distX = x - closestX;
        let distY = y - closestY;
        let distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < ballRadius) {
          // どの面に当たったかで反射方向を決定
          let overlapLeft = Math.abs((x + ballRadius) - b.x);
          let overlapRight = Math.abs((x - ballRadius) - (b.x + brickWidth));
          let overlapTop = Math.abs((y + ballRadius) - b.y);
          let overlapBottom = Math.abs((y - ballRadius) - (b.y + brickHeight));
          let minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

          if (minOverlap === overlapLeft || minOverlap === overlapRight) {
            dx = -dx;
          } else {
            dy = -dy;
          }

          b.status = 0;
          score++;
          document.getElementById("score").textContent = "Score: " + score;
          if (score === brickRowCount * brickColumnCount) {
            alert("クリア！おめでとうございます！");
            document.location.reload();
          }
        }
      }
    }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffeb3b";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight - 5, paddleWidth, paddleHeight);
  ctx.fillStyle = "#00bcd4";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "#e91e63";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();

  // 壁反射
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }
  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius - paddleHeight - 5) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
      lives--;
      document.getElementById("lives").textContent = "Lives: " + lives;
      if (!lives) {
        alert("ゲームオーバー");
        document.location.reload();
      } else {
        x = canvas.width / 2;
        y = canvas.height - 30;
        dx = 3;
        dy = -3;
        paddleX = (canvas.width - paddleWidth) / 2;
      }
    }
  }

  // パドル移動
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  x += dx;
  y += dy;
  requestAnimationFrame(draw);
}

// 初期表示
if (startBtn) startBtn.style.display = "inline-block";
drawWaiting();
