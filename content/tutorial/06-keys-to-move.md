+++
title = "Keys to Move"
date = 2026-03-09T02:00:00+11:00
weight = 6
draft = false
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/07-hit-the-wall/"
prev = "/tutorial/05-the-hero/"
+++


Time to bring your hero to LIFE! 🎮 This is the moment where your game transforms from a static picture into an interactive experience. Player control is what separates games from movies - and you're about to master it! By the end of this chapter, your hero will respond to your every command, moving smoothly through your tile-based world.

<div id="movement-demo" style="border: 2px solid #00ff41; border-radius: 8px; margin: 20px 0; background: #000;"></div>

<script>
window.addEventListener('load', async function() {
    // Create PixiJS application for movement demo
    const app = new PIXI.Application();
    await app.init({
        width: 240,
        height: 180,
        backgroundColor: 0x2c3e50,
        antialias: true
    });
    
    document.getElementById('movement-demo').appendChild(app.canvas);
    
    // Our game map
    const gameMap = [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]
    ];
    
    const TILE_SIZE = 30;
    
    // Render the map
    function createTileGraphics(tileType) {
        const graphics = new PIXI.Graphics();
        graphics.beginFill(tileType === 1 ? 0x00ff41 : 0x003311);
        graphics.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        graphics.lineStyle(1, 0x00ff41, 0.5);
        graphics.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        graphics.endFill();
        return graphics;
    }
    
    for (let row = 0; row < gameMap.length; row++) {
        for (let col = 0; col < gameMap[row].length; col++) {
            const tile = createTileGraphics(gameMap[row][col]);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            app.stage.addChild(tile);
        }
    }
    
    // Create our moveable hero
    const hero = {
        tileX: 3,
        tileY: 2,
        x: 0,
        y: 0,
        speed: 2,
        sprite: null,
        isMoving: false,
        direction: 'down'
    };
    
    // Create hero sprite
    const heroSprite = new PIXI.Graphics();
    heroSprite.beginFill(0xff4444);
    heroSprite.drawRect(-8, -8, 16, 16);
    heroSprite.endFill();
    heroSprite.lineStyle(2, 0xffffff);
    heroSprite.drawRect(-8, -8, 16, 16);
    
    hero.sprite = heroSprite;
    app.stage.addChild(heroSprite);
    
    // Position hero initially
    function updateHeroPosition() {
        hero.x = (hero.tileX * TILE_SIZE) + (TILE_SIZE / 2);
        hero.y = (hero.tileY * TILE_SIZE) + (TILE_SIZE / 2);
        hero.sprite.x = hero.x;
        hero.sprite.y = hero.y;
    }
    updateHeroPosition();
    
    // Keyboard input
    const keys = {
        ArrowUp: false,
        ArrowDown: false, 
        ArrowLeft: false,
        ArrowRight: false
    };
    
    // Listen for key events
    window.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.code)) {
            keys[e.code] = true;
            e.preventDefault();
        }
    });
    
    window.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.code)) {
            keys[e.code] = false;
            e.preventDefault();
        }
    });
    
    // Movement logic
    function updateMovement() {
        let moved = false;
        
        if (keys.ArrowUp && hero.tileY > 1) {
            hero.tileY--;
            hero.direction = 'up';
            moved = true;
        } else if (keys.ArrowDown && hero.tileY < gameMap.length - 2) {
            hero.tileY++;
            hero.direction = 'down';
            moved = true;
        } else if (keys.ArrowLeft && hero.tileX > 1) {
            hero.tileX--;
            hero.direction = 'left';
            moved = true;
        } else if (keys.ArrowRight && hero.tileX < gameMap[0].length - 2) {
            hero.tileX++;
            hero.direction = 'right';
            moved = true;
        }
        
        if (moved) {
            updateHeroPosition();
            hero.isMoving = true;
        } else {
            hero.isMoving = false;
        }
        
        // Visual feedback for direction
        hero.sprite.tint = hero.isMoving ? 0xffff00 : 0xffffff;
    }
    
    // Game loop
    app.ticker.add(updateMovement);
});
</script>

**Try it!** Use your arrow keys to move the red square around! ⬅️➡️⬆️⬇️

*Notice how the hero changes color when moving and stays within the boundaries!*

## MODERN CHARACTER SETUP 🎨

Forget complex movie clips and keyframes! Modern game development uses much simpler, more powerful approaches. Let's build a character system that's both easier to understand and more flexible than the old Flash methods.

**Enhanced Hero Object:**
```js
const hero = {
    // Position in tile coordinates
    tileX: 3,
    tileY: 2,
    
    // Pixel coordinates (calculated from tile position)
    x: 0,
    y: 0,
    
    // Movement properties
    speed: 2,              // How fast we move (pixels per frame)
    isMoving: false,       // Are we currently moving?
    direction: 'down',     // Which way are we facing?
    
    // Visual representation
    sprite: null,          // Our PixiJS sprite
    
    // Animation (we'll enhance this!)
    animationFrame: 0,
    animationSpeed: 0.2
};
```

**Why this is better than Flash:**
- ✅ **Simpler**: No complex keyframe management
- ✅ **Flexible**: Easy to add new properties and behaviors  
- ✅ **Modern**: Uses current web standards
- ✅ **Performant**: No movie clip overhead
- ✅ **Debuggable**: Easy to inspect and modify

## KEYBOARD INPUT: THE MODERN WAY 🎯

**Step 1: Set Up Input Tracking**

Modern games use event listeners to track keyboard input. This is much more reliable and flexible than Flash's old Key.isDown method:

```js
// Create an object to track which keys are currently pressed
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    // You can easily add more keys later!
    Space: false,
    KeyZ: false
};

// Listen for key presses
window.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.code)) {
        keys[event.code] = true;
        event.preventDefault(); // Prevent browser scroll
    }
});

// Listen for key releases
window.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.code)) {
        keys[event.code] = false;
        event.preventDefault();
    }
});
```

**Why this rocks:**
- 🎮 **Multiple keys**: Handle multiple simultaneous key presses
- 🚀 **Responsive**: Immediate reaction to input
- 🔧 **Flexible**: Easy to add new controls
- 🌐 **Standard**: Works across all modern browsers

## MOVEMENT LOGIC: CLEAN & POWERFUL 🚀

**Step 2: Create the Movement System**

Let's create a clean movement system that's easy to understand and modify:

```js
function updateMovement() {
    let moved = false;
    let newDirection = hero.direction;
    
    // Check each direction
    if (keys.ArrowUp) {
        hero.tileY--;
        newDirection = 'up';
        moved = true;
    } else if (keys.ArrowDown) {
        hero.tileY++;
        newDirection = 'down';
        moved = true;
    } else if (keys.ArrowLeft) {
        hero.tileX--;
        newDirection = 'left';
        moved = true;
    } else if (keys.ArrowRight) {
        hero.tileX++;
        newDirection = 'right';
        moved = true;
    }
    
    // Update hero state
    if (moved) {
        hero.direction = newDirection;
        hero.isMoving = true;
        updateHeroPosition();  // Convert tile pos to pixels
    } else {
        hero.isMoving = false;
    }
    
    // Update visual direction (we'll enhance this!)
    updateHeroAppearance();
}

// Convert tile coordinates to pixel coordinates
function updateHeroPosition() {
    hero.x = (hero.tileX * TILE_SIZE) + (TILE_SIZE / 2);
    hero.y = (hero.tileY * TILE_SIZE) + (TILE_SIZE / 2);
    
    // Update sprite position
    hero.sprite.x = hero.x;
    hero.sprite.y = hero.y;
}

// Update hero appearance based on direction
function updateHeroAppearance() {
    // Simple visual feedback (you can make this more sophisticated!)
    if (hero.isMoving) {
        hero.sprite.tint = 0xffff00;  // Yellow when moving
    } else {
        hero.sprite.tint = 0xffffff;  // White when still
    }
}
```

**Connect to the Game Loop:**
```js
// In PixiJS, add this to your ticker for 60fps updates
app.ticker.add(updateMovement);
```

**What makes this awesome:**
- 🎯 **Clear logic**: Easy to understand what each part does
- 🔄 **Reusable**: Same pattern works for any moving object
- 📈 **Scalable**: Easy to add features like acceleration, animation
- 🛡️ **Reliable**: Consistent 60fps updates with PixiJS ticker

## ADDING VISUAL DIRECTION 🎨

**Make Your Hero Face the Right Way:**

```js
function updateHeroAppearance() {
    const sprite = hero.sprite;
    
    // Reset transformations
    sprite.scale.x = 1;
    sprite.rotation = 0;
    
    // Update visual based on direction
    switch (hero.direction) {
        case 'left':
            sprite.scale.x = -1;  // Flip horizontally
            break;
        case 'right':
            // Default orientation (no change needed)
            break;
        case 'up':
            sprite.rotation = -Math.PI / 2;  // Rotate 90° counter-clockwise
            break;
        case 'down':
            sprite.rotation = Math.PI / 2;   // Rotate 90° clockwise
            break;
    }
    
    // Movement feedback
    sprite.tint = hero.isMoving ? 0xffff00 : 0xffffff;
    
    // Optional: Add subtle scale animation when moving
    if (hero.isMoving) {
        const pulse = Math.sin(Date.now() * 0.01) * 0.05 + 1;
        sprite.scale.y = pulse;
    }
}
```

## ADVANCED: SMOOTH MOVEMENT 🚀

**Want buttery-smooth movement instead of tile-by-tile jumping?**

```js
function updateSmoothMovement() {
    let targetX = (hero.tileX * TILE_SIZE) + (TILE_SIZE / 2);
    let targetY = (hero.tileY * TILE_SIZE) + (TILE_SIZE / 2);
    
    // Smooth interpolation
    const lerpSpeed = 0.2;
    hero.x += (targetX - hero.x) * lerpSpeed;
    hero.y += (targetY - hero.y) * lerpSpeed;
    
    hero.sprite.x = hero.x;
    hero.sprite.y = hero.y;
}
```

🏆 **MOVEMENT MASTERY ACHIEVED!**

You've just built a complete movement system that rivals professional games! Your hero responds instantly to input, faces the right direction, and moves smoothly through your world.

**What you've conquered:**
- ✅ Modern keyboard input handling
- ✅ Clean movement logic
- ✅ Visual direction feedback  
- ✅ Smooth animation techniques
- ✅ The foundation for ALL game interactions!

Ready for the next challenge? Let's add collision detection so your hero can't walk through walls! [Next: Hit the Wall](/tutorial/07-hit-the-wall/)