let playerName = document.getElementById('playerName').value;

// Inicializa el canvas
const canvas = document.querySelector('canvas');
const playerScore = document.querySelector(".score");
const playerLevel = document.querySelector(".level");
const playerPieces = document.querySelector(".pieces");

const context = canvas.getContext('2d');

const BLOCK_SIZE = 20;
const BOARD_WIDTH = 14;
const BOARD_HEIGHT = 30;
const POSITION_X = 6

canvas.width = BLOCK_SIZE * BOARD_WIDTH;
canvas.height = BLOCK_SIZE * BOARD_HEIGHT;

context.scale(BLOCK_SIZE, BLOCK_SIZE);

function obtenerYMostrarPuntajes() {
    fetch('obtener_puntajes.php')
        .then(response => response.json())
        .then(puntajes => {
            // Obtener la referencia al tbody de la tabla
            const scoreTableBody = document.getElementById('scoreTableBody');

            // Limpiar contenido actual de la tabla
            scoreTableBody.innerHTML = '';

            // Iterar sobre los puntajes y agregar filas a la tabla
            puntajes.forEach(puntaje => {
                const fila = document.createElement('tr');
                const celdaNombre = document.createElement('td');
                const celdaPuntaje = document.createElement('td');

                celdaNombre.textContent = puntaje.name;
                celdaPuntaje.textContent = puntaje.score;

                fila.appendChild(celdaNombre);
                fila.appendChild(celdaPuntaje);

                scoreTableBody.appendChild(fila);
            });
        })
        .catch(error => console.error('Error:', error));
}

window.addEventListener('load', obtenerYMostrarPuntajes);

// Tablero
const board = Array.from({ length: BOARD_HEIGHT}, () => new Array(BOARD_WIDTH).fill(0))
//let lineTestBoard = [1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1];
//board[BOARD_HEIGHT - 1] = lineTestBoard;

// Pieza de juego

const piece = {
    position: {x: POSITION_X, y: 0},
    shape: [
        [0, 0],
        [0, 0]
    ]
}

const PIECES = [
    [
        [1, 1],
        [1, 1]
    ],
    [
        [1, 1, 1, 1]
    ],
    [
        [1, 1],
        [1, 0],
        [1, 0]
    ],
    [
        [0, 1, 0],
        [1, 1, 1]
    ],
    [
        [1, 1, 0],
        [0, 1, 1]
    ],
    [
        [1, 0],
        [1, 0],
        [1, 1]
    ],
    [
        [0, 1, 1],
        [1, 1, 0]
    ]
]

const game = {
    active: false,
    score: 0,
    level: 1,
    speed: 1000,
    playerName: 'default',
    totalPieces: 0,
    nextPiece: piece
}

document.getElementById('startButton').addEventListener('click', function() {
    resetStats()
    playerName = document.getElementById('playerName').value;
    if(playerName.trim() !== '') {
        game.playerName = playerName;
        playerLevel.textContent = game.level
        game.active = true;
        gameLoop();
    }else{
        window.alert('¡Ingrese un nombre de jugador!')
    }

});

function update() {
    draw()
    window.requestAnimationFrame(update)
}

function gameLoop() {
    if (game.active) {
        update()
        setTimeout(gameLoop, game.speed)
        movePiece('ArrowDown')
    }
}

function draw(){
    context.fillStyle = '#888'
    context.fillRect(0, 0, canvas.width, canvas.height)

    board.forEach((row, y)=> {
        row.forEach((value, x) => {
            if(value === 1) {
                context.fillStyle = 'red'
                context.fillRect(x, y, 1, 1)
            }
        })
    })

    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value) {
                context.fillStyle = 'yellow'
                context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1)
            }
        })
    })
}

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        movePiece(event.key)
    }else{
        if(event.key === 'ArrowRight') {
            movePiece(event.key)
        }else{
            if (event.key === 'ArrowDown') {
                movePiece(event.key)
            }else{
                if (event.key === 'ArrowUp') {
                    movePiece(event.key)
                }else{
                    if(event.key === ' ' || event.key === 'Space') {
                        event.preventDefault();
                    }
                }
            }
        }
    }



})

function movePiece(eventKey) {
    if (eventKey === 'ArrowLeft') {
        piece.position.x--;
        if(checkCollision()) {
            piece.position.x++;
        }
    }
    if (eventKey === 'ArrowRight') {
        piece.position.x++;
        if(checkCollision()) {
            piece.position.x--;
        }
    }
    if (eventKey === 'ArrowDown') {
        piece.position.y++;
        if(checkCollision()) {
            piece.position.y--;
            lockPiece()
            removeRow()
        }
    }

    if(eventKey === 'ArrowUp') {
        rotatePiece()
    }
}

function rotatePiece() {
    const rotated = []
    const rows = piece.shape.length;
    const cols = piece.shape[0].length;
  
    for (let i = 0; i < cols; i++) {
      const newRow = [];
      for (let j = rows - 1; j >= 0; j--) {
        newRow.push(piece.shape[j][i]);
      }
      rotated.push(newRow);
    }

    let oldShape = piece.shape
    piece.shape = rotated
    if(checkCollision()) {
        piece.shape = oldShape
    }
    
}

function checkCollision() {
    return piece.shape.find((row, y) => {
        return row.find((value, x) => {
            return(
                value !== 0 &&
                board[y + piece.position.y]?.[x + piece.position.x] !== 0
            )
        })
    }) 
}

function lockPiece() {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value === 1) {
                board[y + piece.position.y][x + piece.position.x] = 1
            }
        })
    })
    
    piece.shape = game.nextPiece.shape
    game.nextPiece.shape = PIECES[Math.floor(Math.random() * PIECES.length)]
    game.totalPieces++
    playerPieces.textContent = game.totalPieces

    //reset position piece
    piece.position.x = POSITION_X
    piece.position.y = 0
    
    //game over
    if(checkCollision()) {
        gameOver()
    }
}

function gameOver() {
    window.alert('¡¡GameOver!!');
    board.forEach((row) => row.fill(0));
    game.active = false;
    enviarPuntaje(playerName, game.score);
    resetStats();
}

function resetStats() {
    //random piece
    piece.shape = PIECES[Math.floor(Math.random() * PIECES.length)]
    game.nextPiece.shape = PIECES[Math.floor(Math.random() * PIECES.length)]
    game.score = 0
    game.level = 1
    game.speed = 1000
    game.totalPieces = 0

    playerScore.textContent = game.score
    playerLevel.textContent = game.level
    playerPieces.textContent = game.totalPieces
}

function removeRow() {
    const rowsToRemove = []

    board.forEach((row,y) => {
        if(row.every(value => value == 1)) {
            rowsToRemove.push(y)
        }
    })

    rowsToRemove.forEach(y => {
        board.splice(y, 1) 
        const newRow = Array(BOARD_WIDTH).fill(0)
        board.unshift(newRow)
        game.score += 10
        playerScore.textContent = game.score
    })
}

function enviarPuntaje(playerName, score) {
    fetch('guardar_puntaje.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerName, score }),
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}




