// 六道幼兒生活常識題目與對應答案。
const quizItems = [
  { clue: "吃飯前，記得先做什麼？", answer: "把手洗乾淨", icon: "🧼", color: "#71c9a5" },
  { clue: "口渴的時候，喝什麼最好？", answer: "喝一杯白開水", icon: "💧", color: "#60b9e8" },
  { clue: "垃圾應該丟到哪裡？", answer: "丟進垃圾桶", icon: "🗑️", color: "#f1a65b" },
  { clue: "睡覺前，要記得做什麼？", answer: "刷刷牙齒", icon: "🪥", color: "#ed8291" },
  { clue: "下雨出門，帶什麼才不會淋濕？", answer: "帶上小雨傘", icon: "☂️", color: "#9b8be8" },
  { clue: "過馬路時，走哪裡最安全？", answer: "走斑馬線", icon: "🚸", color: "#e6c84e" }
];

// 宣告測驗狀態、題目位置、拖曳位置與慶祝彩帶。
let answerOrder = [];
let placedAnswers = Array(quizItems.length).fill(-1);
let targetCards = [];
let answerCards = [];
let draggingAnswer = -1;
let pointerX = 0;
let pointerY = 0;
let submitted = false;
let score = 0;
let confetti = [];
let submitButton = null;
let isCompact = false;

// 建立全螢幕畫布，隨機排列答案並設定繪圖樣式。
function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("sans-serif");
  textAlign(CENTER, CENTER);
  answerOrder = shuffle([...Array(quizItems.length).keys()]);
  noStroke();
}

// 依畫面大小重新配置所有卡片，並繪製測驗與動畫效果。
function draw() {
  isCompact = width < 720;
  drawBackground();
  layoutCards();
  drawHeader();
  drawTargets();
  drawAnswers();
  drawSubmitButton();
  drawConfetti();
  if (submitted) drawScoreDialog();
}

// 繪製柔和底色、彩色圓點與頁面裝飾。
function drawBackground() {
  background("#fffaf0");
  fill("#f3e6cc");
  for (let x = 24; x < width; x += 42) {
    for (let y = 20; y < height; y += 42) circle(x, y, 2.5);
  }
  fill("#ffe8a8");
  circle(width - 38, 42, 52);
  fill("#d8f1df");
  circle(28, height - 34, 60);
}

// 依桌機或手機尺寸計算六張題卡和六張答案卡的位置。
function layoutCards() {
  targetCards = [];
  answerCards = [];
  const margin = isCompact ? 16 : 36;
  const gap = isCompact ? 10 : 16;
  const headerBottom = isCompact ? 100 : 122;
  const buttonSpace = isCompact ? 62 : 74;
  const answerAreaHeight = constrain(height * (isCompact ? 0.24 : 0.25), isCompact ? 120 : 132, isCompact ? 190 : 210);
  const targetAreaBottom = height - answerAreaHeight - buttonSpace;
  const targetAreaHeight = max(160, targetAreaBottom - headerBottom);

  if (isCompact) {
    const columns = 2;
    const rows = 3;
    const cardWidth = (width - margin * 2 - gap) / columns;
    const cardHeight = (targetAreaHeight - gap * (rows - 1)) / rows;
    quizItems.forEach((item, index) => {
      const col = index % columns;
      const row = floor(index / columns);
      targetCards.push({ x: margin + col * (cardWidth + gap), y: headerBottom + row * (cardHeight + gap), w: cardWidth, h: cardHeight });
    });
    const answerRows = 3;
    const answerHeight = (answerAreaHeight - gap * (answerRows - 1)) / answerRows;
    answerOrder.forEach((itemIndex, index) => {
      const col = index % 2;
      const row = floor(index / 2);
      answerCards.push({ x: margin + col * (cardWidth + gap), y: targetAreaBottom + 10 + row * (answerHeight + gap), w: cardWidth, h: answerHeight, itemIndex });
    });
  } else {
    const columns = 3;
    const cardWidth = (width - margin * 2 - gap * (columns - 1)) / columns;
    const cardHeight = (targetAreaHeight - gap) / 2;
    quizItems.forEach((item, index) => {
      const col = index % columns;
      const row = floor(index / columns);
      targetCards.push({ x: margin + col * (cardWidth + gap), y: headerBottom + row * (cardHeight + gap), w: cardWidth, h: cardHeight });
    });
    const answerWidth = (width - margin * 2 - gap * 2) / 3;
    const answerHeight = (answerAreaHeight - gap) / 2;
    answerOrder.forEach((itemIndex, index) => {
      const col = index % 3;
      const row = floor(index / 3);
      answerCards.push({ x: margin + col * (answerWidth + gap), y: targetAreaBottom + 10 + row * (answerHeight + gap), w: answerWidth, h: answerHeight, itemIndex });
    });
  }
  submitButton = { x: width / 2 - (isCompact ? 104 : 128), y: height - (isCompact ? 48 : 56), w: isCompact ? 208 : 256, h: isCompact ? 42 : 48 };
}

// 繪製標題、簡短提示與答題進度。
function drawHeader() {
  fill("#263d35");
  textStyle(BOLD);
  textSize(isCompact ? 23 : 31);
  text("生活小幫手出動！", width / 2, isCompact ? 31 : 39);
  fill("#718077");
  textStyle(NORMAL);
  textSize(isCompact ? 12 : 15);
  text("把下面的答案，拖到正確的圖案旁邊", width / 2, isCompact ? 65 : 77);
  const count = placedAnswers.filter(answer => answer !== -1).length;
  fill("#fff");
  rect(width / 2 - 48, isCompact ? 79 : 94, 96, 24, 12);
  fill("#577060");
  textSize(12);
  text(`${count} / 6 題完成`, width / 2, isCompact ? 91 : 106);
}

// 繪製六張題目圖卡、會動的 emoji 插圖、題目與答案放置區。
function drawTargets() {
  quizItems.forEach((item, index) => {
    const card = targetCards[index];
    const compactCard = card.h < 100;
    const radius = isCompact ? 15 : 20;
    fill("#ffffff");
    rect(card.x, card.y, card.w, card.h, radius);
    fill(item.color);
    circle(card.x + (isCompact ? 25 : 34), card.y + (compactCard ? 24 : 34), compactCard ? 34 : 48);
    push();
    translate(card.x + (isCompact ? 25 : 34), card.y + (compactCard ? 24 : 34) + sin(frameCount * 0.07 + index) * 3);
    rotate(sin(frameCount * 0.045 + index) * 0.08);
    textSize(compactCard ? 22 : 31);
    text(item.icon, 0, 0);
    pop();
    fill("#35473d");
    textStyle(BOLD);
    textSize(isCompact ? (compactCard ? 10 : 11) : 15);
    textAlign(LEFT, CENTER);
    const clueX = card.x + (isCompact ? 48 : 70);
    const clueY = card.y + (compactCard ? 23 : 32);
    text(item.clue, clueX, clueY, card.w - (isCompact ? 56 : 82), compactCard ? 32 : 40);
    textAlign(CENTER, CENTER);
    const dropHeight = compactCard ? 25 : 34;
    const dropY = card.y + card.h - dropHeight - (compactCard ? 6 : 10);
    const dropX = card.x + (isCompact ? 9 : 16);
    const dropWidth = card.w - (isCompact ? 18 : 32);
    const answerIndex = placedAnswers[index];
    fill(answerIndex === -1 ? "#f4f6f1" : "#e6f5e9");
    stroke(answerIndex === -1 ? "#c5d2c8" : "#80b98d");
    strokeWeight(1.5);
    drawingContext.setLineDash(answerIndex === -1 ? [5, 4] : []);
    rect(dropX, dropY, dropWidth, dropHeight, 9);
    drawingContext.setLineDash([]);
    noStroke();
    fill(answerIndex === -1 ? "#92a097" : "#355f41");
    textStyle(answerIndex === -1 ? NORMAL : BOLD);
    textSize(isCompact ? 11 : 14);
    text(answerIndex === -1 ? "把答案放這裡" : quizItems[answerIndex].answer, dropX + 4, dropY + 2, dropWidth - 8, dropHeight - 4);
  });
}

// 繪製下方六個可以拖曳的文字答案。
function drawAnswers() {
  answerCards.forEach((card, index) => {
    const isDragging = draggingAnswer === card.itemIndex;
    const isUsed = placedAnswers.includes(card.itemIndex);
    const lift = isDragging ? 5 : 0;
    fill(isDragging ? "#354f43" : isUsed ? "#e5eee6" : "#fff" );
    rect(card.x, card.y - lift, card.w, card.h, isCompact ? 12 : 15);
    if (!isUsed || isDragging) {
      fill(isDragging ? "#fff" : "#385346");
      textStyle(BOLD);
      textSize(isCompact ? 12 : 16);
      text(quizItems[card.itemIndex].answer, card.x + 8, card.y - lift + 2, card.w - 16, card.h - 4);
    } else {
      fill("#829187");
      textStyle(NORMAL);
      textSize(isCompact ? 11 : 14);
      text("已放置 ✓", card.x + 6, card.y + 2, card.w - 12, card.h - 4);
    }
  });
  if (draggingAnswer !== -1) {
    fill("#354f43");
    rect(pointerX - 78, pointerY - 22, 156, 44, 14);
    fill("#fff");
    textStyle(BOLD);
    textSize(14);
    text(quizItems[draggingAnswer].answer, pointerX, pointerY, 144, 38);
  }
}

// 只在六題都放好答案時顯示可以交卷的按鈕。
function drawSubmitButton() {
  const complete = placedAnswers.every(answer => answer !== -1);
  const label = submitted ? "再玩一次" : complete ? "交卷看成績" : "先完成六個配對";
  fill(complete || submitted ? "#e87958" : "#d7ddd7");
  rect(submitButton.x, submitButton.y, submitButton.w, submitButton.h, 15);
  fill(complete || submitted ? "#fff" : "#849087");
  textStyle(BOLD);
  textSize(isCompact ? 15 : 17);
  text(label, width / 2, submitButton.y + submitButton.h / 2);
}

// 計算分數並顯示成績對話框與重新作答按鈕。
function drawScoreDialog() {
  fill(28, 39, 32, 115);
  rect(0, 0, width, height);
  const boxWidth = min(width - 36, 390);
  const boxHeight = 250;
  const boxX = (width - boxWidth) / 2;
  const boxY = (height - boxHeight) / 2;
  fill("#fffdf7");
  rect(boxX, boxY, boxWidth, boxHeight, 24);
  fill("#385346");
  textStyle(BOLD);
  textSize(23);
  text(score >= 5 ? "太棒了！生活小達人" : "完成挑戰！", width / 2, boxY + 43);
  fill("#e87958");
  textSize(48);
  text(`${score} / 6`, width / 2, boxY + 105);
  fill("#66766b");
  textStyle(NORMAL);
  textSize(15);
  text(`答對 ${round(score / quizItems.length * 100)}%`, width / 2, boxY + 151);
  fill("#e87958");
  rect(width / 2 - 84, boxY + 183, 168, 42, 13);
  fill("#fff");
  textStyle(BOLD);
  textSize(15);
  text("再玩一次", width / 2, boxY + 204);
}

// 成績達到五題以上時建立彩帶粒子並持續更新它們。
function startConfetti() {
  confetti = [];
  for (let index = 0; index < 150; index++) {
    confetti.push({ x: random(width), y: random(-height, 0), speed: random(2, 6), drift: random(-1.5, 1.5), size: random(5, 10), angle: random(TWO_PI), spin: random(-0.12, 0.12), color: random(["#e87958", "#e9c84a", "#68b98b", "#60b9e8", "#9b8be8"]) });
  }
}

// 繪製飄落並旋轉的彩帶粒子。
function drawConfetti() {
  if (score < 5) return;
  confetti.forEach(piece => {
    piece.y += piece.speed;
    piece.x += piece.drift + sin(frameCount * 0.03 + piece.angle) * 0.8;
    piece.angle += piece.spin;
    if (piece.y > height + 12) piece.y = random(-80, -10);
    push();
    translate(piece.x, piece.y);
    rotate(piece.angle);
    fill(piece.color);
    rect(0, 0, piece.size, piece.size * 0.55, 2);
    pop();
  });
}

// 確認游標位於指定矩形內。
function isInside(x, y, rectData) {
  return x >= rectData.x && x <= rectData.x + rectData.w && y >= rectData.y && y <= rectData.y + rectData.h;
}

// 按下答案卡時開始拖曳，或處理成績視窗中的重新開始。
function mousePressed() {
  pointerX = mouseX;
  pointerY = mouseY;
  if (submitted) {
    const boxY = (height - 250) / 2;
    if (mouseY >= boxY + 175 && mouseY <= boxY + 235) resetQuiz();
    return false;
  }
  if (placedAnswers.every(answer => answer !== -1) && isInside(mouseX, mouseY, submitButton)) {
    submitQuiz();
    return false;
  }
  for (const card of answerCards) {
    if (isInside(mouseX, mouseY, card)) {
      draggingAnswer = card.itemIndex;
      return false;
    }
  }
  return false;
}

// 更新拖曳答案的位置，供畫面即時跟隨手指或滑鼠。
function mouseDragged() {
  pointerX = mouseX;
  pointerY = mouseY;
  return false;
}

// 放開答案時放入目標卡，並避免同一答案重複使用。
function mouseReleased() {
  if (draggingAnswer === -1) return false;
  for (let index = 0; index < targetCards.length; index++) {
    if (isInside(mouseX, mouseY, targetCards[index])) {
      placedAnswers = placedAnswers.map(answer => answer === draggingAnswer ? -1 : answer);
      placedAnswers[index] = draggingAnswer;
      break;
    }
  }
  draggingAnswer = -1;
  return false;
}

// 交卷時計算答對題數並在高分時啟動彩帶。
function submitQuiz() {
  score = placedAnswers.reduce((total, answer, index) => total + (answer === index ? 1 : 0), 0);
  submitted = true;
  if (score >= 5) startConfetti();
}

// 清除上一輪答案、重新洗牌並開始新的一輪測驗。
function resetQuiz() {
  placedAnswers = Array(quizItems.length).fill(-1);
  answerOrder = shuffle([...Array(quizItems.length).keys()]);
  submitted = false;
  score = 0;
  confetti = [];
}

// 視窗尺寸改變時同步調整全螢幕畫布。
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
