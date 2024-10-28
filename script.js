const candyTypes = [
    './images/yellow.png',
    './images/red.png',
    './images/purple.png',
    './images/orange.png',
    './images/green.png',
    './images/blue.png'
];

let score = 0;
let draggedCandy = null;
let replacedCandy = null;
let boardLocked = false;
let startX, startY, endX, endY;

document.addEventListener('DOMContentLoaded', () => {
    preloadImages();
    
    document.getElementById('start-button').addEventListener('click', () => {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-board').classList.remove('hidden');
        document.getElementById('score').classList.remove('hidden');
        document.querySelector('.bottom-logo').classList.remove('hidden');
        initializeGame();
    });
});

function preloadImages() {
    candyTypes.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

function initializeGame() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    score = 0;
    updateScore();
    createBoard();
}

function createBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    for (let i = 0; i < 64; i++) {
        const candy = document.createElement('div');
        let randomCandy;
        do {
            randomCandy = candyTypes[Math.floor(Math.random() * candyTypes.length)];
            candy.style.backgroundImage = `url('${randomCandy}')`;
        } while (checkInitialMatch(i, candy.style.backgroundImage));

        candy.classList.add('candy');
        candy.setAttribute('data-index', i);
        
        candy.addEventListener('touchstart', handleTouchStart, false);
        candy.addEventListener('touchmove', handleTouchMove, false);
        candy.addEventListener('touchend', handleTouchEnd, false);
        
        gameBoard.appendChild(candy);
    }
    
    setTimeout(checkAndRemoveMatches, 500);
}

function checkInitialMatch(index, backgroundImage) {
    const row = Math.floor(index / 8);
    const col = index % 8;
    const candies = document.querySelectorAll('.candy');
    
    if (col >= 2) {
        const candy1 = candies[index - 2];
        const candy2 = candies[index - 1];
        if (candy1 && candy2 &&
            candy1.style.backgroundImage === backgroundImage &&
            candy2.style.backgroundImage === backgroundImage) {
            return true;
        }
    }
    
    if (row >= 2) {
        const candy1 = candies[index - 16];
        const candy2 = candies[index - 8];
        if (candy1 && candy2 &&
            candy1.style.backgroundImage === backgroundImage &&
            candy2.style.backgroundImage === backgroundImage) {
            return true;
        }
    }
    
    return false;
}

function handleTouchStart(e) {
    if (boardLocked) return;
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    draggedCandy = e.target;
}

function handleTouchMove(e) {
    if (!draggedCandy || boardLocked) return;
    e.preventDefault();
}

function handleTouchEnd(e) {
    if (!draggedCandy || boardLocked) return;
    
    const touch = e.changedTouches[0];
    endX = touch.clientX;
    endY = touch.clientY;
    
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > 30) {
            const currentIndex = parseInt(draggedCandy.getAttribute('data-index'));
            const newIndex = deltaX > 0 ? currentIndex + 1 : currentIndex - 1;
            const targetCandy = document.querySelector(`[data-index="${newIndex}"]`);
            
            if (targetCandy && isValidMove(currentIndex, newIndex)) {
                swapCandies(draggedCandy, targetCandy);
            }
        }
    } else {
        if (Math.abs(deltaY) > 30) {
            const currentIndex = parseInt(draggedCandy.getAttribute('data-index'));
            const newIndex = deltaY > 0 ? currentIndex + 8 : currentIndex - 8;
            const targetCandy = document.querySelector(`[data-index="${newIndex}"]`);
            
            if (targetCandy && isValidMove(currentIndex, newIndex)) {
                swapCandies(draggedCandy, targetCandy);
            }
        }
    }
    
    draggedCandy = null;
}

function swapCandies(candy1, candy2) {
    boardLocked = true;
    const bg1 = candy1.style.backgroundImage;
    const bg2 = candy2.style.backgroundImage;
    
    candy1.classList.add('swapping');
    candy2.classList.add('swapping');
    
    candy1.style.backgroundImage = bg2;
    candy2.style.backgroundImage = bg1;
    
    setTimeout(() => {
        const matches = checkAndRemoveMatches();
        if (!matches) {
            candy1.style.backgroundImage = bg1;
            candy2.style.backgroundImage = bg2;
        }
        
        candy1.classList.remove('swapping');
        candy2.classList.remove('swapping');
        boardLocked = false;
    }, 300);
}

function isValidMove(index1, index2) {
    const row1 = Math.floor(index1 / 8);
    const col1 = index1 % 8;
    const row2 = Math.floor(index2 / 8);
    const col2 = index2 % 8;
    
    return (Math.abs(row1 - row2) === 1 && col1 === col2) || 
           (Math.abs(col1 - col2) === 1 && row1 === row2);
}

function checkAndRemoveMatches() {
    let matchFound = false;
    const candies = document.querySelectorAll('.candy');
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 6; col++) {
            const index = row * 8 + col;
            const candy1 = candies[index];
            const candy2 = candies[index + 1];
            const candy3 = candies[index + 2];
            
            if (candy1.style.backgroundImage !== '' &&
                candy1.style.backgroundImage === candy2.style.backgroundImage &&
                candy1.style.backgroundImage === candy3.style.backgroundImage) {
                candy1.classList.add('matched');
                candy2.classList.add('matched');
                candy3.classList.add('matched');
                matchFound = true;
                score += 3;
            }
        }
    }
    
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 8; col++) {
            const index = row * 8 + col;
            const candy1 = candies[index];
            const candy2 = candies[index + 8];
            const candy3 = candies[index + 16];
            
            if (candy1.style.backgroundImage !== '' &&
                candy1.style.backgroundImage === candy2.style.backgroundImage &&
                candy1.style.backgroundImage === candy3.style.backgroundImage) {
                candy1.classList.add('matched');
                candy2.classList.add('matched');
                candy3.classList.add('matched');
                matchFound = true;
                score += 3;
            }
        }
    }
    
    if (matchFound) {
        updateScore();
        setTimeout(() => {
            removeMatches();
            dropCandies();
            setTimeout(() => {
                fillEmptySpaces();
                setTimeout(checkAndRemoveMatches, 300);
            }, 300);
        }, 500);
    }
    
    return matchFound;
}

function removeMatches() {
    const matchedCandies = document.querySelectorAll('.candy.matched');
    matchedCandies.forEach(candy => {
        candy.style.backgroundImage = '';
        candy.classList.remove('matched');
    });
}

function refillBoard() {
    const candies = document.querySelectorAll('.candy');
    candies.forEach(candy => {
        if (candy.style.backgroundImage === '') {
            const randomCandy = candyTypes[Math.floor(Math.random() * candyTypes.length)];
            candy.style.backgroundImage = `url('${randomCandy}')`;
        }
    });
    
    setTimeout(checkMatches, 500);
}

function updateScore() {
    document.getElementById('score').textContent = `Score: ${score}`;
}

function dropCandies() {
    const candies = document.querySelectorAll('.candy');
    for (let col = 0; col < 8; col++) {
        let emptySpaces = 0;
        for (let row = 7; row >= 0; row--) {
            const index = row * 8 + col;
            const candy = candies[index];
            
            if (candy.style.backgroundImage === '') {
                emptySpaces++;
            } else if (emptySpaces > 0) {
                const newIndex = (row + emptySpaces) * 8 + col;
                if (candies[newIndex]) {
                    candies[newIndex].style.backgroundImage = candy.style.backgroundImage;
                    candy.style.backgroundImage = '';
                }
            }
        }
    }
}

function fillEmptySpaces() {
    const candies = document.querySelectorAll('.candy');
    let newCandyAdded = false;
    
    candies.forEach(candy => {
        if (candy.style.backgroundImage === '') {
            const randomCandy = candyTypes[Math.floor(Math.random() * candyTypes.length)];
            candy.style.backgroundImage = `url('${randomCandy}')`;
            candy.classList.add('falling');
            newCandyAdded = true;
            
            setTimeout(() => {
                candy.classList.remove('falling');
            }, 500);
        }
    });
    
    return newCandyAdded;
}
