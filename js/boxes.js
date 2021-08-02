"use strict";

function createBox(board, currI, currJ) {
  var box = {
    location: {
      i: currI,
      j: currJ,
    },
  };
  gBoxes.push(box.location);
  board[box.location.i][box.location.j].gameElement = BOX;
}

function createBoxes(board) {
  if (gIsManual) return;
  gBoxes = [];
  createBox(board, 2, 3);
  createBox(board, 3, 4);
  createBox(board, 4, 4);
  createBox(board, 6, 1);
  createBox(board, 6, 2);
  createBox(board, 6, 4);
  createBox(board, 6, 5);
}

function moveBox(i, j) {
  var boxIdx = getBoxIdx({ i: i, j: j });
  var nextBox = { type: FLOOR, gameElement: null };

  nextBox.type = gBoard[i + (i - gGamerPos.i)][j + (j - gGamerPos.j)].type;
  nextBox.gameElement =
    gBoard[i + (i - gGamerPos.i)][j + (j - gGamerPos.j)].gameElement;

  if (gMagnet && nextBox.type === WALL) {
    gBoxes.splice(boxIdx, 1);
    gMagnet = false;
    return false;
  }
  if (
    nextBox.gameElement === GOLD ||
    nextBox.gameElement === MAGNET ||
    nextBox.gameElement === CLOCK ||
    nextBox.type === WALL ||
    nextBox.gameElement === BOX
  )
    return true;

  nextBox.i = i + (i - gGamerPos.i);
  nextBox.j = j + (j - gGamerPos.j);
  if (gBoard[nextBox.i][nextBox.j].type === WATER) {
    slideBox(nextBox, i, j);
  }
  gBoxes.splice(boxIdx, 1, { i: nextBox.i, j: nextBox.j });

  gBoard[nextBox.i][nextBox.j].gameElement = BOX;

  renderCell({ i: nextBox.i, j: nextBox.j }, BOX_IMG);
}

function slideBox(nextBox, i, j) {
  setInterval(function () {
    if (gBoard[nextBox.i][nextBox.j].type === WALL) {
      return;
    } else {
      gBoard[nextBox.i][nextBox.j].gameElement = BOX;

      renderCell({ i: nextBox.i, j: nextBox.j }, BOX_IMG);

      gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;

      renderCell(gGamerPos, "");

      gGamerPos.i = i;
      gGamerPos.j = j;
      gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

      renderCell(gGamerPos, GAMER_IMG);
    }
    gSteps++;
    gElSteps.innerHTML = gSteps;
    i = nextBox.i;
    j = nextBox.j;
    nextBox.i += i - gGamerPos.i;
    nextBox.j += j - gGamerPos.j;
  }, 100);
}
