// Utility functions for the game

// Math utilities
const Utils = {
    // Random number between min and max
    random: (min, max) => Math.random() * (max - min) + min,
    
    // Random integer between min and max (inclusive)
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    
    // Clamp value between min and max
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),
    
    // Linear interpolation
    lerp: (start, end, factor) => start + (end - start) * factor,
    
    // Distance between two points
    distance: (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
    
    // Angle between two points
    angle: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1),
    
    // Normalize angle to 0-2π
    normalizeAngle: (angle) => {
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    },
    
    // Check if two rectangles intersect
    rectIntersect: (rect1, rect2) => {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },
    
    // Check if point is inside rectangle
    pointInRect: (x, y, rect) => {
        return x >= rect.x && x <= rect.x + rect.width &&
               y >= rect.y && y <= rect.y + rect.height;
    },
    
    // Check if point is inside circle
    pointInCircle: (x, y, circle) => {
        const dx = x - circle.x;
        const dy = y - circle.y;
        return dx * dx + dy * dy <= circle.radius * circle.radius;
    },
    
    // Ease functions for animations
    easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeOut: (t) => t * (2 - t),
    easeIn: (t) => t * t,
    
    // Color utilities
    rgbToHex: (r, g, b) => "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1),
    
    hexToRgb: (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },
    
    // Device detection
    isMobile: () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    },
    
    // Touch support detection
    isTouchDevice: () => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },
    
    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Array shuffle
    shuffle: (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },
    
    // Choose random element from array
    choose: (array) => array[Math.floor(Math.random() * array.length)],
    
    // Format time in MM:SS format
    formatTime: (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    // Format score with commas
    formatScore: (score) => score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
    
    // Deep clone object
    deepClone: (obj) => JSON.parse(JSON.stringify(obj)),
    
    // Check if object is empty
    isEmpty: (obj) => Object.keys(obj).length === 0,
    
    // Get canvas context with proper settings
    getCanvasContext: (canvas) => {
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false; // Pixel-perfect rendering
        return ctx;
    },
    
    // Resize canvas to fit container while maintaining aspect ratio
    resizeCanvas: (canvas, container, targetAspectRatio = 16/9) => {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const containerAspectRatio = containerWidth / containerHeight;
        
        if (containerAspectRatio > targetAspectRatio) {
            // Container is wider than target ratio
            canvas.style.height = containerHeight + 'px';
            canvas.style.width = (containerHeight * targetAspectRatio) + 'px';
        } else {
            // Container is taller than target ratio
            canvas.style.width = containerWidth + 'px';
            canvas.style.height = (containerWidth / targetAspectRatio) + 'px';
        }
    }
};

// Vector2 class for 2D math
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    
    add(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }
    
    subtract(other) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }
    
    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }
    
    divide(scalar) {
        return new Vector2(this.x / scalar, this.y / scalar);
    }
    
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    normalize() {
        const mag = this.magnitude();
        return mag > 0 ? this.divide(mag) : new Vector2(0, 0);
    }
    
    dot(other) {
        return this.x * other.x + this.y * other.y;
    }
    
    clone() {
        return new Vector2(this.x, this.y);
    }
    
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Utils, Vector2 };
}
