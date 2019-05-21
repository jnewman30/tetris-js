import { createAudioContext, loadTrack, playTrack } from './audio.js';
import { createBlock } from './blocks.js';

const audioCtx = createAudioContext();

async function playDropSound() {
  const dropSound = await loadTrack(audioCtx, '../sounds/snare.wav');
  playTrack(audioCtx, dropSound);
}

async function playClearSound() {
  const clearSound = await loadTrack(audioCtx, '../sounds/clear.mp3');
  playTrack(audioCtx, clearSound);
}

const viewport = document.getElementById('viewport');
const context = viewport.getContext('2d');
context.scale(20, 20);

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;


const clearFillStyle = context.createLinearGradient(0, 0, 0, 32);
clearFillStyle.addColorStop(0, '#448aff');
clearFillStyle.addColorStop(0.5, '#3e2723');
clearFillStyle.addColorStop(0.6, '#212121');
clearFillStyle.addColorStop(1, '#212121');


function clear() {
  context.fillStyle = clearFillStyle;
  context.fillRect(0, 0, viewport.width, viewport.height);
}

const colors = [
  null,
  '#ff5252',
  '#76ff03',
  '#80d8ff',
  '#ffc400',
  '#ffff8d',
  '#ea80fc',
  '#f8bbd0'
];

function arenaSweep() {
  let rowCount = 1;

  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }

    playClearSound();

    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;

    player.score += rowCount * 10;
    rowCount *= 2;
  }
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
        (arena[y + o.y] &&
          arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

const player = {
  pos: { x: 5, y: 5 },
  matrix: null,
  score: 0
};

const arena = createMatrix(18, 32);

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    playDropSound();
    merge(arena, player);
    playerReset();
    arenaSweep();
    updatePlayerScore();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function playerReset() {
  const blocks = 'ILJOTSZ';
  player.matrix = createBlock(blocks[blocks.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) -
    (player.matrix[0].length / 2 | 0);
  // if we reset and collide right away... then game over
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updatePlayerScore();
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(
          x + offset.x, y + offset.y,
          1, 1);
      }
    });
  });
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    })
  })
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [
        matrix[x][y],
        matrix[y][x]
      ] = [
          matrix[y][x],
          matrix[x][y]
        ];
    }
  }

  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function draw() {
  clear();
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
}

function updatePlayerScore() {
  document.getElementById('score').innerText = player.score;
}

document.addEventListener('keydown', event => {
  if (event.keyCode === 37) {
    playerMove(-1);
  } else if (event.keyCode === 39) {
    playerMove(1);
  } else if (event.keyCode === 40) {
    playerDrop();
  } else if (event.keyCode === 81) {
    playerRotate(-1);
  } else if (event.keyCode === 87) {
    playerRotate(1);
  }
});


async function main() {
  const bgMusic = await loadTrack(audioCtx, '../sounds/music.mp3');
  playTrack(audioCtx, bgMusic, true, 0, 0.5);

  playerReset();
  updatePlayerScore();
  update();
}

main();
