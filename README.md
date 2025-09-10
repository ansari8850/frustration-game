# 🎮 Climb Game - Frustration-Based Survival Platformer

<div align="center">

![Game Banner](https://img.shields.io/badge/Game-Climb%20Platformer-red?style=for-the-badge&logo=gamepad)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange?style=for-the-badge&logo=html5)
![Status](https://img.shields.io/badge/Status-Playable-brightgreen?style=for-the-badge)

**⚠️ WARNING: This game is designed to frustrate you! ⚠️**

*Can you survive all 10 levels without throwing your device?*

[🎯 Play Now](#-quick-start) | [🎮 Features](#-features) | [🔧 Setup](#-installation) | [🎨 Screenshots](#-screenshots)

</div>

---

## 🌟 What Makes This Game Special?

This isn't your typical platformer. **Climb Game** is a psychological experiment disguised as a game, designed using **frustration-based game design principles** to create an intentionally challenging yet addictive experience.

### 🧠 The Psychology Behind the Frustration

- **Near-miss mechanics** that make you feel "so close" to success
- **Adaptive difficulty** that introduces new challenges just when you feel confident
- **Seeded randomization** ensuring traps behave consistently per attempt
- **"One more try" psychology** that keeps you coming back

---

## 🎮 Features

### 🎯 Core Gameplay
- **Auto-jumping character** with smooth physics-based movement
- **10 progressively difficult levels** with unique challenges
- **Multi-platform controls**: Desktop (A/D + Space) & Mobile (touch controls)
- **Real-time scoring system** with platform landing bonuses

### 🔥 Frustration Mechanics
- **🎯 Chasing Bullet**: Relentless pursuer that follows you from below
- **🎪 Trick Platforms**: 6 different platform behaviors designed to deceive
  - Bending platforms that collapse under weight
  - Flipping platforms that reverse when stepped on
  - Spike platforms that reveal hidden dangers
  - Disappearing platforms that vanish at crucial moments
  - Fake platforms that aren't what they seem
- **🌪️ Environmental Hazards**: Wind gusts, gravity inversion, falling objects
- **📏 Progressive Difficulty**: Control sensitivity increases with each level

### 🎨 Visual & Audio
- **Dark theme** with glowing particle effects
- **Smooth animations** and visual feedback
- **Screen shake** and haptic feedback on mobile
- **Trail effects** and death animations
- **Responsive design** that works on any device

---

## 🚀 Quick Start

### Option 1: Play Online (Recommended)
```bash
# Clone and serve locally
git clone https://github.com/yourusername/climbgame.git
cd climbgame
python3 -m http.server 8000
# Open http://localhost:8000 in your browser
```

### Option 2: Direct File Access
Simply open `index.html` in any modern web browser!

---

## 🎯 Game Controls

| Platform | Movement | Jump | Pause | Restart |
|----------|----------|------|-------|---------|
| **Desktop** | A/D Keys | Space | P | R |
| **Mobile** | Touch Joystick | Jump Button | Pause Button | Restart Button |

> 💡 **Pro Tip**: The character auto-jumps every 800ms, but you can manually jump for better control!

---

## 🏗️ Technical Architecture

### 🛠️ Built With
- **Vanilla JavaScript ES6+** - No frameworks, pure performance
- **HTML5 Canvas** - Smooth 60fps rendering
- **CSS3** - Responsive design with modern animations
- **Web APIs** - Gamepad, Vibration, and Touch support

### 🏛️ Architecture Highlights
```
📁 Project Structure
├── 🎮 js/
│   ├── game.js          # Core game engine & state management
│   ├── player.js        # Player physics & auto-jump mechanics
│   ├── platform.js      # Platform behaviors & frustration logic
│   ├── hazards.js       # Hazard systems (bullets, falling objects)
│   ├── physics.js       # Physics engine with special mechanics
│   ├── levels.js        # 10-level progression system
│   ├── controls.js      # Multi-platform input handling
│   └── utils.js         # Utility functions & helpers
├── 🎨 style.css         # Responsive styling & animations
└── 📄 index.html        # Game container & UI screens
```

### ⚡ Performance Features
- **RequestAnimationFrame** game loop for smooth 60fps
- **Object pooling** for particles and effects
- **Efficient collision detection** with spatial optimization
- **Memory management** with automatic cleanup
- **FPS monitoring** and performance warnings

---

## 🎨 Screenshots

<div align="center">

### 🏠 Main Menu
*Clean, modern interface with clear warnings about frustration ahead*

### 🎮 Gameplay
*Fast-paced action with multiple hazards and moving platforms*

### 💀 Game Over
*Instant retry functionality to keep the "one more try" loop going*

</div>

---

## 🎯 Level Progression

| Level | Name | New Mechanics | Difficulty |
|-------|------|---------------|------------|
| 1 | Getting Started | Basic platforms | ⭐ |
| 2 | Moving Targets | Moving platforms | ⭐⭐ |
| 3 | Trick Shots | Platform tricks | ⭐⭐⭐ |
| 4 | Wind Walker | Wind gusts | ⭐⭐⭐⭐ |
| 5 | Hidden Dangers | All mechanics | ⭐⭐⭐⭐⭐ |
| 6-10 | *Classified* | *You'll find out...* | 🔥🔥🔥 |

---

## 🔧 Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for CORS compliance)

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/climbgame.git

# Navigate to project directory
cd climbgame

# Start local server (choose one)
python3 -m http.server 8000        # Python 3
python -m SimpleHTTPServer 8000    # Python 2
npx serve .                         # Node.js
php -S localhost:8000              # PHP

# Open in browser
open http://localhost:8000
```

---

## 🎮 Game Design Philosophy

This game implements several **psychological game design principles**:

### 🧠 Frustration Psychology
- **Variable Ratio Reinforcement**: Unpredictable rewards keep players engaged
- **Near-Miss Effect**: Close calls create emotional investment
- **Competence Motivation**: Players want to prove they can overcome challenges
- **Flow State Disruption**: Intentional breaks in flow create memorable moments

### 🎯 Engagement Mechanics
- **Immediate Feedback**: Instant visual and haptic responses
- **Progressive Disclosure**: New mechanics introduced gradually
- **Mastery Curve**: Difficulty scales with player improvement
- **Retry Accessibility**: One-click restart maintains momentum

---

## 🤝 Contributing

Want to make the game even more frustrating? 😈

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/more-frustration`)
3. **Commit** your changes (`git commit -m 'Add even more frustrating mechanics'`)
4. **Push** to the branch (`git push origin feature/more-frustration`)
5. **Open** a Pull Request

### 💡 Ideas for Contributions
- New platform behaviors
- Additional hazard types
- Mobile-specific optimizations
- Accessibility improvements
- Sound effects and music
- Particle effect enhancements

---

## 📊 Stats & Achievements

Track your frustration level:
- **Deaths**: How many times you've failed
- **Score**: Points from successful platform landings
- **Levels Survived**: Your maximum progression
- **Rage Quits**: Times you've closed the browser in frustration

---

## 🐛 Known Issues & Roadmap

### 🔧 Current Issues
- [ ] Mobile vibration may not work on all devices
- [ ] Performance optimization for older browsers

### 🚀 Roadmap
- [ ] Sound effects and background music
- [ ] Leaderboard system
- [ ] More platform types
- [ ] Level editor
- [ ] Multiplayer frustration mode
- [ ] Achievement system

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by games like **Getting Over It** and **Jump King**
- Built with frustration-based game design principles
- Thanks to the JavaScript gaming community for inspiration

---

<div align="center">

### 🎮 Ready to Get Frustrated?

**[🚀 Start Playing Now!](http://localhost:8000)**

*Remember: Every death is a learning experience... or so we tell ourselves.*

---

**⭐ If this game frustrated you in the best way possible, please star the repository! ⭐**

![Visitor Count](https://visitor-badge.laobi.icu/badge?page_id=yourusername.climbgame)

</div>
