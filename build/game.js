// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 飞机设置
const planeWidth = 50;
const planeHeight = 50;
let planeX = canvas.width / 2 - planeWidth / 2;
let planeY = canvas.height - planeHeight - 10;
const planeSpeed = 5;

// 子弹设置
const bulletWidth = 10;
const bulletHeight = 20;
let bulletSpeed = 4;
let bullets = [];

// 敌机设置
const enemyWidth = 50;
const enemyHeight = 50;
let enemySpeed = 2;
let enemyDiagonalSpeed = 1;
let enemies = [];

// 游戏状态和时间控制
let gameOver = false;
let score = 0;
let gameStartTime = 0;
let currentTime = 0;

// 加载资源图片
const playerImage = new Image();
playerImage.src = '../assets/player-plane.png';
const enemyImage = new Image();
enemyImage.src = '../assets/enemy.png';
const enemy1Image = new Image();
enemy1Image.src = '../assets/enemy02.png';
const enemy2Image = new Image();
enemy2Image.src = '../assets/enemy01.png';
const enemy3Image = new Image();
enemy3Image.src = '../assets/enemy03.png';
const bulletImage = new Image();
bulletImage.src = '../assets/bullet01.png';

// 背景图片
const background1 = new Image();
background1.src = '../assets/background03.jpg';
const background2 = new Image();
background2.src = '../assets/background02.jpg';
const background3 = new Image();
background3.src = '../assets/background04.jpg';

// 获取按钮和显示区域
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');
const exitButton = document.getElementById('exitButton');
const scoreElement = document.getElementById('score');

// 监听键盘事件控制飞机移动
let leftPressed = false;
let rightPressed = false;

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    leftPressed = true;
  } else if (e.key === 'ArrowRight') {
    rightPressed = true;
  } else if (e.key === ' ') {
    shootBullet();
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') {
    leftPressed = false;
  } else if (e.key === 'ArrowRight') {
    rightPressed = false;
  }
});

// 获取当前背景图片
function getCurrentBackground() {
  if (score >= 30) return background3;
  if (score >= 10) return background2;
  return background1;
}

// 获取敌机类型和速度
function getEnemyTypeAndSpeed() {
  let image = enemyImage;
  let speedMultiplier = 1;

  if (score >= 45) {
    const random = Math.random();
    if (random < 0.4) {
      image = enemy3Image;
      speedMultiplier = 2.0;
    } else if (random < 0.7) {
      image = enemy2Image;
      speedMultiplier = 1.5;
    } else if (random < 0.9) {
      image = enemy1Image;
      speedMultiplier = 1.2;
    }
  } else if (score >= 25) {
    const random = Math.random();
    if (random < 0.5) {
      image = enemy2Image;
      speedMultiplier = 1.5;
    } else if (random < 0.8) {
      image = enemy1Image;
      speedMultiplier = 1.2;
    }
  } else if (score >= 10) {
    if (Math.random() < 0.6) {
      image = enemy1Image;
      speedMultiplier = 1.2;
    }
  }

  return { image, speedMultiplier };
}

// 更新游戏参数
function updateGameParameters() {
  const elapsedSeconds = (currentTime - gameStartTime) / 1000;

  if (elapsedSeconds >= 3) {
    const timeMultiplier = 1 + (elapsedSeconds - 3) * 0.05;
    enemySpeed = 2 * timeMultiplier;
    enemyDiagonalSpeed = 1 * timeMultiplier;
    bulletSpeed = 4 * timeMultiplier / 1.2;
  }
}

// 绘制飞机图片
function drawPlaneImage(x, y, image) {
  ctx.drawImage(image, x, y, planeWidth, planeHeight);
}

// 绘制子弹图片
function drawBulletImage(x, y) {
  ctx.drawImage(bulletImage, x, y, bulletWidth, bulletHeight);
}

// 创建子弹
function shootBullet() {
  if (!gameOver) {
    bullets.push({
      x: planeX + planeWidth / 2 - bulletWidth / 2,
      y: planeY,
    });
  }
}

// 创建敌机
function createEnemy() {
  if (!gameOver) {
    const elapsedSeconds = (currentTime - gameStartTime) / 1000;
    const enemyX = Math.random() * (canvas.width - enemyWidth);

    const allowDiagonal = elapsedSeconds >= 5;
    const movementType = allowDiagonal && Math.random() < 0.3 ? 'diagonal' : 'straight';
    const direction = Math.random() < 0.5 ? 'left' : 'right';

    const { image, speedMultiplier } = getEnemyTypeAndSpeed();

    enemies.push({
      x: enemyX,
      y: -enemyHeight,
      movementType: movementType,
      direction: direction,
      image: image,
      speedMultiplier: speedMultiplier
    });
  }
}

// 更新游戏状态
function updateGame(timestamp) {
  if (!gameStartTime) {
    gameStartTime = timestamp;
  }
  currentTime = timestamp;

  if (gameOver) return;

  // 更新游戏参数
  updateGameParameters();

  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制背景
  const currentBackground = getCurrentBackground();
  ctx.drawImage(currentBackground, 0, 0, canvas.width, canvas.height);

  // 处理飞机移动
  if (leftPressed && planeX > 0) {
    planeX -= planeSpeed;
  }
  if (rightPressed && planeX < canvas.width - planeWidth) {
    planeX += planeSpeed;
  }

  // 画玩家飞机
  drawPlaneImage(planeX, planeY, playerImage);

  // 处理子弹移动和绘制
  for (let i = 0; i < bullets.length; i++) {
    let bullet = bullets[i];
    bullet.y -= bulletSpeed;
    drawBulletImage(bullet.x, bullet.y);
    if (bullet.y < 0) {
      bullets.splice(i, 1);
      i--;
    }
  }

  // 生成敌机
  if (Math.random() < 0.02) {
    createEnemy();
  }

  // 处理敌机移动和碰撞
  for (let i = 0; i < enemies.length; i++) {
    let enemy = enemies[i];

    // 更新敌机位置，使用speedMultiplier调整速度
    enemy.y += enemySpeed * enemy.speedMultiplier;

    // 处理斜向移动
    if (enemy.movementType === 'diagonal') {
      if (enemy.direction === 'left') {
        enemy.x -= enemyDiagonalSpeed * enemy.speedMultiplier;
        if (enemy.x <= 0) {
          enemy.direction = 'right';
        }
      } else {
        enemy.x += enemyDiagonalSpeed * enemy.speedMultiplier;
        if (enemy.x >= canvas.width - enemyWidth) {
          enemy.direction = 'left';
        }
      }
    }

    drawPlaneImage(enemy.x, enemy.y, enemy.image);

    // 检测碰撞
    if (enemy.y + enemyHeight > planeY && enemy.x < planeX + planeWidth && enemy.x + enemyWidth > planeX) {
      gameOver = true;
      endGame();
      break;
    }

    // 检测子弹碰撞
    for (let j = 0; j < bullets.length; j++) {
      let bullet = bullets[j];
      if (bullet.x < enemy.x + enemyWidth && bullet.x + bulletWidth > enemy.x &&
        bullet.y < enemy.y + enemyHeight && bullet.y + bulletHeight > enemy.y) {
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        score++;
        updateScore();
        i--;
        break;
      }
    }

    // 敌机超出屏幕
    if (enemy.y > canvas.height) {
      enemies.splice(i, 1);
      i--;
    }
  }

  // 更新子弹和敌机
  requestAnimationFrame(updateGame);
}

// 更新分数显示
function updateScore() {
  scoreElement.textContent = `得分: ${score}`;
}

// 结束游戏
function endGame() {
  finalScoreElement.textContent = score;
  gameOverScreen.style.display = 'block';
}

// 重新开始游戏
restartButton.addEventListener('click', () => {
  gameOver = false;
  score = 0;
  enemies = [];
  bullets = [];
  planeX = canvas.width / 2 - planeWidth / 2;
  planeY = canvas.height - planeHeight - 10;
  gameStartTime = 0;
  currentTime = 0;
  enemySpeed = 2;
  enemyDiagonalSpeed = 1;
  bulletSpeed = 4;
  gameOverScreen.style.display = 'none';
  updateScore();
  requestAnimationFrame(updateGame);
});

// 结束游戏
exitButton.addEventListener('click', () => {
  window.close();
});

// 初始化游戏
requestAnimationFrame(updateGame);