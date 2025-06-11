// DOMContentLoadedで初期化
document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  // パドル
  const paddleHeight = 10;
  const paddleWidth = 75;
  let paddleX = (canvas.width - paddleWidth) / 2;

  const ballRadius = 8;
  let balls = [
    {
      x: canvas.width / 2,
      y: canvas.height - 30,
      dx: 3,
      dy: -3
    }
  ];

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

  // アイテム管理
  let items = [];

  const blockBreakSound = new Audio("soundes/ブロック崩し_ブロック衝突音.mp3");
  const bgm = new Audio("soundes/ブロック崩し_BGM.mp3");
  bgm.loop = true;
  // ゲーム状態
  let isPlaying = false;
  let animationId = null;

  // スコア・ライフ
  let score = 0;
  let lifes = 3;

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
  for (let i = 0; i < balls.length; i++) {
    let ball = balls[i];
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        let b = bricks[c][r];
        if (b.status === 1) {
          // 円と矩形の衝突判定
          let closestX = Math.max(b.x, Math.min(ball.x, b.x + brickWidth));
          let closestY = Math.max(b.y, Math.min(ball.y, b.y + brickHeight));
          let distX = ball.x - closestX;
          let distY = ball.y - closestY;
          let distance = Math.sqrt(distX * distX + distY * distY);

          if (distance < ballRadius) {
            // どの面に当たったかで反射方向を決定
            let overlapLeft = Math.abs((ball.x + ballRadius) - b.x);
            let overlapRight = Math.abs((ball.x - ballRadius) - (b.x + brickWidth));
            let overlapTop = Math.abs((ball.y + ballRadius) - b.y);
            let overlapBottom = Math.abs((ball.y - ballRadius) - (b.y + brickHeight));
            let minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            if (minOverlap === overlapLeft || minOverlap === overlapRight) {
              ball.dx = -ball.dx;
            } else {
              ball.dy = -ball.dy;
            }

            b.status = 0;
            // 効果音再生
            blockBreakSound.currentTime = 0;
            blockBreakSound.play();
            score++;
            // アイテム生成（30%の確率）
            if (Math.random() < 0.3) {
              items.push({
                x: b.x + brickWidth / 2,
                y: b.y + brickHeight / 2,
                radius: 12,
                dy: 3,
                type: "split" // 今回は分裂アイテムのみ
              });
            }
            // Increase ball speed for difficulty
            if (ball.dx > 0) {
              ball.dx += 0.3;
            } else {
              ball.dx -= 0.3;
            }
            if (ball.dy > 0) {
              ball.dy += 0.3;
            } else {
              ball.dy -= 0.3;
            }
            document.getElementById("score").textContent = "Score: " + score;
            if (score === brickRowCount * brickColumnCount) {
              // BGM停止
              bgm.pause();
              bgm.currentTime = 0;
              alert("クリア！おめでとうございます！");
              document.location.reload();
            }
          }
        }
      }
    }
  }
}

function drawBalls() {
  for (let i = 0; i < balls.length; i++) {
    let ball = balls[i];
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffeb3b";
    ctx.fill();
    ctx.closePath();
  }
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

function drawItems() {
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#4caf50";
    ctx.fill();
    ctx.closePath();
    // 落下
    item.y += item.dy;
  }
}

function handleItemCollision() {
  for (let i = items.length - 1; i >= 0; i--) {
    let item = items[i];
    // パドルとアイテムの当たり判定
    if (
      item.y + item.radius >= canvas.height - paddleHeight - 5 &&
      item.x > paddleX &&
      item.x < paddleX + paddleWidth
    ) {
      // アイテム取得時の効果
      if (item.type === "split") {
        // すべてのボールを分裂（同じ速度で逆向きのボールを追加）
        let newBalls = [];
        for (let b = 0; b < balls.length; b++) {
          let ball = balls[b];
          newBalls.push({
            x: ball.x,
            y: ball.y,
            dx: -ball.dx,
            dy: ball.dy
          });
        }
        balls = balls.concat(newBalls);
      }
      items.splice(i, 1);
    } else if (item.y - item.radius > canvas.height) {
      // 画面外に出たアイテムは削除
      items.splice(i, 1);
    }
  }
}

function draw() {
  console.log("draw");
  if (!isPlaying) {
    drawWaiting();
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBalls();
  drawPaddle();
  drawItems();
  collisionDetection();
  handleItemCollision();

  // 各ボールの物理・壁反射・パドル反射・ミス判定
  for (let i = balls.length - 1; i >= 0; i--) {
    let ball = balls[i];
    // 壁反射
    if (ball.x + ball.dx > canvas.width - ballRadius || ball.x + ball.dx < ballRadius) {
      ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ballRadius) {
      ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > canvas.height - ballRadius - paddleHeight - 5) {
      if (ball.x > paddleX && ball.x < paddleX + paddleWidth) {
        ball.dy = -ball.dy;
      } else if (ball.y + ball.dy > canvas.height - ballRadius) {
        balls.splice(i, 1);
        if (balls.length === 0) {
          lifes--;
          document.getElementById("lifes").textContent = "Lifes: " + lifes;
          if (!lifes) {
            // BGM停止
            bgm.pause();
            bgm.currentTime = 0;
            alert("ゲームオーバー");
            document.location.reload();
          } else {
            // 1つだけボールを復活
            balls = [
              {
                x: canvas.width / 2,
                y: canvas.height - 30,
                dx: 3,
                dy: -3
              }
            ];
            paddleX = (canvas.width - paddleWidth) / 2;
          }
        }
        continue;
      }
    }
    // パドル移動
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
      paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
      paddleX -= 7;
    }
    ball.x += ball.dx;
    ball.y += ball.dy;
  }
  requestAnimationFrame(draw);
}


// 初期表示
if (startBtn) startBtn.style.display = "inline-block";
drawWaiting();

function drawWaiting() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "24px Arial";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.fillText("ゲーム開始ボタンを押してください", canvas.width / 2, canvas.height / 2);
  }

  function startGame() {
    console.log("startGame");
    isPlaying = true;
    // BGM再生
    bgm.currentTime = 0;
    bgm.play();
    score = 0;
    lifes = 3;
    balls = [
      {
        x: canvas.width / 2,
        y: canvas.height - 30,
        dx: 3,
        dy: -3
      }
    ];
    paddleX = (canvas.width - paddleWidth) / 2;
    resetBricks();
    document.getElementById("score").textContent = "Score: " + score;
    document.getElementById("lifes").textContent = "Lifes: " + lifes;
    if (startBtn) startBtn.style.display = "none";
    draw();
  }

  // 初期表示
  if (startBtn) startBtn.style.display = "inline-block";
  drawWaiting();
});
