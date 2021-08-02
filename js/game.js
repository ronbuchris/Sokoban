'use strict';
const FLOOR = 'FLOOR';
const WALL = 'WALL';
const BOX = 'BOX';
const TARGET = 'TARGET';
const GAMER = 'GAMER';
const CLOCK = 'CLOCK';
const MAGNET = 'MAGNET';
const GOLD = 'GOLD';
const GLUE = 'GLUE';
const WATER = 'WATER';

const GAMER_IMG = '👩🏽‍🌾';
const BOX_IMG = '📦';
const CLOCK_IMG = '⏱';
const MAGNET_IMG = '🕳';
const GOLD_IMG = '⚱️';
const GLUE_IMG = '🍬';
const WATER_IMG = '💦';

var gElSteps = document.querySelector('.steps span');
var gElScore = document.querySelector('.score span');

var gIsGameOn;
var gGamerPos;
var gTargets = [];
var gBoxes = [];
var gBoard;
var gSteps = 0;
var gScore = 0;
var gCountBoxOnTarget = 0;
var gBonusInterval;
var gClock;
var gClockSteps;
var gMagnet;
var gIsGlue;
var gIsManual = false;
var gWallsCount;
var gTargetsCount;
var gBoxesCount;
var gUndoBoard = [];

function initGame() {
  gGamerPos = { i: 2, j: 2 };
  gBoard = buildBoard();
  createBoxes(gBoard);
  renderBoard();
  initGameFunctions();
}

function initGameFunctions() {
  gIsGameOn = true;
  gIsGlue = false;
  gClock = false;
  gMagnet = false;
  gWallsCount = 0;
  gTargetsCount = 0;
  gBoxesCount = 0;
  gClockSteps = 0;

  gBonusInterval = setInterval(addBonus, 10000);
  gElSteps.innerHTML = gSteps;
}

function renderBoard() {
  var strHTML = '';
  for (var i = 0; i < gBoard.length; i++) {
    strHTML += '<tr>\n';
    for (var j = 0; j < gBoard[0].length; j++) {
      var currCell = gBoard[i][j];

      var cellClass = getClassName({ i: i, j: j });

      // DONE - change to short if statement
      if (currCell.type === FLOOR) cellClass += ' floor';
      if (currCell.type === WALL) cellClass += ' wall';
      if (currCell.type === TARGET) cellClass += ' target';
      if (currCell.type === WATER) cellClass += ' water';

      //DONE - Change To template string
      strHTML += `\t<td class="cell ${cellClass}" onclick="moveTo(${i},${j})">\n`;

      // DONE - change to switch case statement
      switch (currCell.gameElement) {
        case GAMER:
          strHTML += GAMER_IMG;
          break;
        case BOX:
          strHTML += BOX_IMG;
          break;
        case GLUE:
          strHTML += GLUE_IMG;
          break;
      }

      strHTML += '\t</td>\n';
    }
    strHTML += '</tr>\n';
  }

  var elBoard = document.querySelector('.board');
  elBoard.innerHTML = strHTML;
}

function buildBoard() {
  var board = createMat(10, 8);

  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var cell = { type: FLOOR, gameElement: null };
      if (!gIsManual) {
        if (
          i === 0 ||
          i === board.length - 1 ||
          j === 0 ||
          j === board[0].length - 1 ||
          (i === 3 && j === 1) ||
          (i === 3 && j === 2) ||
          (i === 4 && j === 2) ||
          (i === 4 && j === 3) ||
          (i === 5 && j === 2)
        ) {
          cell.type = WALL;
        }

        if (
          (i === 2 && j === 1) ||
          (i === 3 && j === 5) ||
          (i === 4 && j === 1) ||
          (i === 5 && j === 4) ||
          (i === 6 && j === 6) ||
          (i === 7 && j === 4) ||
          (i === 6 && j === 3)
        ) {
          cell.type = TARGET;
          gTargets.push({ i: i, j: j });
        }
      }
      if ((i === 7 && j === 3) || (i === 1 && j === 4)) {
        cell.gameElement = GLUE;
      }
      if ((i === 3 && j === 6) || (i === 8 && j === 2)) {
        cell.type = WATER;
      }

      board[i][j] = cell;
    }
  }

  board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

  return board;
}

function moveTo(i, j) {
  if (gIsGlue) return;
  if (!gIsGameOn) return;
  if (gIsManual) {
    userBoard(i, j);
    return;
  }
  var targetCell = gBoard[i][j];
  if (targetCell.type === WALL) return;

  // Calculate distance to make sure we are moving to a neighbor cell
  var iAbsDiff = Math.abs(i - gGamerPos.i);
  var jAbsDiff = Math.abs(j - gGamerPos.j);

  // If the clicked Cell is one of the four allowed
  if (
    (iAbsDiff === 1 && jAbsDiff === 0) ||
    (jAbsDiff === 1 && iAbsDiff === 0)
  ) {
    if (targetCell.gameElement === BOX) {
      var isWallOrBox = moveBox(i, j);
      if (isWallOrBox) return;
      checkGameOver();
    } else if (targetCell.gameElement === CLOCK) {
      gClock = true;
    } else if (targetCell.gameElement === MAGNET) {
      gMagnet = true;
    } else if (targetCell.gameElement === GOLD) {
      gScore += 100;
      gElScore.innerHTML = gScore;
    } else if (targetCell.gameElement === GLUE) {
      gIsGlue = true;
      gSteps += 5;

      setTimeout(function () {
        gIsGlue = false;
      }, 5000);
    }
    // MOVING from current position
    // Model:
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
    // Dom:
    renderCell(gGamerPos, '');

    // MOVING to selected position
    // Model:

    gGamerPos.i = i;
    gGamerPos.j = j;
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
    // DOM:
    renderCell(gGamerPos, GAMER_IMG);
    if (gClock) {
      gClockSteps++;
      if (gClockSteps === 10) {
        gClock = false;
      }
    } else {
      gSteps++;
      gElSteps.innerHTML = gSteps;
    }
  }
  saveUndoBoard();
}

function restartGame() {
  gSteps = 0;
  gElSteps.innerHTML = gSteps;
  gCountBoxOnTarget = 0;
  initGame();
}

function isWin() {
  gIsGameOn = false;
  alert('win');
}

function checkGameOver() {
  for (var i = 0; i < gBoxes.length; i++) {
    var boxLocation = gBoxes[i];
    for (var j = 0; j < gTargets.length; j++) {
      var targetLocation = gTargets[j];
      if (
        boxLocation.i === targetLocation.i &&
        boxLocation.j === targetLocation.j
      ) {
        gCountBoxOnTarget++;
        if (gCountBoxOnTarget === gBoxes.length) isWin();
      }
    }
  }
  gCountBoxOnTarget = 0;
}

function addBonus() {
  if (gIsManual) return;
  if (!gIsGameOn) return;
  var bonus = [CLOCK, MAGNET, GOLD];
  var bonusImg = [CLOCK_IMG, MAGNET_IMG, GOLD_IMG];
  var bonusIdx = getRandomInt(0, bonus.length);
  var currBonus = bonus[bonusIdx];
  var currBonusImg = bonusImg[bonusIdx];
  var emptyCells = getEmptyCells();
  var idx = getRandomInt(0, emptyCells.length);
  var emptyCell = emptyCells[idx];
  //   console.log(emptyCell);
  gBoard[emptyCell.i][emptyCell.j].gameElement = currBonus;
  renderCell(emptyCell, currBonusImg);

  setInterval(function () {
    if (gBoard[emptyCell.i][emptyCell.j].gameElement === GAMER) {
      return;
    } else {
      gBoard[emptyCell.i][emptyCell.j].gameElement = null;
      renderCell(emptyCell, '');
    }
  }, 5000);
}

function getEmptyCells() {
  var emptyCells = [];
  for (var i = 0; i < gBoard.length; i++) {
    var row = gBoard[i];
    for (var j = 0; j < row.length; j++) {
      var cell = row[j];
      if (cell.type !== WALL && !cell.gameElement && cell.type !== TARGET) {
        emptyCells.push({ i: i, j: j });
      }
    }
  }
  //   console.log(emptyCells);

  return emptyCells;
}

function manuallyCreateBoard(elBtn) {
  if (elBtn.innerText === 'manual') {
    elBtn.innerText = 'Play';
    gIsManual = true;
    initGame();
  } else {
    elBtn.innerText = 'manual';
    gIsManual = false;
  }
}

function userBoard(i, j) {
  var elCurrCell = document.querySelector(`.cell-${i}-${j}`);
  if (gWallsCount !== 37 && gBoard[i][j].type !== WALL) {
    gWallsCount++;
    gBoard[i][j].type = WALL;
    elCurrCell.classList.remove('floor');
    elCurrCell.classList.add('wall');
  } else if (gTargetsCount !== 7 && gBoard[i][j].type !== TARGET) {
    gTargetsCount++;
    gBoard[i][j].type = TARGET;
    elCurrCell.classList.remove('floor');
    elCurrCell.classList.add('target');
  } else if (gBoxesCount !== 7 && gBoard[i][j].gameElement !== BOX) {
    gBoxesCount++;
    gBoard[i][j].gameElement = BOX;
    renderCell({ i: i, j: j }, BOX_IMG);
  }
}

function undo() {
  if (!gIsGameOn) return;
  if (gUndoBoard.length === 0) {
    alert('you dont have more undo');
    return;
  }

  var prevBoard = gUndoBoard.pop();
  gBoard = prevBoard.board;
  gGamerPos = prevBoard.gGamerPos;
  gScore = prevBoard.gScore;
  gElScore.innerHTML = gScore;
  gSteps = prevBoard.gSteps;
  gElSteps.innerHTML = gSteps;

  renderBoard();
}

function copyBoard(board) {
  var newBoard = [];
  for (var i = 0; i < board.length; i++) {
    var row = [];
    for (var j = 0; j < board[i].length; j++) {
      var newCell = Object.assign({}, board[i][j]);
      row.push(newCell);
    }
    newBoard.push(row);
  }
  return newBoard;
}

function saveUndoBoard() {
  gUndoBoard.push({
    board: copyBoard(gBoard),
    gGamerPos: { i: gGamerPos.i, j: gGamerPos.j },
    gSteps: gSteps,
    gScore: gScore,
  });
}

function handleKey(event) {
  var i = gGamerPos.i;
  var j = gGamerPos.j;
  switch (event.code) {
    case 'ArrowUp':
      moveTo(i - 1, j);
      break;
    case 'ArrowDown':
      moveTo(i + 1, j);
      break;
    case 'ArrowLeft':
      moveTo(i, j - 1);
      break;
    case 'ArrowRight':
      moveTo(i, j + 1);
      break;
  }
}
