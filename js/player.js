// Player character class

class Player {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.size = { width: 20, height: 30 };
        this.bounds = { x: x, y: y, width: this.size.width, height: this.size.height };

        // Player state
        this.onGround = false;
        this.canJump = true;
        this.health = 100;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;

        // Auto-jump mechanics
        this.autoJumpTimer = 0;
        this.autoJumpInterval = 800; // ms between auto jumps
        this.autoJumpEnabled = true;

        // Visual properties
        this.color = '#00ffff';
        this.glowColor = 'rgba(0, 255, 255, 0.5)';
        this.rotation = 0;
        this.scale = 1;
        this.animationTime = 0;

        // Trail effect
        this.trail = [];
        this.maxTrailLength = 10;

        // Frustration feedback
        this.deathAnimationTime = 0;
        this.isDeathAnimation = false;

        this.updateBounds();
    }

    update(deltaTime) {
        this.animationTime += deltaTime;

        // Handle invulnerability
        if (this.invulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
        }

        // Auto-jump mechanic
        if (this.autoJumpEnabled && this.onGround) {
            this.autoJumpTimer += deltaTime;
            if (this.autoJumpTimer >= this.autoJumpInterval) {
                this.autoJump();
                this.autoJumpTimer = 0;
            }
        }

        // Update trail
        this.updateTrail();

        // Update visual effects
        this.updateVisuals(deltaTime);

        // Update bounds
        this.updateBounds();

        // Reset ground state (will be set by collision detection)
        this.onGround = false;
    }

    autoJump() {
        if (this.canJump && this.onGround) {
            this.velocity.y = -12; // Jump force
            this.canJump = false;
            this.onGround = false;

            // Visual feedback for auto-jump
            this.scale = 1.2;
            this.rotation = Utils.random(-0.2, 0.2);

            // Reset jump availability quickly for continuous jumping
            setTimeout(() => {
                if (!this.onGround) {
                    this.canJump = true;
                }
            }, 100);
        }
    }

    updateTrail() {
        // Add current position to trail
        this.trail.push({
            x: this.position.x + this.size.width / 2,
            y: this.position.y + this.size.height / 2,
            time: Date.now()
        });

        // Remove old trail points
        const now = Date.now();
        this.trail = this.trail.filter(point => now - point.time < 500);

        // Limit trail length
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }

    updateVisuals(deltaTime) {
        // Smooth scale back to normal
        this.scale = Utils.lerp(this.scale, 1, 0.1);

        // Smooth rotation back to normal
        this.rotation = Utils.lerp(this.rotation, 0, 0.1);

        // Pulsing glow effect
        const glowIntensity = 0.5 + Math.sin(this.animationTime * 0.005) * 0.3;
        this.glowColor = `rgba(0, 255, 255, ${glowIntensity})`;

        // Invulnerability flashing
        if (this.invulnerable) {
            const flashSpeed = 0.1;
            const flash = Math.sin(this.animationTime * flashSpeed) > 0;
            this.color = flash ? '#ffffff' : '#00ffff';
        } else {
            this.color = '#00ffff';
        }

        // Death animation
        if (this.isDeathAnimation) {
            this.deathAnimationTime += deltaTime;
            this.rotation += 0.2;
            this.scale = Math.max(0, 1 - this.deathAnimationTime / 1000);
        }
    }

    updateBounds() {
        this.bounds.x = this.position.x;
        this.bounds.y = this.position.y;
        this.bounds.width = this.size.width;
        this.bounds.height = this.size.height;
    }

    render(ctx) {
        ctx.save();

        // Render trail
        this.renderTrail(ctx);

        // Move to player center for rotation
        const centerX = this.position.x + this.size.width / 2;
        const centerY = this.position.y + this.size.height / 2;
        ctx.translate(centerX, centerY);

        // Apply rotation and scale
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);

        // Render glow effect
        if (!this.isDeathAnimation) {
            ctx.shadowColor = this.glowColor;
            ctx.shadowBlur = 15;
        }

        // Render player body
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size.width / 2, -this.size.height / 2, this.size.width, this.size.height);

        // Render player details (eyes, etc.)
        if (!this.isDeathAnimation) {
            // Eyes
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-6, -10, 3, 3);
            ctx.fillRect(3, -10, 3, 3);

            // Pupils
            ctx.fillStyle = '#000000';
            ctx.fillRect(-5, -9, 1, 1);
            ctx.fillRect(4, -9, 1, 1);

            // Mouth (changes based on state)
            ctx.fillStyle = this.onGround ? '#00ff00' : '#ffff00';
            ctx.fillRect(-3, 2, 6, 2);
        }

        ctx.restore();

        // Render debug info if needed
        if (window.DEBUG) {
            this.renderDebug(ctx);
        }
    }

    renderTrail(ctx) {
        if (this.trail.length < 2) return;

        ctx.save();

        for (let i = 0; i < this.trail.length - 1; i++) {
            const point = this.trail[i];
            const alpha = (i / this.trail.length) * 0.5;
            const size = (i / this.trail.length) * 8;

            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;
            ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
        }

        ctx.restore();
    }

    renderDebug(ctx) {
        // Render bounding box
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

        // Render velocity vector
        ctx.strokeStyle = '#00ff00';
        ctx.beginPath();
        ctx.moveTo(this.position.x + this.size.width / 2, this.position.y + this.size.height / 2);
        ctx.lineTo(
            this.position.x + this.size.width / 2 + this.velocity.x * 5,
            this.position.y + this.size.height / 2 + this.velocity.y * 5
        );
        ctx.stroke();

        // Render state info
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText(`Ground: ${this.onGround}`, this.position.x, this.position.y - 20);
        ctx.fillText(`Jump: ${this.canJump}`, this.position.x, this.position.y - 35);
    }

    // Player actions
    jump() {
        if (this.canJump) {
            this.velocity.y = -12;
            this.canJump = false;
            this.onGround = false;

            // Visual feedback
            this.scale = 1.3;
            this.rotation = Utils.random(-0.3, 0.3);
        }
    }

    takeDamage(amount = 1) {
        if (this.invulnerable) return false;

        this.health -= amount;
        this.makeInvulnerable(1000); // 1 second invulnerability

        // Visual feedback
        this.scale = 0.8;
        this.rotation = Utils.random(-0.5, 0.5);

        return true;
    }

    makeInvulnerable(duration) {
        this.invulnerable = true;
        this.invulnerabilityTime = duration;
    }

    heal(amount) {
        this.health = Math.min(100, this.health + amount);
    }

    reset(x, y) {
        this.position.set(x, y);
        this.velocity.set(0, 0);
        this.onGround = false;
        this.canJump = true;
        this.health = 100;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.autoJumpTimer = 0;
        this.rotation = 0;
        this.scale = 1;
        this.trail = [];
        this.isDeathAnimation = false;
        this.deathAnimationTime = 0;
        this.updateBounds();
    }

    startDeathAnimation() {
        this.isDeathAnimation = true;
        this.deathAnimationTime = 0;
    }

    // Getters for game logic
    get isDead() {
        return this.health <= 0;
    }

    get center() {
        return new Vector2(
            this.position.x + this.size.width / 2,
            this.position.y + this.size.height / 2
        );
    }

    // Frustration mechanics
    setAutoJumpInterval(interval) {
        this.autoJumpInterval = interval;
    }

    enableAutoJump(enabled) {
        this.autoJumpEnabled = enabled;
    }

    // Special effects
    addSpeedBoost(duration = 2000) {
        const originalColor = this.color;
        this.color = '#ffff00';

        setTimeout(() => {
            this.color = originalColor;
        }, duration);
    }

    addShield(duration = 3000) {
        this.makeInvulnerable(duration);
        const originalGlow = this.glowColor;
        this.glowColor = 'rgba(0, 255, 0, 0.8)';

        setTimeout(() => {
            this.glowColor = originalGlow;
        }, duration);
    }
}

// Make class globally available for browser
if (typeof window !== 'undefined') {
    window.Player = Player;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Player;
}
