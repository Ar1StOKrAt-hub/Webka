'use strict';

// DOM Elements
const menuSection = document.querySelector('.game-menu');
const wrapper = document.querySelector('.wrapper');
const gameScreen = document.querySelector('.game-screen'); // Додано
const gamePanels = document.querySelector('.game-panels'); // Додано
const gunmanElement = document.querySelector('.gunman');
const messageBox = document.querySelector('.message');
const btnStart = document.querySelector('.button-start-game');

// Audio setup
const sfxIntro = new Audio('sfx/intro.m4a');
const sfxWait = new Audio('sfx/wait.m4a');
const sfxFire = new Audio('sfx/fire.m4a');
const sfxShot = new Audio('sfx/shot.m4a');
const sfxShotFall = new Audio('sfx/shot-fall.m4a');
const sfxDeath = new Audio('sfx/death.m4a');
const sfxWin = new Audio('sfx/win.m4a');
const sfxFoul = new Audio('sfx/foul.m4a');

// Global timer variables
let enemyTimer;
let fireTimer;

// --- Pure Functions (State Management) ---

// Returns initial game state
const createInitialState = () => ({
    level: 1,
    score: 0,
    gunmanState: 'walk', // walk, wait, ready, shooting, dead, won
    isRoundActive: false,
    fireStartTime: null
});

// Changes state to waiting for duel
const getReadyState = (currentState) => ({
    ...currentState,
    gunmanState: 'wait'
});

// Updates state when FIRE appears
const getFireState = (state, startTime) => ({
    ...state,
    gunmanState: 'ready',
    isRoundActive: true,
    fireStartTime: startTime
});

// Updates state when player wins
const getPlayerWinState = (state, reactTime) => ({
    ...state,
    gunmanState: 'dead',
    isRoundActive: false,
    score: state.score + 100, 
    reactionTime: reactTime
});

// Updates state when enemy wins
const getEnemyWinState = (state) => ({
    ...state,
    gunmanState: 'shooting',
    isRoundActive: false
});

// Advances the state to the next level
const getNextLevelState = (state) => ({
    ...state,
    level: state.level + 1,
    gunmanState: 'walk',
    isRoundActive: false,
    fireStartTime: null
});

// Global state initialization
let gameState = createInitialState();

// --- Game Logic & DOM Manipulation ---

function startGame() {
    gameState = createInitialState();

    // Show wrapper and all inner game screens (Fix for black screen)
    menuSection.style.display = 'none';
    wrapper.style.display = 'block';
    gameScreen.style.display = 'block'; 
    gamePanels.style.display = 'block'; 

    void gunmanElement.offsetWidth;
    
    sfxIntro.play();
    moveGunman();
}

function moveGunman() {
    gunmanElement.className = 'gunman gunman-level-1 moving';
    
    setTimeout(() => {
        prepareForDuel();
    }, 5000);
}

function prepareForDuel() {
    gameState = getReadyState(gameState);
    
    gunmanElement.className = 'gunman gunman-level-1 gunman-level-1__standing standing';
    sfxWait.play();
    
    timeCounter();
}

function timeCounter() {
    const randomDelay = Math.floor(Math.random() * 3000) + 2000;

    fireTimer = setTimeout(() => {
        const now = Date.now();
        gameState = getFireState(gameState, now);

        // Update for FIRE phase
        messageBox.classList.add('message--fire');
        gunmanElement.className = 'gunman gunman-level-1 gunman-level-1__ready standing';
        sfxFire.play();

        // Enemy reaction time decreases with level
        const enemyReflex = Math.max(1000 - (gameState.level * 100), 300); 
        
        // Start enemy timer
        enemyTimer = setTimeout(gunmanShootsPlayer, enemyReflex);
    }, randomDelay);
}

function playerShootsGunman() {
    // Check for FOUL (clicked before FIRE)
    if (!gameState.isRoundActive && gameState.gunmanState === 'wait') {
        clearTimeout(fireTimer);
        sfxFoul.play();
        messageBox.textContent = 'FOUL!';
        messageBox.className = 'message message--dead';
        document.querySelector('.button-restart').style.display = 'block';
        return;
    }

    // Ignore clicks if round is over
    if (!gameState.isRoundActive) return;

    // Player shot successfully
    clearTimeout(enemyTimer);
    const reactTime = Date.now() - gameState.fireStartTime;

    gameState = getPlayerWinState(gameState, reactTime);

    // Update for WIN
    sfxShotFall.play();
    setTimeout(() => sfxWin.play(), 1000);

    gunmanElement.className = 'gunman gunman-level-1 gunman-level-1__death';
    messageBox.className = 'message message--win';
    messageBox.textContent = 'YOU WON!';

    // Update Score and Time UI
    document.querySelector('.time-panel__you').textContent = (reactTime / 1000).toFixed(2);
    document.querySelector('.score-panel__score_num').textContent = gameState.score;

    document.querySelector('.button-next-level').style.display = 'block';
}

function gunmanShootsPlayer() {
    if (!gameState.isRoundActive) return;

    gameState = getEnemyWinState(gameState);

    // Update for LOSS
    sfxShot.play();
    sfxDeath.play();

    gunmanElement.className = 'gunman gunman-level-1 gunman-level-1__shooting standing';
    messageBox.className = 'message message--dead';
    messageBox.textContent = 'YOU DIED!';

    document.querySelector('.game-screen').classList.add('game-screen--death');
    document.querySelector('.button-restart').style.display = 'block';
}

function nextLevel() {
    // Update state
    gameState = getNextLevelState(gameState);

    // Clear timers
    clearTimeout(fireTimer);
    clearTimeout(enemyTimer);

    // Update DOM elements
    document.querySelector('.button-next-level').style.display = 'none';
    messageBox.className = 'message';
    messageBox.textContent = '';
    
    // Update display
    document.querySelector('.score-panel__level').textContent = `Level ${gameState.level}`;

    // Reset gunman position 
    gunmanElement.className = 'gunman gunman-level-1'; 
    
    // DOM reflow 
    void gunmanElement.offsetWidth; 

    // Start next round
    moveGunman();
}

function restartGame() {
    // Reset state
    gameState = createInitialState();

    // Clear timers
    clearTimeout(fireTimer);
    clearTimeout(enemyTimer);

    // Elements to default
    document.querySelector('.button-restart').style.display = 'none';
    document.querySelector('.game-screen').classList.remove('game-screen--death');
    messageBox.className = 'message';
    messageBox.textContent = '';
    
    document.querySelector('.score-panel__score_num').textContent = gameState.score;
    document.querySelector('.score-panel__level').textContent = `Level ${gameState.level}`;
    document.querySelector('.time-panel__you').textContent = '0.00';

    // Reset gunman position
    gunmanElement.className = 'gunman gunman-level-1';
    void gunmanElement.offsetWidth; // Force reflow

    // Start again
    moveGunman();
}

// --- Event Listeners ---
btnStart.addEventListener('click', startGame);
gunmanElement.addEventListener('mousedown', playerShootsGunman);
document.querySelector('.button-next-level').addEventListener('click', nextLevel);
document.querySelector('.button-restart').addEventListener('click', restartGame);