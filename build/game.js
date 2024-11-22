
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
const bulletWidth = 5;
const bulletHeight = 15;
const bulletSpeed = 4;
let bullets = [];

// 敌机设置
const enemyWidth = 50;
const enemyHeight = 50;
const enemySpeed = 2;
let enemies = [];

// 游戏状态
let gameOver = false;
let score = 0;

// 加载玩家和敌机图片
const playerImage = new Image();
playerImage.src = '../assets/player.png'; // 玩家飞机图片路径
const enemyImage = new Image();
enemyImage.src = '../assets/enemy.png'; // 敌方飞机图片路径

// 获取按钮和显示区域
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');
const exitButton = document.getElementById('exitButton');
const scoreElement = document.getElementById('score'); // 得分显示区域

// 监听键盘事件控制飞机移动
let leftPressed = false;
let rightPressed = false;

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    leftPressed = true;
  } else if (e.key === 'ArrowRight') {
    rightPressed = true;
  } else if (e.key === ' ') { // 空格键发射子弹
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

// 绘制飞机图片
function drawPlaneImage(x, y, isPlayer) {
  if (isPlayer) {
    ctx.drawImage(playerImage, x, y, planeWidth, planeHeight); // 玩家飞机
  } else {
    ctx.drawImage(enemyImage, x, y, enemyWidth, enemyHeight); // 敌方飞机
  }
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
    const enemyX = Math.random() * (canvas.width - enemyWidth);
    enemies.push({
      x: enemyX,
      y: -enemyHeight,
    });
  }
}

// 更新游戏状态
function updateGame() {
  if (gameOver) return;

  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 处理飞机移动
  if (leftPressed && planeX > 0) {
    planeX -= planeSpeed;
  }
  if (rightPressed && planeX < canvas.width - planeWidth) {
    planeX += planeSpeed;
  }

  // 画玩家飞机
  drawPlaneImage(planeX, planeY, true);

  // 处理子弹移动
  for (let i = 0; i < bullets.length; i++) {
    let bullet = bullets[i];
    bullet.y -= bulletSpeed;
    ctx.fillStyle = 'red';
    ctx.fillRect(bullet.x, bullet.y, bulletWidth, bulletHeight);
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
    enemy.y += enemySpeed;
    drawPlaneImage(enemy.x, enemy.y, false);

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
        score++; // 每击中一架敌机得分
        updateScore(); // 更新实时得分
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
  gameOverScreen.style.display = 'none';
  updateScore();
  updateGame();
});

// 结束游戏
exitButton.addEventListener('click', () => {
  window.close(); // 关闭当前窗口
});

// 初始化游戏
updateGame();
