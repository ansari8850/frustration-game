// Main game engine

class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 800;
        this.height = 600;

        // Game state
        this.state = 'start'; // start, playing, paused, gameOver, levelComplete
        this.currentLevel = 1;
        this.maxLevel = 10;
        this.score = 0;
        this.lives = 3;
        this.startTime = 0;
        this.gameTime = 0;

        // Game systems
        this.physics = new Physics();
        this.controls = new Controls();
        this.player = null;
        this.platforms = [];
        this.hazards = [];
        this.particles = [];

        // Camera
        this.camera = {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height,
            shake: 0,
            shakeDecay: 0.9
        };

        // Game bounds
        this.bounds = {
            left: -100,
            right: this.width + 100,
            top: -1000,
            bottom: this.height + 100
        };

        // Level management
        this.levelManager = null;
        this.platformSpawnTimer = 0;
        this.platformSpawnInterval = 2000; // ms

        // Frustration mechanics
        this.trapRandomSeed = Date.now();
        this.deathCount = 0;
        this.lastDeathTime = 0;

        // Performance
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.fps = 60;
        this.frameCount = 0;

        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupUI();

        // Initialize game systems
        this.levelManager = new LevelManager(this);
        this.player = new Player(this.width / 2, this.height - 100);

        // Add a permanent ground platform to prevent falling through
        this.addGroundPlatform();

        // Start game loop
        this.gameLoop();
    }

    addGroundPlatform() {
        // Create a simple ground platform that the player can land on
        const groundPlatform = {
            position: { x: this.width / 2 - 100, y: this.height - 30 },
            size: { width: 200, height: 30 },
            bounds: { x: this.width / 2 - 100, y: this.height - 30, width: 200, height: 30 },
            behaviorType: 'normal',
            color: '#444444',
            update: () => { },
            render: (ctx) => {
                ctx.fillStyle = '#444444';
                ctx.fillRect(this.width / 2 - 100, this.height - 30, 200, 30);
            },
            onPlayerLand: () => { }
        };
        this.platforms.push(groundPlatform);
    }

    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = Utils.getCanvasContext(this.canvas);

        // Set canvas size
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Make canvas responsive
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = document.getElementById('gameContainer');
        Utils.resizeCanvas(this.canvas, container, this.width / this.height);
    }

    setupEventListeners() {
        // UI button events
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('retryButton').addEventListener('click', () => this.restartGame());
        document.getElementById('menuButton').addEventListener('click', () => this.showMainMenu());
        document.getElementById('nextLevelButton').addEventListener('click', () => this.nextLevel());
        document.getElementById('resumeButton').addEventListener('click', () => this.resumeGame());
        document.getElementById('restartButton').addEventListener('click', () => this.restartLevel());
        document.getElementById('mainMenuButton').addEventListener('click', () => this.showMainMenu());
    }

    setupUI() {
        // Show/hide mobile controls based on device
        this.controls.showMobileControls(Utils.isMobile());

        // Update UI elements
        this.updateUI();
    }

    gameLoop(currentTime = 0) {
        // Calculate delta time
        this.deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        // Cap delta time to prevent large jumps
        this.deltaTime = Math.min(this.deltaTime, 33.33); // Max 30 FPS

        // Update game time
        if (this.state === 'playing') {
            this.gameTime = currentTime - this.startTime;
        }

        // Update and render based on game state
        switch (this.state) {
            case 'playing':
                this.update(this.deltaTime);
                this.render();
                break;
            case 'paused':
                this.render(); // Still render but don't update
                break;
            default:
                this.render(); // Render menu screens
                break;
        }

        // Continue game loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // Handle input
        const input = this.controls.getInput();

        // Check for pause
        if (input.pause) {
            this.pauseGame();
            return;
        }

        // Check for restart
        if (input.restart) {
            this.restartLevel();
            return;
        }

        // Update player
        if (this.player) {
            this.physics.applyMovement(this.player, input);
            this.physics.updateEntity(this.player, deltaTime / 16.67);
            this.player.update(deltaTime);
        }

        // Update platforms
        this.platforms.forEach(platform => {
            platform.update(deltaTime);

            // Check collision with player
            if (this.player && this.physics.checkCollision(this.player, platform)) {
                const collisionSide = this.physics.resolveCollision(this.player, platform);
                if (collisionSide === 'top') {
                    this.score += 10; // Points for landing on platform
                }
            }
        });

        // Update hazards
        this.hazards.forEach(hazard => {
            hazard.update(deltaTime, this.player);

            // Check collision with player
            if (this.player && this.physics.checkCollision(this.player, hazard)) {
                this.playerDeath();
            }
        });

        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.update(deltaTime);
            return particle.life > 0;
        });

        // Spawn new platforms
        this.updatePlatformSpawning(deltaTime);

        // Update camera
        if (this.player) {
            this.updateCamera();
        }

        // Check win condition
        this.checkLevelComplete();

        // Check lose conditions
        this.checkGameOver();

        // Clean up old entities
        this.cleanup();

        // Update UI
        this.updateUI();
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = 'linear-gradient(180deg, #001122 0%, #000000 100%)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Apply camera shake
        if (this.camera.shake > 0) {
            const shakeX = (Math.random() - 0.5) * this.camera.shake;
            const shakeY = (Math.random() - 0.5) * this.camera.shake;
            this.ctx.translate(shakeX, shakeY);
            this.camera.shake *= this.camera.shakeDecay;
        }

        // Save context for camera transform
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Render game objects
        this.renderBackground();
        this.renderPlatforms();
        this.renderHazards();
        this.renderPlayer();
        this.renderParticles();
        this.renderEffects();

        // Restore context
        this.ctx.restore();

        // Render UI elements (not affected by camera)
        this.renderUI();
    }

    renderBackground() {
        // Render scrolling background or effects
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#001122');
        gradient.addColorStop(1, '#000000');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(this.camera.x, this.camera.y, this.width, this.height);

        // Add some stars or background elements
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % this.width + this.camera.x;
            const y = (i * 23) % this.height + this.camera.y;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }

    renderPlatforms() {
        this.platforms.forEach(platform => platform.render(this.ctx));
    }

    renderHazards() {
        this.hazards.forEach(hazard => hazard.render(this.ctx));
    }

    renderPlayer() {
        if (this.player) {
            this.player.render(this.ctx);
        }
    }

    renderParticles() {
        this.particles.forEach(particle => particle.render(this.ctx));
    }

    renderEffects() {
        // Render any special effects like wind indicators, gravity arrows, etc.
        if (this.physics.windForce > 0) {
            this.renderWindIndicator();
        }

        if (this.physics.gravityInverted) {
            this.renderGravityIndicator();
        }
    }

    renderWindIndicator() {
        this.ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
        const windDirection = this.physics.windDirection;
        const arrowX = windDirection > 0 ? this.width - 50 : 50;

        // Simple wind arrow
        this.ctx.beginPath();
        this.ctx.moveTo(arrowX, 50);
        this.ctx.lineTo(arrowX + windDirection * 20, 40);
        this.ctx.lineTo(arrowX + windDirection * 20, 60);
        this.ctx.closePath();
        this.ctx.fill();
    }

    renderGravityIndicator() {
        this.ctx.fillStyle = 'rgba(255, 0, 255, 0.5)';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GRAVITY INVERTED!', this.width / 2, 30);
    }

    renderUI() {
        // UI is rendered without camera transform
        // Most UI is handled by HTML elements, but we can add canvas UI here if needed
    }

    // Game state methods
    startGame() {
        this.state = 'playing';
        this.currentLevel = 1;
        this.score = 0;
        this.lives = 3;
        this.deathCount = 0;
        this.startTime = performance.now();

        this.resetLevel();
        this.hideAllScreens();
        this.controls.setEnabled(true);
    }

    pauseGame() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.showScreen('pauseScreen');
            this.controls.setEnabled(false);
        }
    }

    resumeGame() {
        if (this.state === 'paused') {
            this.state = 'playing';
            this.hideAllScreens();
            this.controls.setEnabled(true);
        }
    }

    restartGame() {
        this.startGame();
    }

    restartLevel() {
        this.resetLevel();
        this.state = 'playing';
        this.hideAllScreens();
        this.controls.setEnabled(true);
    }

    nextLevel() {
        this.currentLevel++;
        if (this.currentLevel > this.maxLevel) {
            this.gameComplete();
        } else {
            this.resetLevel();
            this.state = 'playing';
            this.hideAllScreens();
        }
    }

    gameComplete() {
        this.state = 'gameOver';
        this.showScreen('gameOverScreen');
        document.getElementById('finalLevel').textContent = this.maxLevel;
        document.getElementById('finalScore').textContent = Utils.formatScore(this.score);
        this.controls.setEnabled(false);
    }

    showMainMenu() {
        this.state = 'start';
        this.showScreen('startScreen');
        this.controls.setEnabled(false);
        this.reset();
    }

    playerDeath() {
        this.deathCount++;
        this.lastDeathTime = performance.now();
        this.lives--;

        // Screen shake effect
        this.camera.shake = 20;

        // Vibrate on mobile
        this.controls.vibrate([200, 100, 200]);

        // Add death particles
        this.addDeathParticles();

        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Respawn player
            this.respawnPlayer();
        }
    }

    gameOver() {
        this.state = 'gameOver';
        this.showScreen('gameOverScreen');
        document.getElementById('finalLevel').textContent = this.currentLevel;
        document.getElementById('finalScore').textContent = Utils.formatScore(this.score);
        this.controls.setEnabled(false);
    }

    respawnPlayer() {
        if (this.player) {
            this.player.reset(this.width / 2, this.height - 100);
            this.camera.shake = 10;
        }
    }

    resetLevel() {
        // Clear all entities
        this.platforms = [];
        this.hazards = [];
        this.particles = [];

        // Reset player
        if (this.player) {
            this.player.reset(this.width / 2, this.height - 100);
        }

        // Reset physics
        this.physics.reset();

        // Reset camera
        this.camera.x = 0;
        this.camera.y = 0;
        this.camera.shake = 0;

        // Load level
        if (this.levelManager) {
            this.levelManager.loadLevel(this.currentLevel);
        }

        // Add initial starting platform for player
        try {
            const startPlatform = new Platform(this.width / 2 - 50, this.height - 50, this.currentLevel, this.trapRandomSeed);
            startPlatform.behaviorType = 'normal'; // Ensure starting platform is safe
            startPlatform.color = '#666666';
            this.platforms.push(startPlatform);
        } catch (error) {
            console.error('Failed to create starting platform:', error);
            // Create a simple platform object as fallback
            this.platforms.push({
                position: { x: this.width / 2 - 50, y: this.height - 50 },
                size: { width: 100, height: 20 },
                bounds: { x: this.width / 2 - 50, y: this.height - 50, width: 100, height: 20 },
                behaviorType: 'normal',
                color: '#666666',
                update: () => { },
                render: (ctx) => {
                    ctx.fillStyle = '#666666';
                    ctx.fillRect(this.width / 2 - 50, this.height - 50, 100, 20);
                },
                onPlayerLand: () => { }
            });
        }

        // Reset spawn timer
        this.platformSpawnTimer = 0;

        // Randomize traps for frustration
        this.trapRandomSeed = Date.now() + this.deathCount;
    }

    reset() {
        this.currentLevel = 1;
        this.score = 0;
        this.lives = 3;
        this.deathCount = 0;
        this.gameTime = 0;
        this.resetLevel();
    }

    // Utility methods
    updatePlatformSpawning(deltaTime) {
        this.platformSpawnTimer += deltaTime;

        if (this.platformSpawnTimer >= this.platformSpawnInterval) {
            this.spawnPlatform();
            this.platformSpawnTimer = 0;

            // Decrease spawn interval for difficulty
            this.platformSpawnInterval = Math.max(1000, this.platformSpawnInterval - 50);
        }
    }

    spawnPlatform() {
        const x = Utils.random(50, this.width - 150);
        const y = -50; // Spawn above screen
        const platform = new Platform(x, y, this.currentLevel, this.trapRandomSeed);
        this.platforms.push(platform);
    }

    updateCamera() {
        // Follow player with some offset
        const targetY = this.player.position.y - this.height * 0.7;
        this.camera.y = Utils.lerp(this.camera.y, targetY, 0.1);

        // Keep camera within bounds
        this.camera.y = Math.max(this.camera.y, -500);
    }

    checkLevelComplete() {
        // Level complete when player reaches certain height or survives certain time
        const heightThreshold = -500;
        const timeThreshold = 60000; // 60 seconds

        if (this.player && (this.player.position.y < heightThreshold || this.gameTime > timeThreshold)) {
            this.levelComplete();
        }
    }

    levelComplete() {
        this.state = 'levelComplete';
        this.showScreen('levelCompleteScreen');
        document.getElementById('completedLevel').textContent = this.currentLevel;
        document.getElementById('levelScore').textContent = Utils.formatScore(this.score);
        this.controls.setEnabled(false);

        // Bonus points for completing level
        this.score += 1000 * this.currentLevel;
    }

    checkGameOver() {
        // Check if player fell too far below screen (more lenient)
        if (this.player && this.player.position.y > this.height + 300) {
            this.playerDeath();
        }
    }

    cleanup() {
        // Remove platforms that are too far below camera
        this.platforms = this.platforms.filter(platform =>
            platform.position.y < this.camera.y + this.height + 200
        );

        // Remove hazards that are out of bounds
        this.hazards = this.hazards.filter(hazard =>
            !this.physics.isOutOfBounds(hazard, {
                left: this.camera.x - 200,
                right: this.camera.x + this.width + 200,
                top: this.camera.y - 200,
                bottom: this.camera.y + this.height + 200
            })
        );
    }

    updateUI() {
        document.getElementById('currentLevel').textContent = this.currentLevel;
        document.getElementById('currentLives').textContent = this.lives;
        document.getElementById('currentScore').textContent = Utils.formatScore(this.score);
    }

    showScreen(screenId) {
        this.hideAllScreens();
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('hidden');
        }
    }

    hideAllScreens() {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.add('hidden'));
    }

    addDeathParticles() {
        if (!this.player) return;

        for (let i = 0; i < 20; i++) {
            const particle = {
                x: this.player.position.x + Utils.random(-10, 10),
                y: this.player.position.y + Utils.random(-10, 10),
                vx: Utils.random(-5, 5),
                vy: Utils.random(-8, -2),
                life: 1.0,
                decay: Utils.random(0.02, 0.05),
                color: Utils.choose(['#ff4444', '#ff6666', '#ff8888', '#ffaaaa']),
                size: Utils.random(2, 6)
            };

            particle.update = function (deltaTime) {
                this.x += this.vx * deltaTime / 16.67;
                this.y += this.vy * deltaTime / 16.67;
                this.vy += 0.3; // Gravity
                this.life -= this.decay;
            };

            particle.render = function (ctx) {
                ctx.save();
                ctx.globalAlpha = this.life;
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.size, this.size);
                ctx.restore();
            };

            this.particles.push(particle);
        }
    }

    // Add hazard spawning
    spawnHazard(type, x, y) {
        let hazard;
        switch (type) {
            case 'bullet':
                hazard = new ChasingBullet(x, y);
                break;
            case 'falling':
                hazard = new FallingObject(x, y);
                break;
            case 'laser':
                hazard = new Laser(x, y);
                break;
            default:
                return;
        }
        this.hazards.push(hazard);
    }
}

// Make class globally available for browser
if (typeof window !== 'undefined') {
    window.Game = Game;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
}
