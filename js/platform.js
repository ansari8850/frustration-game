// Platform class with frustration mechanics

class Platform {
    constructor(x, y, level = 1, randomSeed = 0) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.size = { width: 100, height: 20 };
        this.bounds = { x: x, y: y, width: this.size.width, height: this.size.height };

        // Platform properties
        this.level = level;
        this.randomSeed = randomSeed;
        this.color = '#666666';
        this.originalColor = '#666666';

        // Movement
        this.moveSpeed = Utils.random(0.5, 2);
        this.moveDirection = Utils.choose([-1, 1]);
        this.moveRange = Utils.random(100, 200);
        this.startX = x;

        // Platform behavior type
        this.behaviorType = this.determineBehaviorType();
        this.hasTriggered = false;
        this.triggerDelay = Utils.random(100, 500); // ms before triggering
        this.triggerTimer = 0;

        // Visual effects
        this.rotation = 0;
        this.targetRotation = 0;
        this.rotationSpeed = 0;
        this.isTilting = false;
        this.scale = 1;
        this.opacity = 1;
        this.glowIntensity = 0;

        // Spikes
        this.spikes = [];
        this.spikeHeight = 0;
        this.targetSpikeHeight = 0;

        // Fake platform
        this.isFake = this.behaviorType === 'fake';
        this.revealTimer = 0;
        this.isRevealed = false;

        // Disappearing platform
        this.disappearTimer = 0;
        this.isDisappearing = false;

        this.updateBounds();
        this.setupBehavior();
    }

    determineBehaviorType() {
        // Use random seed for consistent behavior per attempt
        const random = this.seededRandom();
        const difficultyFactor = Math.min(this.level / 10, 1);

        // Increase frustration mechanics based on level
        if (this.level >= 7) {
            // Level 7+: Almost every platform has a trick
            if (random < 0.9) {
                return Utils.choose(['bend', 'flip', 'spikes', 'disappear', 'fake']);
            }
        } else if (this.level >= 5) {
            // Level 5-6: Hidden traps introduced
            if (random < 0.6) {
                return Utils.choose(['bend', 'flip', 'spikes', 'disappear', 'fake']);
            }
        } else if (this.level >= 3) {
            // Level 3-4: Some tricks
            if (random < 0.4) {
                return Utils.choose(['bend', 'flip', 'spikes', 'disappear']);
            }
        } else {
            // Level 1-2: Basic mechanics
            if (random < 0.2) {
                return Utils.choose(['bend', 'flip']);
            }
        }

        return 'normal';
    }

    seededRandom() {
        // Simple seeded random for consistent behavior
        const seed = this.randomSeed + this.position.x + this.position.y;
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    setupBehavior() {
        switch (this.behaviorType) {
            case 'fake':
                this.opacity = 0.1; // Nearly invisible
                this.color = 'rgba(102, 102, 102, 0.1)';
                break;
            case 'spikes':
                this.color = '#444444';
                this.setupSpikes();
                break;
            case 'disappear':
                this.color = '#888888';
                break;
            case 'bend':
                this.color = '#555555';
                break;
            case 'flip':
                this.color = '#777777';
                break;
            default:
                this.color = '#666666';
                break;
        }
        this.originalColor = this.color;
    }

    setupSpikes() {
        const spikeCount = Math.floor(this.size.width / 15);
        for (let i = 0; i < spikeCount; i++) {
            this.spikes.push({
                x: i * 15 + 7.5,
                y: 0,
                width: 8,
                height: 0
            });
        }
    }

    update(deltaTime) {
        // Update movement
        this.updateMovement(deltaTime);

        // Update behavior-specific logic
        this.updateBehavior(deltaTime);

        // Update visual effects
        this.updateVisuals(deltaTime);

        // Update bounds
        this.updateBounds();
    }

    updateMovement(deltaTime) {
        // Horizontal movement
        this.position.x += this.moveDirection * this.moveSpeed * deltaTime / 16.67;

        // Reverse direction if moved too far
        if (Math.abs(this.position.x - this.startX) > this.moveRange) {
            this.moveDirection *= -1;
        }

        // Keep within screen bounds
        if (this.position.x < 0 || this.position.x + this.size.width > 800) {
            this.moveDirection *= -1;
        }

        // Slow downward drift
        this.position.y += 0.2 * deltaTime / 16.67;
    }

    updateBehavior(deltaTime) {
        if (this.hasTriggered) {
            this.triggerTimer += deltaTime;

            switch (this.behaviorType) {
                case 'bend':
                    this.updateBending(deltaTime);
                    break;
                case 'flip':
                    this.updateFlipping(deltaTime);
                    break;
                case 'spikes':
                    this.updateSpikes(deltaTime);
                    break;
                case 'disappear':
                    this.updateDisappearing(deltaTime);
                    break;
                case 'fake':
                    this.updateFake(deltaTime);
                    break;
            }
        }

        // Fake platform reveal logic
        if (this.isFake && !this.isRevealed) {
            this.revealTimer += deltaTime;
            if (this.revealTimer > 2000) { // Reveal after 2 seconds
                this.reveal();
            }
        }
    }

    updateBending(deltaTime) {
        if (this.triggerTimer > this.triggerDelay) {
            this.targetRotation = Utils.random(-0.5, 0.5);
            this.rotationSpeed = this.targetRotation / 500; // Rotate over 500ms
            this.isTilting = true;
        }

        if (this.isTilting) {
            this.rotation += this.rotationSpeed * deltaTime;
            if (Math.abs(this.rotation - this.targetRotation) < 0.01) {
                this.rotation = this.targetRotation;
                this.isTilting = false;
            }
        }
    }

    updateFlipping(deltaTime) {
        if (this.triggerTimer > this.triggerDelay) {
            this.targetRotation = Math.PI; // 180 degrees
            this.rotationSpeed = 0.02;
            this.isTilting = true;
        }

        if (this.isTilting) {
            this.rotation += this.rotationSpeed * deltaTime;
            if (this.rotation >= this.targetRotation) {
                this.rotation = this.targetRotation;
                this.isTilting = false;
            }
        }
    }

    updateSpikes(deltaTime) {
        if (this.triggerTimer > this.triggerDelay) {
            this.targetSpikeHeight = 20;
            this.color = '#ff4444';
        }

        // Animate spikes growing
        if (this.spikeHeight < this.targetSpikeHeight) {
            this.spikeHeight += 0.5 * deltaTime / 16.67;
            this.spikes.forEach(spike => {
                spike.height = this.spikeHeight;
            });
        }
    }

    updateDisappearing(deltaTime) {
        if (this.triggerTimer > this.triggerDelay) {
            this.isDisappearing = true;
        }

        if (this.isDisappearing) {
            this.opacity -= 0.02 * deltaTime / 16.67;
            this.scale -= 0.01 * deltaTime / 16.67;

            if (this.opacity <= 0) {
                this.opacity = 0;
                this.scale = 0;
            }
        }
    }

    updateFake(deltaTime) {
        if (this.isRevealed && this.triggerTimer > this.triggerDelay) {
            // Quickly disappear after being revealed
            this.opacity -= 0.05 * deltaTime / 16.67;
            if (this.opacity <= 0) {
                this.opacity = 0;
            }
        }
    }

    updateVisuals(deltaTime) {
        // Pulsing glow for dangerous platforms
        if (this.behaviorType === 'spikes' && this.hasTriggered) {
            this.glowIntensity = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
        }

        // Warning flash before triggering
        if (this.hasTriggered && this.triggerTimer < this.triggerDelay) {
            const flashSpeed = Math.max(0.1, this.triggerDelay / 1000);
            const flash = Math.sin(this.triggerTimer * flashSpeed) > 0;
            if (flash && this.behaviorType !== 'fake') {
                this.color = '#ffff00'; // Warning yellow
            } else {
                this.color = this.originalColor;
            }
        }
    }

    updateBounds() {
        this.bounds.x = this.position.x;
        this.bounds.y = this.position.y;
        this.bounds.width = this.size.width * this.scale;
        this.bounds.height = this.size.height * this.scale;

        // Disable collision for disappeared platforms
        if (this.opacity <= 0 || this.scale <= 0) {
            this.bounds.width = 0;
            this.bounds.height = 0;
        }
    }

    render(ctx) {
        if (this.opacity <= 0) return;

        ctx.save();

        // Apply opacity
        ctx.globalAlpha = this.opacity;

        // Move to platform center for rotation
        const centerX = this.position.x + this.size.width / 2;
        const centerY = this.position.y + this.size.height / 2;
        ctx.translate(centerX, centerY);

        // Apply rotation and scale
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);

        // Apply glow effect
        if (this.glowIntensity > 0) {
            ctx.shadowColor = '#ff4444';
            ctx.shadowBlur = this.glowIntensity * 20;
        }

        // Render platform
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size.width / 2, -this.size.height / 2, this.size.width, this.size.height);

        // Render platform border
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 1;
        ctx.strokeRect(-this.size.width / 2, -this.size.height / 2, this.size.width, this.size.height);

        // Render spikes
        if (this.behaviorType === 'spikes' && this.spikeHeight > 0) {
            this.renderSpikes(ctx);
        }

        ctx.restore();

        // Render debug info
        if (window.DEBUG) {
            this.renderDebug(ctx);
        }
    }

    renderSpikes(ctx) {
        ctx.fillStyle = '#ff0000';
        this.spikes.forEach(spike => {
            const x = spike.x - this.size.width / 2;
            const y = -this.size.height / 2 - spike.height;

            // Draw triangle spike
            ctx.beginPath();
            ctx.moveTo(x, -this.size.height / 2);
            ctx.lineTo(x + spike.width / 2, y);
            ctx.lineTo(x + spike.width, -this.size.height / 2);
            ctx.closePath();
            ctx.fill();
        });
    }

    renderDebug(ctx) {
        // Render bounding box
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

        // Render behavior type
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.fillText(this.behaviorType, this.position.x, this.position.y - 5);
    }

    // Called when player lands on platform
    onPlayerLand(player) {
        if (!this.hasTriggered) {
            this.hasTriggered = true;
            this.triggerTimer = 0;

            // Immediate effects for some behaviors
            if (this.behaviorType === 'spikes' && this.level >= 8) {
                // Instant spikes on higher levels
                this.triggerDelay = 0;
            }
        }

        // Apply platform-specific effects to player
        this.applyEffectsToPlayer(player);
    }

    applyEffectsToPlayer(player) {
        switch (this.behaviorType) {
            case 'bend':
                // Push player in tilt direction
                if (this.isTilting) {
                    const pushForce = this.targetRotation * 3;
                    player.velocity.x += pushForce;
                }
                break;
            case 'flip':
                // Launch player when flipping
                if (this.isTilting && this.rotation > Math.PI / 2) {
                    player.velocity.y = -8;
                    player.velocity.x += Utils.random(-3, 3);
                }
                break;
            case 'spikes':
                // Damage player if spikes are up
                if (this.spikeHeight > 10) {
                    // This will be handled by collision detection in the game
                }
                break;
        }
    }

    reveal() {
        if (this.isFake) {
            this.isRevealed = true;
            this.opacity = 0.8;
            this.color = 'rgba(255, 255, 0, 0.8)'; // Yellow warning

            // Start disappearing after brief reveal
            setTimeout(() => {
                this.hasTriggered = true;
                this.triggerTimer = 0;
                this.triggerDelay = 500; // Quick disappear
            }, 200);
        }
    }

    // Check if platform is solid (can be stood on)
    isSolid() {
        return this.opacity > 0.5 && this.scale > 0.5 && this.spikeHeight < 5;
    }

    // Check if platform is dangerous
    isDangerous() {
        return this.behaviorType === 'spikes' && this.spikeHeight > 10;
    }
}

// Make class globally available for browser
if (typeof window !== 'undefined') {
    window.Platform = Platform;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Platform;
}
