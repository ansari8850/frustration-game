// Level management and progression system

class LevelManager {
    constructor(game) {
        this.game = game;
        this.currentLevel = 1;
        this.levelConfigs = this.createLevelConfigs();
    }

    createLevelConfigs() {
        return {
            1: {
                name: "Getting Started",
                description: "Learn the basics... or so you think",
                platformSpawnRate: 2000,
                hazardSpawnRate: 5000,
                windChance: 0,
                gravityInversionChance: 0,
                controlSensitivity: 1.0,
                trapDensity: 0.1,
                bulletSpeed: 0.3,
                hazardTypes: ['falling'],
                specialMechanics: []
            },
            2: {
                name: "False Confidence",
                description: "Still think this is easy?",
                platformSpawnRate: 1800,
                hazardSpawnRate: 4500,
                windChance: 0.1,
                gravityInversionChance: 0,
                controlSensitivity: 1.0,
                trapDensity: 0.2,
                bulletSpeed: 0.4,
                hazardTypes: ['falling', 'bullet'],
                specialMechanics: []
            },
            3: {
                name: "The Tricks Begin",
                description: "Platforms start to betray you",
                platformSpawnRate: 1600,
                hazardSpawnRate: 4000,
                windChance: 0.2,
                gravityInversionChance: 0,
                controlSensitivity: 1.1,
                trapDensity: 0.3,
                bulletSpeed: 0.5,
                hazardTypes: ['falling', 'bullet', 'laser'],
                specialMechanics: ['platform_tricks']
            },
            4: {
                name: "Frustration Builds",
                description: "You're starting to hate this game",
                platformSpawnRate: 1400,
                hazardSpawnRate: 3500,
                windChance: 0.3,
                gravityInversionChance: 0.1,
                controlSensitivity: 1.2,
                trapDensity: 0.4,
                bulletSpeed: 0.6,
                hazardTypes: ['falling', 'bullet', 'laser'],
                specialMechanics: ['platform_tricks', 'wind_gusts']
            },
            5: {
                name: "Hidden Dangers",
                description: "Now you can't trust anything",
                platformSpawnRate: 1200,
                hazardSpawnRate: 3000,
                windChance: 0.4,
                gravityInversionChance: 0.2,
                controlSensitivity: 1.3,
                trapDensity: 0.5,
                bulletSpeed: 0.7,
                hazardTypes: ['falling', 'bullet', 'laser', 'hidden'],
                specialMechanics: ['platform_tricks', 'wind_gusts', 'hidden_traps']
            },
            6: {
                name: "Chaos Unleashed",
                description: "Everything is trying to kill you",
                platformSpawnRate: 1000,
                hazardSpawnRate: 2500,
                windChance: 0.5,
                gravityInversionChance: 0.3,
                controlSensitivity: 1.4,
                trapDensity: 0.6,
                bulletSpeed: 2.8,
                hazardTypes: ['falling', 'bullet', 'laser', 'hidden'],
                specialMechanics: ['platform_tricks', 'wind_gusts', 'hidden_traps', 'gravity_flip']
            },
            7: {
                name: "Trust Nothing",
                description: "Almost every platform is a lie",
                platformSpawnRate: 900,
                hazardSpawnRate: 2000,
                windChance: 0.6,
                gravityInversionChance: 0.4,
                controlSensitivity: 1.6,
                trapDensity: 0.7,
                bulletSpeed: 3.0,
                hazardTypes: ['falling', 'bullet', 'laser', 'hidden'],
                specialMechanics: ['platform_tricks', 'wind_gusts', 'hidden_traps', 'gravity_flip', 'decoy_bullets']
            },
            8: {
                name: "Maximum Frustration",
                description: "We're not sorry",
                platformSpawnRate: 800,
                hazardSpawnRate: 1800,
                windChance: 0.7,
                gravityInversionChance: 0.5,
                controlSensitivity: 1.8,
                trapDensity: 0.8,
                bulletSpeed: 3.2,
                hazardTypes: ['falling', 'bullet', 'laser', 'hidden'],
                specialMechanics: ['platform_tricks', 'wind_gusts', 'hidden_traps', 'gravity_flip', 'decoy_bullets', 'shrinking_zone']
            },
            9: {
                name: "Impossible Odds",
                description: "You should have quit by now",
                platformSpawnRate: 700,
                hazardSpawnRate: 1500,
                windChance: 0.8,
                gravityInversionChance: 0.6,
                controlSensitivity: 2.0,
                trapDensity: 0.9,
                bulletSpeed: 3.5,
                hazardTypes: ['falling', 'bullet', 'laser', 'hidden'],
                specialMechanics: ['platform_tricks', 'wind_gusts', 'hidden_traps', 'gravity_flip', 'decoy_bullets', 'shrinking_zone']
            },
            10: {
                name: "The Final Insult",
                description: "If you beat this, you're either lucky or insane",
                platformSpawnRate: 600,
                hazardSpawnRate: 1200,
                windChance: 0.9,
                gravityInversionChance: 0.7,
                controlSensitivity: 2.5,
                trapDensity: 0.95,
                bulletSpeed: 4.0,
                hazardTypes: ['falling', 'bullet', 'laser', 'hidden'],
                specialMechanics: ['platform_tricks', 'wind_gusts', 'hidden_traps', 'gravity_flip', 'decoy_bullets', 'shrinking_zone', 'control_chaos']
            }
        };
    }

    loadLevel(levelNumber) {
        this.currentLevel = levelNumber;
        const config = this.levelConfigs[levelNumber];

        if (!config) {
            console.warn(`Level ${levelNumber} not found, using level 10 config`);
            config = this.levelConfigs[10];
        }

        // Apply level configuration to game
        this.applyLevelConfig(config);

        // Spawn initial hazards
        this.spawnInitialHazards(config);

        // Set up level-specific mechanics
        this.setupSpecialMechanics(config);

        console.log(`Loaded Level ${levelNumber}: ${config.name}`);
    }

    applyLevelConfig(config) {
        // Update game timers
        this.game.platformSpawnInterval = config.platformSpawnRate;

        // Update physics settings
        this.game.physics.setControlSensitivity(config.controlSensitivity);

        // Update hazard spawn rates (will be used by game loop)
        this.game.hazardSpawnRate = config.hazardSpawnRate;
        this.game.currentLevelConfig = config;
    }

    spawnInitialHazards(config) {
        // Always spawn the chasing bullet from below (further away)
        const bullet = new ChasingBullet(this.game.width / 2, this.game.height + 150);
        bullet.speed = config.bulletSpeed;
        this.game.hazards.push(bullet);

        // Spawn some initial falling objects
        for (let i = 0; i < 3; i++) {
            const x = Utils.random(50, this.game.width - 50);
            const y = Utils.random(-200, -50);
            this.game.hazards.push(new FallingObject(x, y));
        }

        // Spawn lasers based on level
        if (config.hazardTypes.includes('laser') && this.currentLevel >= 3) {
            this.spawnLasers(config);
        }

        // Spawn hidden traps
        if (config.hazardTypes.includes('hidden') && this.currentLevel >= 5) {
            this.spawnHiddenTraps(config);
        }
    }

    spawnLasers(config) {
        const laserCount = Math.min(3, Math.floor(this.currentLevel / 2));

        for (let i = 0; i < laserCount; i++) {
            const isHorizontal = Math.random() > 0.5;
            let x, y;

            if (isHorizontal) {
                x = 0;
                y = Utils.random(100, this.game.height - 100);
            } else {
                x = Utils.random(100, this.game.width - 100);
                y = 0;
            }

            const laser = new Laser(x, y, isHorizontal ? 'horizontal' : 'vertical');
            this.game.hazards.push(laser);
        }
    }

    spawnHiddenTraps(config) {
        const trapCount = Math.floor(config.trapDensity * 10);

        for (let i = 0; i < trapCount; i++) {
            const x = Utils.random(50, this.game.width - 50);
            const y = Utils.random(100, this.game.height - 200);
            const trapType = Utils.choose(['spikes', 'pit', 'explosion']);

            const trap = new HiddenTrap(x, y, trapType);
            this.game.hazards.push(trap);
        }
    }

    setupSpecialMechanics(config) {
        config.specialMechanics.forEach(mechanic => {
            switch (mechanic) {
                case 'wind_gusts':
                    this.setupWindGusts(config);
                    break;
                case 'gravity_flip':
                    this.setupGravityFlips(config);
                    break;
                case 'decoy_bullets':
                    this.setupDecoyBullets(config);
                    break;
                case 'shrinking_zone':
                    this.setupShrinkingZone(config);
                    break;
                case 'control_chaos':
                    this.setupControlChaos(config);
                    break;
            }
        });
    }

    setupWindGusts(config) {
        const windInterval = Utils.random(5000, 10000);

        setInterval(() => {
            if (this.game.state === 'playing' && Math.random() < config.windChance) {
                const force = Utils.random(0.3, 0.8);
                const direction = Utils.choose([-1, 1]);
                const duration = Utils.random(2000, 4000);

                this.game.physics.applyWindGust(force, direction, duration);
            }
        }, windInterval);
    }

    setupGravityFlips(config) {
        const flipInterval = Utils.random(15000, 25000);

        setInterval(() => {
            if (this.game.state === 'playing' && Math.random() < config.gravityInversionChance) {
                const duration = Utils.random(3000, 6000);
                this.game.physics.invertGravity(duration);
            }
        }, flipInterval);
    }

    setupDecoyBullets(config) {
        // Spawn additional fake bullets
        for (let i = 0; i < 2; i++) {
            const bullet = new ChasingBullet(
                Utils.random(100, this.game.width - 100),
                this.game.height + Utils.random(50, 150)
            );
            bullet.isReal = false;
            bullet.color = '#ff8888'; // Slightly different color
            bullet.speed = config.bulletSpeed * 0.8; // Slower
            this.game.hazards.push(bullet);
        }
    }

    setupShrinkingZone(config) {
        // Gradually reduce playable area
        const shrinkRate = 0.5; // pixels per second

        setInterval(() => {
            if (this.game.state === 'playing') {
                this.game.bounds.left += shrinkRate;
                this.game.bounds.right -= shrinkRate;

                // Reset if too small
                if (this.game.bounds.right - this.game.bounds.left < 200) {
                    this.game.bounds.left = -100;
                    this.game.bounds.right = this.game.width + 100;
                }
            }
        }, 1000);
    }

    setupControlChaos(config) {
        // Randomly change control sensitivity
        setInterval(() => {
            if (this.game.state === 'playing') {
                const newSensitivity = Utils.random(0.5, 3.0);
                this.game.physics.setControlSensitivity(newSensitivity);

                // Reset after a short time
                setTimeout(() => {
                    this.game.physics.setControlSensitivity(config.controlSensitivity);
                }, Utils.random(2000, 5000));
            }
        }, Utils.random(8000, 15000));
    }

    // Continuous hazard spawning during gameplay
    updateHazardSpawning(deltaTime) {
        const config = this.game.currentLevelConfig;
        if (!config) return;

        // Spawn falling objects
        if (Math.random() < 0.001 * (deltaTime / 16.67)) {
            const x = Utils.random(0, this.game.width);
            const y = -50;
            this.game.hazards.push(new FallingObject(x, y));
        }

        // Spawn additional bullets on higher levels
        if (this.currentLevel >= 7 && Math.random() < 0.0005 * (deltaTime / 16.67)) {
            const bullet = new ChasingBullet(
                Utils.random(100, this.game.width - 100),
                this.game.height + 100
            );
            bullet.speed = config.bulletSpeed;
            this.game.hazards.push(bullet);
        }
    }

    // Get level info for UI
    getLevelInfo(levelNumber = this.currentLevel) {
        const config = this.levelConfigs[levelNumber];
        return config ? {
            name: config.name,
            description: config.description,
            difficulty: this.calculateDifficulty(config)
        } : null;
    }

    calculateDifficulty(config) {
        // Calculate difficulty score based on various factors
        const factors = [
            config.controlSensitivity,
            config.trapDensity,
            config.bulletSpeed / 4,
            config.specialMechanics.length / 7,
            (5000 - config.platformSpawnRate) / 5000
        ];

        const avgFactor = factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
        return Math.min(10, Math.floor(avgFactor * 10));
    }

    // Check if level is complete
    isLevelComplete() {
        // Level complete conditions can be customized per level
        const config = this.game.currentLevelConfig;
        if (!config) return false;

        // Default: survive for certain time or reach certain height
        const timeThreshold = 60000; // 60 seconds
        const heightThreshold = -500;

        return this.game.gameTime > timeThreshold ||
            (this.game.player && this.game.player.position.y < heightThreshold);
    }
}

// Make class globally available for browser
if (typeof window !== 'undefined') {
    window.LevelManager = LevelManager;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LevelManager;
}
