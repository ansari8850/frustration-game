// Physics engine for the game

class Physics {
    constructor() {
        this.gravity = 0.8;
        this.friction = 0.85;
        this.airResistance = 0.98;
        this.terminalVelocity = 15;
        this.jumpForce = -12;
        this.moveSpeed = 0.5;
        this.maxMoveSpeed = 4;

        // Frustration mechanics
        this.windForce = 0;
        this.windDirection = 1; // 1 for right, -1 for left
        this.gravityInverted = false;
        this.controlSensitivity = 1.0; // Increases in later levels for frustration
    }

    // Apply physics to an entity
    updateEntity(entity, deltaTime = 1) {
        // Apply gravity
        const gravityDirection = this.gravityInverted ? -1 : 1;
        entity.velocity.y += this.gravity * gravityDirection * deltaTime;

        // Apply wind force
        if (this.windForce > 0) {
            entity.velocity.x += this.windForce * this.windDirection * deltaTime;
        }

        // Apply air resistance
        entity.velocity.x *= this.airResistance;
        entity.velocity.y *= this.airResistance;

        // Clamp to terminal velocity
        entity.velocity.y = Utils.clamp(entity.velocity.y, -this.terminalVelocity, this.terminalVelocity);
        entity.velocity.x = Utils.clamp(entity.velocity.x, -this.maxMoveSpeed * 2, this.maxMoveSpeed * 2);

        // Update position
        entity.position.x += entity.velocity.x * deltaTime;
        entity.position.y += entity.velocity.y * deltaTime;

        // Update bounding box
        if (entity.updateBounds) {
            entity.updateBounds();
        }
    }

    // Check collision between two entities
    checkCollision(entity1, entity2) {
        if (!entity1.bounds || !entity2.bounds) return false;
        return Utils.rectIntersect(entity1.bounds, entity2.bounds);
    }

    // Resolve collision between player and platform
    resolveCollision(player, platform) {
        if (!this.checkCollision(player, platform)) return false;

        const playerBounds = player.bounds;
        const platformBounds = platform.bounds;

        // Calculate overlap
        const overlapX = Math.min(
            playerBounds.x + playerBounds.width - platformBounds.x,
            platformBounds.x + platformBounds.width - playerBounds.x
        );
        const overlapY = Math.min(
            playerBounds.y + playerBounds.height - platformBounds.y,
            platformBounds.y + platformBounds.height - playerBounds.y
        );

        // Resolve collision based on smallest overlap
        if (overlapX < overlapY) {
            // Horizontal collision
            if (playerBounds.x < platformBounds.x) {
                player.position.x = platformBounds.x - playerBounds.width;
                player.velocity.x = Math.min(0, player.velocity.x);
            } else {
                player.position.x = platformBounds.x + platformBounds.width;
                player.velocity.x = Math.max(0, player.velocity.x);
            }
        } else {
            // Vertical collision
            if (playerBounds.y < platformBounds.y) {
                // Player is above platform
                player.position.y = platformBounds.y - playerBounds.height;
                player.velocity.y = Math.min(0, player.velocity.y);
                player.onGround = true;
                player.canJump = true;

                // Trigger platform interaction
                if (platform.onPlayerLand) {
                    platform.onPlayerLand(player);
                }

                return 'top';
            } else {
                // Player is below platform
                player.position.y = platformBounds.y + platformBounds.height;
                player.velocity.y = Math.max(0, player.velocity.y);
                return 'bottom';
            }
        }

        player.updateBounds();
        return true;
    }

    // Apply movement input to player
    applyMovement(player, input) {
        const moveForce = this.moveSpeed * this.controlSensitivity;

        if (input.left) {
            player.velocity.x -= moveForce;
        }
        if (input.right) {
            player.velocity.x += moveForce;
        }

        // Clamp horizontal velocity
        player.velocity.x = Utils.clamp(player.velocity.x, -this.maxMoveSpeed, this.maxMoveSpeed);

        // Jumping
        if (input.jump && player.canJump) {
            const jumpDirection = this.gravityInverted ? 1 : -1;
            player.velocity.y = this.jumpForce * jumpDirection;
            player.canJump = false;
            player.onGround = false;

            // Auto-jump mechanic - reset jump availability quickly
            setTimeout(() => {
                if (!player.onGround) {
                    player.canJump = true;
                }
            }, 100);
        }
    }

    // Check if entity is out of bounds
    isOutOfBounds(entity, bounds) {
        const entityBounds = entity.bounds;
        return entityBounds.x + entityBounds.width < bounds.left ||
            entityBounds.x > bounds.right ||
            entityBounds.y + entityBounds.height < bounds.top ||
            entityBounds.y > bounds.bottom;
    }

    // Apply wind gust (frustration mechanic)
    applyWindGust(force, direction, duration = 2000) {
        this.windForce = force;
        this.windDirection = direction;

        setTimeout(() => {
            this.windForce = 0;
        }, duration);
    }

    // Invert gravity (frustration mechanic)
    invertGravity(duration = 5000) {
        this.gravityInverted = !this.gravityInverted;

        if (duration > 0) {
            setTimeout(() => {
                this.gravityInverted = !this.gravityInverted;
            }, duration);
        }
    }

    // Increase control sensitivity for frustration
    setControlSensitivity(sensitivity) {
        this.controlSensitivity = sensitivity;
    }

    // Reset physics to default state
    reset() {
        this.windForce = 0;
        this.gravityInverted = false;
        this.controlSensitivity = 1.0;
    }

    // Calculate trajectory for projectiles
    calculateTrajectory(startPos, targetPos, speed) {
        const dx = targetPos.x - startPos.x;
        const dy = targetPos.y - startPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return {
            x: (dx / distance) * speed,
            y: (dy / distance) * speed
        };
    }

    // Bounce entity off surface
    bounce(entity, surface, bounciness = 0.7) {
        // Simple bounce - reverse velocity and apply bounciness
        if (surface === 'horizontal') {
            entity.velocity.y = -entity.velocity.y * bounciness;
        } else if (surface === 'vertical') {
            entity.velocity.x = -entity.velocity.x * bounciness;
        }
    }

    // Apply explosion force to entity
    applyExplosion(entity, explosionPos, force, radius) {
        const dx = entity.position.x - explosionPos.x;
        const dy = entity.position.y - explosionPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < radius && distance > 0) {
            const normalizedX = dx / distance;
            const normalizedY = dy / distance;
            const falloff = 1 - (distance / radius);

            entity.velocity.x += normalizedX * force * falloff;
            entity.velocity.y += normalizedY * force * falloff;
        }
    }

    // Smooth camera following
    updateCamera(camera, target, smoothness = 0.1) {
        camera.x = Utils.lerp(camera.x, target.x - camera.width / 2, smoothness);
        camera.y = Utils.lerp(camera.y, target.y - camera.height / 2, smoothness);
    }

    // Platform tilting physics
    tiltPlatform(platform, angle, duration = 1000) {
        platform.targetRotation = angle;
        platform.rotationSpeed = angle / (duration / 16.67); // 60 FPS
        platform.isTilting = true;

        setTimeout(() => {
            platform.isTilting = false;
        }, duration);
    }
}

// Make class globally available for browser
if (typeof window !== 'undefined') {
    window.Physics = Physics;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Physics;
}
