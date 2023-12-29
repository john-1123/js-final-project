let player;
let movingObjs = [];
let numOfMovingObjs = 10;
let fixedColors = [];
let targetColor;
let score = 0;
let timer = 90;
let interval = 60;
let gameStarted = false;
let currentLevel = 1;
let count = 3;

function startGame() {
  if (!gameStarted) {
    gameStarted = true;
    setup();
    loop();
  }
}

function stopGame() {
  gameStarted = false;
  noLoop();
}

function preload() {
  backgroundImage = loadImage("assets/bgwithpeople.png");
  player = createSprite(400, 250);
  player.addImage("player", loadImage("assets/asterisk.png"));
  player.scale = 0.5;
}

function setup() {
  createCanvas(800, 500);

  fixedColors = [
    color(255, 0, 0), // 红色
    color(0, 255, 0), // 绿色
    color(0, 0, 255), // 蓝色
    color(255, 255, 0), // 黄色
    color(255, 0, 255), // 洋红
    color(0, 255, 255), // 青色
    color(255, 165, 0), // 橙色
  ];

  // 選擇 Target Color
  targetColor = random(fixedColors);

  // 建立移動物件
  for (let i = 0; i < numOfMovingObjs; i++) {
    movingObjs[i] = createMovingObj();
  }
}

function draw() {
  background("lightyellow");
  image(backgroundImage, 0, 0, 800, 100);

  // 計數轉換 00:00 的格式
  let minutes = Math.floor(timer / 60);
  let seconds = timer % 60;
  let formattedCountdown = nf(minutes, 2) + " : " + nf(seconds, 2);

  if (gameStarted) {
    if (frameCount % interval === 0 && timer > 0) {
      timer--;
      // 根據關卡進行不同的處理
      if (timer === 60) {
        // 第一關結束，進入第二關
        if (score < 3) {
          endGame();
        }
        currentLevel++;
        startLevel(currentLevel);
      } else if (timer === 30) {
        // 第二關結束，進入第三關
        if (score < 10) {
          endGame();
        }
        currentLevel++;
        startLevel(currentLevel);
      } else if (timer === 0) {
        // 遊戲結束
        endGame();
      }
    }

    // 移動 player
    controlPlayer();

    // 檢查超出 canvas
    checkOutbound();

    // 計時顯示
    rect(350, 0, 100, 30, 8, 8, 8, 8);
    textSize(18);
    textAlign(CENTER, CENTER);
    text(formattedCountdown, 400, 15);

    // 目標長框
    fill(targetColor);
    rect(250, 90, 300, 15, 8, 8, 8, 8);

    // 變換倒數顯示
    if (currentLevel > 1) {
      fill(255);
      ellipse(400, 95, 40, 40);
      fill(0);
      text(count, 400, 95);
    }

    text("Score: " + score, 20, 60);

    fill(targetColor);
    rect(20, 80, 30, 30);

    drawSprites();
  }
}

function changeCountdown() {
  if (count > 1) {
    count--;
    setTimeout(changeCountdown, 1000); // 每秒倒數一次
  } else {
    // 倒數結束後執行要做的事情
    count = 3; // 重新設定倒數時間
    setTimeout(changeCountdown, 1000); // 開始下一輪倒數
  }
}

function startLevel(level) {
  if (level === 2) {
    // 第二關，每 3 秒變換一次 target 顏色
    setInterval(changeTargetColor, 3000);
    setTimeout(changeCountdown, 1000);
  } else if (level === 3) {
    // 第三關，整體移動速度變快 2 倍
    for (let obj of movingObjs) {
      let speed = obj.getSpeed();
      obj.setSpeed(speed * 2);
    }
  }
}

function changeTargetColor() {
  targetColor = random(fixedColors);
}

function controlPlayer() {
  if (keyIsDown(LEFT_ARROW)) {
    player.setVelocity(-3, 0);
  } else if (keyIsDown(RIGHT_ARROW)) {
    player.setVelocity(3, 0);
  } else if (keyIsDown(UP_ARROW)) {
    player.setVelocity(0, -3);
  } else if (keyIsDown(DOWN_ARROW)) {
    player.setVelocity(0, 3);
  } else {
    player.setVelocity(0, 0);
  }
}

function createMovingObj() {
  let obj;
  do {
    if (obj !== undefined) {
      obj.remove();
    }
    obj = createSprite(random(width - 20), random(110, height - 20), 30, 30);
  } while (isOverlap(obj, movingObjs));

  // 設定隨機顏色
  //   obj.shapeColor = color(random(255), random(255), random(255));
  let randomColor = random(fixedColors);
  obj.shapeColor = randomColor;

  // 設定隨機縮放
  let scaleFactor = random(0.5, 1);
  obj.width *= scaleFactor;
  obj.height *= scaleFactor;

  // 設定隨機速度
  if (random() > 0.5) {
    obj.setSpeed(random(0.5, 1.5), 180);
  } else {
    obj.setSpeed(random(0.5, 1.5), 0);
  }

  return obj;
}

function isOverlap(sprite, others) {
  for (let other of others) {
    if (sprite.overlap(other)) {
      return true;
    }
  }
  return false;
}

function checkOutbound() {
  for (let i = 0; i < numOfMovingObjs; i++) {
    let obj = movingObjs[i];
    // 檢查是否超出畫布邊界，是的話就移到另一側
    if (obj.position.x >= width) {
      obj.position.x = 0;
    } else if (obj.position.x <= 0) {
      obj.position.x = width;
    }

    // 檢查 player 和 movingObjs 是否碰撞
    if (player.overlap(obj)) {
      if (
        obj.shapeColor.levels[0] === targetColor.levels[0] &&
        obj.shapeColor.levels[1] === targetColor.levels[1] &&
        obj.shapeColor.levels[2] === targetColor.levels[2]
      ) {
        score += 10; // 如果與目標顏色相同，加分
      } else {
        if (score > 0) {
          score -= 5; // 其他顏色，扣分
        }
      }

      obj.remove();
      movingObjs[i] = createMovingObj();
      break;
    }
  }
}

function endGame() {
  stopGame();
  alert("Game Over! Your final score is: " + score);
  location.reload();
}
