// Input control system for both mobile and desktop

class Controls {
    constructor() {
        this.keys = {};
        this.input = {
            left: false,
            right: false,
            jump: false,
            pause: false,
            restart: false
        };

        // Mobile controls
        this.joystick = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            deadzone: 10,
            maxDistance: 35
        };

        this.jumpButton = {
            pressed: false,
            element: null
        };

        this.isMobile = Utils.isMobile();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard events for desktop
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Prevent default behavior for game keys
        document.addEventListener('keydown', (e) => {
            if (['Space', 'KeyA', 'KeyD', 'KeyP', 'KeyR'].includes(e.code)) {
                e.preventDefault();
            }
        });

        if (this.isMobile) {
            this.setupMobileControls();
        }

        // Prevent context menu on right click
        document.addEventListener('contextmenu', (e) => e.preventDefault());

        // Prevent zoom on double tap
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });

        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    setupMobileControls() {
        // Setup joystick
        const joystick = document.getElementById('joystick');
        const joystickKnob = document.getElementById('joystickKnob');

        if (joystick && joystickKnob) {
            // Touch events for joystick
            joystick.addEventListener('touchstart', (e) => this.onJoystickStart(e, joystick));
            joystick.addEventListener('touchmove', (e) => this.onJoystickMove(e, joystick, joystickKnob));
            joystick.addEventListener('touchend', (e) => this.onJoystickEnd(e, joystickKnob));

            // Mouse events for testing on desktop
            joystick.addEventListener('mousedown', (e) => this.onJoystickStart(e, joystick));
            joystick.addEventListener('mousemove', (e) => this.onJoystickMove(e, joystick, joystickKnob));
            joystick.addEventListener('mouseup', (e) => this.onJoystickEnd(e, joystickKnob));
            joystick.addEventListener('mouseleave', (e) => this.onJoystickEnd(e, joystickKnob));
        }

        // Setup jump button
        const jumpButton = document.getElementById('jumpButton');
        if (jumpButton) {
            this.jumpButton.element = jumpButton;

            jumpButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.jumpButton.pressed = true;
                this.input.jump = true;
            });

            jumpButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.jumpButton.pressed = false;
                this.input.jump = false;
            });

            // Mouse events for testing
            jumpButton.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.jumpButton.pressed = true;
                this.input.jump = true;
            });

            jumpButton.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.jumpButton.pressed = false;
                this.input.jump = false;
            });
        }
    }

    onJoystickStart(e, joystick) {
        e.preventDefault();
        this.joystick.active = true;

        const rect = joystick.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        this.joystick.startX = centerX;
        this.joystick.startY = centerY;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        this.joystick.currentX = clientX;
        this.joystick.currentY = clientY;
    }

    onJoystickMove(e, joystick, knob) {
        if (!this.joystick.active) return;
        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        this.joystick.currentX = clientX;
        this.joystick.currentY = clientY;

        const deltaX = clientX - this.joystick.startX;
        const deltaY = clientY - this.joystick.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Clamp to max distance
        const clampedDistance = Math.min(distance, this.joystick.maxDistance);
        const angle = Math.atan2(deltaY, deltaX);

        const knobX = Math.cos(angle) * clampedDistance;
        const knobY = Math.sin(angle) * clampedDistance;

        // Update knob position
        knob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;

        // Update input based on joystick position
        if (Math.abs(deltaX) > this.joystick.deadzone) {
            this.input.left = deltaX < -this.joystick.deadzone;
            this.input.right = deltaX > this.joystick.deadzone;
        } else {
            this.input.left = false;
            this.input.right = false;
        }
    }

    onJoystickEnd(e, knob) {
        e.preventDefault();
        this.joystick.active = false;

        // Reset knob position
        knob.style.transform = 'translate(-50%, -50%)';

        // Reset input
        this.input.left = false;
        this.input.right = false;
    }

    onKeyDown(e) {
        this.keys[e.code] = true;

        switch (e.code) {
            case 'KeyA':
            case 'ArrowLeft':
                this.input.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.input.right = true;
                break;
            case 'Space':
            case 'KeyW':
            case 'ArrowUp':
                this.input.jump = true;
                break;
            case 'KeyP':
                this.input.pause = true;
                break;
            case 'KeyR':
                this.input.restart = true;
                break;
        }
    }

    onKeyUp(e) {
        this.keys[e.code] = false;

        switch (e.code) {
            case 'KeyA':
            case 'ArrowLeft':
                this.input.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.input.right = false;
                break;
            case 'Space':
            case 'KeyW':
            case 'ArrowUp':
                this.input.jump = false;
                break;
            case 'KeyP':
                this.input.pause = false;
                break;
            case 'KeyR':
                this.input.restart = false;
                break;
        }
    }

    // Get current input state
    getInput() {
        return { ...this.input };
    }

    // Check if specific key is pressed
    isKeyPressed(keyCode) {
        return this.keys[keyCode] || false;
    }

    // Reset all inputs
    reset() {
        this.input = {
            left: false,
            right: false,
            jump: false,
            pause: false,
            restart: false
        };

        if (this.isMobile) {
            // Reset mobile controls
            this.joystick.active = false;
            this.jumpButton.pressed = false;

            const knob = document.getElementById('joystickKnob');
            if (knob) {
                knob.style.transform = 'translate(-50%, -50%)';
            }
        }
    }

    // Enable/disable controls
    setEnabled(enabled) {
        if (!enabled) {
            this.reset();
        }

        // Could add visual feedback here
        const mobileControls = document.getElementById('mobileControls');
        if (mobileControls) {
            mobileControls.style.opacity = enabled ? '1' : '0.5';
            mobileControls.style.pointerEvents = enabled ? 'auto' : 'none';
        }
    }

    // Vibrate on mobile (if supported)
    vibrate(pattern = [100]) {
        if (navigator.vibrate && this.isMobile) {
            navigator.vibrate(pattern);
        }
    }

    // Show/hide mobile controls
    showMobileControls(show) {
        const mobileControls = document.getElementById('mobileControls');
        if (mobileControls) {
            mobileControls.style.display = show ? 'flex' : 'none';
        }
    }
}

// Make class globally available for browser
if (typeof window !== 'undefined') {
    window.Controls = Controls;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Controls;
}
