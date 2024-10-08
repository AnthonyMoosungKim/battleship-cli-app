const readlineSync = require('readline-sync');

const asciiArt = `
========
__   _______ _   _   _    _ _____ _   _
\\ \\ / /  _  | | | | | |  | |_   _| \\ | |
 \\ V /| | | | | | | | |  | | | | |  \\| |
  \\ / | | | | | | | | |/\\| | | | | . ' |
  | | \\ \\_/ / |_| | \\  /\\  /_| |_| |\\  |
  \\_/  \\___/ \\___/   \\/  \\/ \\___/\\_| \\_|
========`;

function printBoard(board, debug = false) {
  const boardDisplay = {};

  const rows = ["A", "B", "C", "D", "E", "F"];

  for (let row = 0; row < board.length; row++) {
    const displayRow = [];

    for (let col = 0; col < board[row].length; col++) {
      const cell = board[row][col];

      if (debug) {
        if (cell.type === "large") {
          displayRow.push("🔵");
        } else if (cell.type === "small") {
          displayRow.push("🟠");
        } else {
          displayRow.push("❗");
        }
      } else {
        if (cell.hit) {
          if (cell.type === "large") {
            displayRow.push("🔵");
          } else if (cell.type === "small") {
            displayRow.push("🟠");
          } else {
            displayRow.push("❗");
          }
        } else {
          displayRow.push("-");
        }
      }
    }

    boardDisplay[rows[row]] = displayRow;
  }

  console.table(boardDisplay);
}


function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function canPlaceShip(board, row, col, size, orientation) {
  if (orientation === 'horizontal') {
    if (col + size > board[0].length) return false;
    for (let i = 0; i < size; i++) {
      if (board[row][col + i].type !== 'empty') return false;
    }
  } else {
    if (row + size > board.length) return false;
    for (let i = 0; i < size; i++) {
      if (board[row + i][col].type !== 'empty') return false;
    }
  }
  return true;
}

function placeShip(board, row, col, size, orientation, shipType) {
  if (orientation === 'horizontal') {
    for (let i = 0; i < size; i++) {
      board[row][col + i] = { type: shipType, hit: false };
    }
  } else {
    for (let i = 0; i < size; i++) {
      board[row + i][col] = { type: shipType, hit: false };
    }
  }
}

function placeAllShips(board, shipConfigs) {
  shipConfigs.forEach(shipConfig => {
    const { size, type } = shipConfig;
    let placed = false;

    while (!placed) {
      const orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';
      const row = getRandomInt(board.length);
      const col = getRandomInt(board[0].length);

      if (canPlaceShip(board, row, col, size, orientation)) {
        placeShip(board, row, col, size, orientation, type);
        placed = true;
      }
    }
  });
}

function getUserGuess(board, callback) {
  const guess = readlineSync.question('Enter a guess (e.g., A1, B2): ');
  const [row, col] = parseGuess(guess);
  if (isValidGuess(row, col, board)) {
    callback(row, col);
  } else {
    console.log('Invalid guess, try again.');
    getUserGuess(board, callback);
  }
}

function parseGuess(guess) {
  const row = guess[0].toUpperCase().charCodeAt(0) - 65;
  const col = parseInt(guess[1]) - 1;
  return [row, col];
}

function isValidGuess(row, col, board) {
  return row >= 0 && row < board.length && col >= 0 && col < board[0].length;
}

function startGame() {
  console.log("Welcome to Battleship 🚢");

  const boards = ['4x4', '5x5', '6x6'];
  const index = readlineSync.keyInSelect(boards, 'Which board size?');
  const boardSize = index + 4;
  const board = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => ({ type: 'empty', hit: false }))
  );

  let shipConfigs = [];

  const largeShip = { size: 3, type: 'large' };
  const smallShip = { size: 2, type: 'small' };

  if (boardSize === 4) {
    shipConfigs.push(largeShip);
    shipConfigs.push(smallShip);
  } else if (boardSize === 5) {
    shipConfigs.push(largeShip);
    shipConfigs.push(smallShip);
    shipConfigs.push(smallShip);
  } else {
    shipConfigs.push(largeShip);
    shipConfigs.push(largeShip);
    shipConfigs.push(smallShip);
    shipConfigs.push(smallShip);
  }

  placeAllShips(board, shipConfigs);

  let totalHits = shipConfigs.reduce((sum, ship) => sum + ship.size, 0);

  while (true) {
    printBoard(board);
    getUserGuess(board, (row, col) => {
      const cell = board[row][col];
      if (cell.hit) {
        console.log('You already guessed that spot!');
      } else {
        cell.hit = true;
        if (cell.type !== 'empty') {
          console.log(`You hit a ${cell.type} ship!`);
          totalHits--;
          if (totalHits === 0) {
            console.log('Congratulations! You have sunk all the ships!');
            printBoard(board);
            console.log(asciiArt);
            startGame();
          }
        } else {
          console.log('Miss!');
        }
      }
    });
  }
}

startGame();
