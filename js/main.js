// Main initialization and game startup

// Global game instance
let game = null;

// Debug mode
window.DEBUG = false;

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Climb Game - Frustration-Based Survival Platformer');
    console.log('Initializing game...');
    
    try {
        // Create game instance
        game = new Game();
        
        // Make game globally accessible for debugging
        window.game = game;
        
        console.log('✅ Game initialized successfully');
        console.log('Controls:');
        console.log('  Desktop: A/D to move, Space to jump, P to pause, R to restart');
        console.log('  Mobile: Use on-screen joystick and jump button');
        console.log('');
        console.log('⚠️  WARNING: This game is designed to frustrate you!');
        console.log('   Platforms will trick you, traps will surprise you.');
        console.log('   Can you survive all 10 levels?');
        
    } catch (error) {
        console.error('❌ Failed to initialize game:', error);
        showErrorMessage('Failed to initialize game. Please refresh the page.');
    }
});

// Error handling
window.addEventListener('error', function(event) {
    console.error('Game Error:', event.error);
    if (game) {
        game.pauseGame();
    }
    showErrorMessage('An error occurred. Game has been paused.');
});

// Unhandled promise rejection handling
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled Promise Rejection:', event.reason);
    event.preventDefault();
});

// Show error message to user
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 1000;
        text-align: center;
        font-family: Arial, sans-serif;
    `;
    errorDiv.innerHTML = `
        <h3>Error</h3>
        <p>${message}</p>
        <button onclick="this.parentElement.remove()" style="
            background: white;
            color: red;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
        ">OK</button>
    `;
    document.body.appendChild(errorDiv);
}

// Keyboard shortcuts for debugging
document.addEventListener('keydown', function(event) {
    // Only process debug keys when not in input fields
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    switch (event.code) {
        case 'F1':
            event.preventDefault();
            toggleDebugMode();
            break;
        case 'F2':
            event.preventDefault();
            if (game) {
                game.player.addSpeedBoost(5000);
                console.log('Speed boost activated!');
            }
            break;
        case 'F3':
            event.preventDefault();
            if (game) {
                game.player.addShield(5000);
                console.log('Shield activated!');
            }
            break;
        case 'F4':
            event.preventDefault();
            if (game) {
                game.nextLevel();
                console.log('Skipped to next level');
            }
            break;
        case 'F5':
            event.preventDefault();
            if (game) {
                game.physics.invertGravity(10000);
                console.log('Gravity inverted for 10 seconds');
            }
            break;
    }
});

// Toggle debug mode
function toggleDebugMode() {
    window.DEBUG = !window.DEBUG;
    console.log(`Debug mode: ${window.DEBUG ? 'ON' : 'OFF'}`);
    
    if (window.DEBUG) {
        console.log('Debug commands:');
        console.log('  F1: Toggle debug mode');
        console.log('  F2: Speed boost');
        console.log('  F3: Shield');
        console.log('  F4: Skip level');
        console.log('  F5: Invert gravity');
        console.log('  game.currentLevel = X: Jump to level X');
        console.log('  game.score += X: Add score');
        console.log('  game.lives += X: Add lives');
    }
}

// Performance monitoring
let lastFPSUpdate = 0;
let frameCount = 0;
let currentFPS = 0;

function updateFPS() {
    frameCount++;
    const now = performance.now();
    
    if (now - lastFPSUpdate >= 1000) {
        currentFPS = Math.round((frameCount * 1000) / (now - lastFPSUpdate));
        frameCount = 0;
        lastFPSUpdate = now;
        
        // Log performance warnings
        if (currentFPS < 30) {
            console.warn(`Low FPS detected: ${currentFPS}`);
        }
    }
    
    requestAnimationFrame(updateFPS);
}

// Start FPS monitoring
requestAnimationFrame(updateFPS);

// Visibility change handling (pause when tab is hidden)
document.addEventListener('visibilitychange', function() {
    if (game && game.state === 'playing') {
        if (document.hidden) {
            game.pauseGame();
            console.log('Game paused (tab hidden)');
        }
    }
});

// Mobile device orientation handling
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        if (game) {
            game.resizeCanvas();
            console.log('Canvas resized for orientation change');
        }
    }, 100);
});

// Prevent default touch behaviors that interfere with game
document.addEventListener('touchstart', function(e) {
    // Prevent pull-to-refresh
    if (e.touches.length === 1 && window.scrollY === 0) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchmove', function(e) {
    // Prevent scrolling
    e.preventDefault();
}, { passive: false });

// Console welcome message
console.log(`
    ╔══════════════════════════════════════╗
    ║        CLIMB GAME - DEBUG MODE       ║
    ║   Frustration-Based Survival Game    ║
    ╠══════════════════════════════════════╣
    ║  Press F1 to toggle debug mode       ║
    ║  Type 'game' in console for access   ║
    ║  Good luck... you'll need it! 😈     ║
    ╚══════════════════════════════════════╝
`);

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { game, toggleDebugMode };
}
