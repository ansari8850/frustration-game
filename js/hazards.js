// Hazard classes for frustration mechanics

// Base Hazard class
class Hazard {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.size = { width: 10, height: 10 };
        this.bounds = { x: x, y: y, width: this.size.width, height: this.size.height };
        this.color = '#ff0000';
        this.active = true;
        this.damage = 1;
    }

    update(deltaTime, player) {
        this.updateBounds();
    }

    updateBounds() {
        this.bounds.x = this.position.x;
        this.bounds.y = this.position.y;
        this.bounds.width = this.size.width;
        this.bounds.height = this.size.height;
    }

    render(ctx) {
        if (!this.active) return;

        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
    }
}

// Chasing Bullet - constantly follows player from below
class ChasingBullet extends Hazard {
    constructor(x, y) {
        super(x, y);
        this.size = { width: 15, height: 15 };
        this.speed = 2;
        this.color = '#ff4444';
        this.glowColor = 'rgba(255, 68, 68, 0.8)';
        this.trail = [];
        this.maxTrailLength = 8;
        this.isReal = true; // For decoy mechanics
    }

    update(deltaTime, player) {
        if (!this.active || !player) return;

        // Calculate direction to player
        const dx = player.position.x + player.size.width / 2 - (this.position.x + this.size.width / 2);
        const dy = player.position.y + player.size.height / 2 - (this.position.y + this.size.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            // Move towards player
            this.velocity.x = (dx / distance) * this.speed;
            this.velocity.y = (dy / distance) * this.speed;

            // Bias towards coming from below
            if (this.position.y > player.position.y) {
                this.velocity.y *= 0.7; // Slower when above player
            }
        }

        // Update position
        this.position.x += this.velocity.x * deltaTime / 16.67;
        this.position.y += this.velocity.y * deltaTime / 16.67;

        // Update trail
        this.updateTrail();

        super.update(deltaTime, player);
    }

    updateTrail() {
        this.trail.push({
            x: this.position.x + this.size.width / 2,
            y: this.position.y + this.size.height / 2,
            time: Date.now()
        });

        // Remove old trail points
        const now = Date.now();
        this.trail = this.trail.filter(point => now - point.time < 300);

        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }

    render(ctx) {
        if (!this.active) return;

        // Render trail
        this.renderTrail(ctx);

        // Render glow effect
        ctx.save();
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 15;

        // Render bullet
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(
            this.position.x + this.size.width / 2,
            this.position.y + this.size.height / 2,
            this.size.width / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Render inner core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(
            this.position.x + this.size.width / 2,
            this.position.y + this.size.height / 2,
            this.size.width / 4,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.restore();
    }

    renderTrail(ctx) {
        if (this.trail.length < 2) return;

        ctx.save();

        for (let i = 0; i < this.trail.length - 1; i++) {
            const point = this.trail[i];
            const alpha = (i / this.trail.length) * 0.6;
            const size = (i / this.trail.length) * 8;

            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;
            ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
        }

        ctx.restore();
    }
}

// Falling Object - random debris from above
class FallingObject extends Hazard {
    constructor(x, y) {
        super(x, y);
        this.size = { width: Utils.random(8, 20), height: Utils.random(8, 20) };
        this.velocity.y = Utils.random(2, 5);
        this.velocity.x = Utils.random(-1, 1);
        this.rotation = 0;
        this.rotationSpeed = Utils.random(-0.1, 0.1);
        this.color = Utils.choose(['#ff6600', '#ff8800', '#ffaa00', '#cc4400']);
        this.type = Utils.choose(['rock', 'fireball', 'debris']);
        this.gravity = 0.1;
    }

    update(deltaTime, player) {
        if (!this.active) return;

        // Apply gravity
        this.velocity.y += this.gravity * deltaTime / 16.67;

        // Update position
        this.position.x += this.velocity.x * deltaTime / 16.67;
        this.position.y += this.velocity.y * deltaTime / 16.67;

        // Update rotation
        this.rotation += this.rotationSpeed * deltaTime / 16.67;

        // Deactivate if off screen
        if (this.position.y > 700) {
            this.active = false;
        }

        super.update(deltaTime, player);
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();

        // Move to center for rotation
        const centerX = this.position.x + this.size.width / 2;
        const centerY = this.position.y + this.size.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);

        // Render based on type
        switch (this.type) {
            case 'fireball':
                // Glow effect
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 10;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(0, 0, this.size.width / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'rock':
                ctx.fillStyle = '#666666';
                ctx.fillRect(-this.size.width / 2, -this.size.height / 2, this.size.width, this.size.height);
                break;
            default:
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.size.width / 2, -this.size.height / 2, this.size.width, this.size.height);
                break;
        }

        ctx.restore();
    }
}

// Laser Beam - toggles on/off across screen
class Laser extends Hazard {
    constructor(x, y, direction = 'horizontal') {
        super(x, y);
        this.direction = direction;
        this.isOn = false;
        this.toggleTimer = 0;
        this.toggleInterval = Utils.random(2000, 4000); // ms
        this.warningTime = 1000; // ms warning before activation
        this.isWarning = false;
        this.beamWidth = 8;
        this.length = direction === 'horizontal' ? 800 : 600;

        if (direction === 'horizontal') {
            this.size = { width: this.length, height: this.beamWidth };
        } else {
            this.size = { width: this.beamWidth, height: this.length };
        }

        this.color = '#ff0000';
        this.warningColor = '#ffff00';
    }

    update(deltaTime, player) {
        if (!this.active) return;

        this.toggleTimer += deltaTime;

        // Warning phase
        if (this.toggleTimer > this.toggleInterval - this.warningTime && !this.isWarning && !this.isOn) {
            this.isWarning = true;
        }

        // Toggle laser on/off
        if (this.toggleTimer >= this.toggleInterval) {
            this.isOn = !this.isOn;
            this.isWarning = false;
            this.toggleTimer = 0;
            this.toggleInterval = Utils.random(2000, 4000);
        }

        super.update(deltaTime, player);
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();

        if (this.isWarning) {
            // Warning flash
            const flash = Math.sin(Date.now() * 0.02) > 0;
            if (flash) {
                ctx.fillStyle = this.warningColor;
                ctx.globalAlpha = 0.5;
                ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
            }
        } else if (this.isOn) {
            // Active laser beam
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 20;
            ctx.fillStyle = this.color;
            ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);

            // Inner bright core
            ctx.fillStyle = '#ffffff';
            if (this.direction === 'horizontal') {
                ctx.fillRect(this.position.x, this.position.y + 2, this.size.width, this.size.height - 4);
            } else {
                ctx.fillRect(this.position.x + 2, this.position.y, this.size.width - 4, this.size.height);
            }
        }

        ctx.restore();
    }

    // Override bounds for active laser
    updateBounds() {
        if (this.isOn) {
            this.bounds.x = this.position.x;
            this.bounds.y = this.position.y;
            this.bounds.width = this.size.width;
            this.bounds.height = this.size.height;
        } else {
            // No collision when off
            this.bounds.width = 0;
            this.bounds.height = 0;
        }
    }
}

// Hidden Trap - invisible until triggered
class HiddenTrap extends Hazard {
    constructor(x, y, trapType = 'spikes') {
        super(x, y);
        this.trapType = trapType;
        this.isTriggered = false;
        this.isVisible = false;
        this.triggerRadius = 30;
        this.animationTime = 0;
        this.size = { width: 40, height: 20 };

        switch (trapType) {
            case 'spikes':
                this.color = '#ff0000';
                break;
            case 'pit':
                this.color = '#000000';
                break;
            case 'explosion':
                this.color = '#ff8800';
                break;
        }
    }

    update(deltaTime, player) {
        if (!this.active || !player) return;

        // Check if player is near
        const distance = Utils.distance(
            player.position.x + player.size.width / 2,
            player.position.y + player.size.height / 2,
            this.position.x + this.size.width / 2,
            this.position.y + this.size.height / 2
        );

        if (distance < this.triggerRadius && !this.isTriggered) {
            this.trigger();
        }

        if (this.isTriggered) {
            this.animationTime += deltaTime;
            this.isVisible = true;
        }

        super.update(deltaTime, player);
    }

    trigger() {
        this.isTriggered = true;
        this.isVisible = true;

        // Different trigger effects based on type
        switch (this.trapType) {
            case 'explosion':
                // Create explosion particles
                this.createExplosion();
                break;
        }
    }

    createExplosion() {
        // This would create particle effects
        // For now, just visual feedback
        this.size.width = 60;
        this.size.height = 60;
    }

    render(ctx) {
        if (!this.active || !this.isVisible) return;

        ctx.save();

        switch (this.trapType) {
            case 'spikes':
                this.renderSpikes(ctx);
                break;
            case 'pit':
                this.renderPit(ctx);
                break;
            case 'explosion':
                this.renderExplosion(ctx);
                break;
        }

        ctx.restore();
    }

    renderSpikes(ctx) {
        const spikeCount = 5;
        const spikeWidth = this.size.width / spikeCount;

        ctx.fillStyle = this.color;
        for (let i = 0; i < spikeCount; i++) {
            const x = this.position.x + i * spikeWidth;
            const y = this.position.y;

            ctx.beginPath();
            ctx.moveTo(x, y + this.size.height);
            ctx.lineTo(x + spikeWidth / 2, y);
            ctx.lineTo(x + spikeWidth, y + this.size.height);
            ctx.closePath();
            ctx.fill();
        }
    }

    renderPit(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);

        // Add depth effect
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.position.x + 5, this.position.y + 5, this.size.width - 10, this.size.height - 10);
    }

    renderExplosion(ctx) {
        const pulseSize = 1 + Math.sin(this.animationTime * 0.02) * 0.3;

        ctx.save();
        ctx.translate(this.position.x + this.size.width / 2, this.position.y + this.size.height / 2);
        ctx.scale(pulseSize, pulseSize);

        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size.width / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Override bounds for triggered traps
    updateBounds() {
        if (this.isTriggered) {
            super.updateBounds();
        } else {
            // No collision when not triggered
            this.bounds.width = 0;
            this.bounds.height = 0;
        }
    }
}

// Make classes globally available for browser
if (typeof window !== 'undefined') {
    window.Hazard = Hazard;
    window.ChasingBullet = ChasingBullet;
    window.FallingObject = FallingObject;
    window.Laser = Laser;
    window.HiddenTrap = HiddenTrap;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Hazard, ChasingBullet, FallingObject, Laser, HiddenTrap };
}
