+++
title = "Rotate Hero"
date = 2026-03-09T20:00:00+11:00
weight = 5
draft = false
slug = "rotate-hero"
tags = ["advanced", "optimization", "tutorial"]
next = "/tutorial/the-quarter/rotate-background/"
prev = "/tutorial/the-quarter/isometric-scroll/"
+++

Ready to make your hero feel more alive? So far our character has been limited to walking in just four directions - up, down, left, and right. That's fine for a retro RPG, but what if you want to create a top-down shooter, a racing game, or a spaceship adventure? Time to unlock the magic of **360-degree movement**!

In this tutorial, you'll learn how to rotate your hero and move in any direction using the power of trigonometry (don't worry, it's easier than it sounds!). By the end, your character will move like they do in games like *Asteroids*, *Hotline Miami*, or any twin-stick shooter.

**What You'll Build:**
- Smooth character rotation with arrow keys
- Movement in any direction based on rotation angle
- Collision detection that works with rotated characters

**Prerequisites:**
- Completed the previous movement and collision tutorials
- Basic understanding of our standard character object pattern

Let's start by setting up our rotatable hero. For top-down rotation games, you only need one sprite frame - typically facing right (0 degrees rotation). This becomes your "default" direction, and we'll rotate from there.

{{< pixidemo title="Rotate Hero" >}}
const app = new PIXI.Application();

await app.init({
    width: 300,
    height: 240,
    backgroundColor: 0x2c3e50
});
document.body.appendChild(app.canvas);

// Game constants
const TILE_SIZE = 30;

// Create a simple map with walls around the edges
const map = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,0,1,1,0,1],
    [1,0,1,0,0,0,0,1,0,1],
    [1,0,0,0,1,1,0,0,0,1],
    [1,0,1,0,1,1,0,1,0,1],
    [1,0,1,1,0,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1]
];

// Create map display
const mapContainer = new PIXI.Container();
app.stage.addChild(mapContainer);

for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
        if (map[row][col] === 1) {
            const tile = new PIXI.Graphics()
                .rect(0, 0, TILE_SIZE, TILE_SIZE)
                .fill(0x34495e);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            mapContainer.addChild(tile);
        }
    }
}

// Create hero - arrow shape pointing right
const hero = new PIXI.Graphics()
    .poly([0,4, 8,4, 8,0, 12,6, 8,12, 8,8, 0,8])
    .fill(0xff4444);

// Set pivot point to center for smooth rotation
hero.pivot.set(6, 6);
app.stage.addChild(hero);

// Player properties
const player = {
    sprite: hero,
    x: 150,  // Center of screen
    y: 120,
    width: 12,
    height: 12,
    rotation: 0,        // Current angle in radians
    rotationSpeed: 0.1, // How fast we rotate
    speed: 2,           // Movement speed
    velocityX: 0,
    velocityY: 0
};

// Position the sprite
player.sprite.x = player.x;
player.sprite.y = player.y;

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// Collision detection
function checkTileCollision(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) {
        return true; // Treat out of bounds as solid
    }
    
    return map[row][col] === 1;
}

// Check if player would collide with walls
function checkPlayerCollision(newX, newY) {
    // Check all four corners of the player
    const halfW = player.width / 2;
    const halfH = player.height / 2;
    
    return checkTileCollision(newX - halfW, newY - halfH) ||
           checkTileCollision(newX + halfW, newY - halfH) ||
           checkTileCollision(newX - halfW, newY + halfH) ||
           checkTileCollision(newX + halfW, newY + halfH);
}

// Status display for educational purposes
function updateStatus() {
    const degrees = (player.rotation * 180 / Math.PI).toFixed(0);
    const normalizedDegrees = ((degrees % 360) + 360) % 360;
    const vX = player.velocityX.toFixed(1);
    const vY = player.velocityY.toFixed(1);
    const speed = Math.sqrt(vX * vX + vY * vY).toFixed(1);

    window.parent.postMessage({ type: 'status', text: `Angle: ${normalizedDegrees}° | Velocity: (${vX}, ${vY}) | Speed: ${speed}` }, '*');
}

function updatePlayer() {
    // Rotation controls
    if (keys['ArrowLeft']) {
        player.rotation -= player.rotationSpeed;
    }
    if (keys['ArrowRight']) {
        player.rotation += player.rotationSpeed;
    }
    
    // Calculate movement based on rotation
    player.velocityX = 0;
    player.velocityY = 0;
    
    if (keys['ArrowUp']) {
        // Move forward in facing direction
        player.velocityX = player.speed * Math.cos(player.rotation);
        player.velocityY = player.speed * Math.sin(player.rotation);
    } else if (keys['ArrowDown']) {
        // Move backward
        player.velocityX = -player.speed * Math.cos(player.rotation);
        player.velocityY = -player.speed * Math.sin(player.rotation);
    }
    
    // Try to move, check for collisions
    const newX = player.x + player.velocityX;
    const newY = player.y + player.velocityY;
    
    if (!checkPlayerCollision(newX, newY)) {
        player.x = newX;
        player.y = newY;
        
        // Visual feedback when moving
        player.sprite.tint = player.velocityX !== 0 || player.velocityY !== 0 ? 0xffaaaa : 0xffffff;
    } else {
        // Hit a wall - brief red flash
        player.sprite.tint = 0xff6666;
        setTimeout(() => player.sprite.tint = 0xffffff, 150);
    }
    
    // Keep player in reasonable bounds
    player.x = Math.max(20, Math.min(player.x, 280));
    player.y = Math.max(20, Math.min(player.y, 220));
    
    // Update sprite
    player.sprite.x = player.x;
    player.sprite.y = player.y;
    player.sprite.rotation = player.rotation;
    
    // Educational status display
    updateStatus();
}

// Game loop
app.ticker.add(updatePlayer);
{{< /pixidemo >}}

## The Magic of Vectors and Angles

For movement in any direction, we need two key components:
1. **The angle** - which direction the character is facing
2. **The speed** - how fast they're moving

When you know both angle and speed, you can calculate the exact X and Y movement using trigonometry. Here's the beautiful math behind it:

![Vector diagram showing angle and speed conversion to X/Y components]

```javascript
// Convert polar coordinates (angle + speed) to cartesian (x, y)
const speedX = speed * Math.cos(angle);
const speedY = speed * Math.sin(angle);
```

In JavaScript, trigonometric functions expect angles in **radians**, not degrees. Since we often think in degrees (360° circle), here's the conversion:

```javascript
const angleInRadians = angleInDegrees * Math.PI / 180;
```

But don't worry - PixiJS rotation works in radians by default, so this conversion happens naturally!

## Setting Up Your Rotatable Character

Let's upgrade our standard player object to handle rotation and directional movement:

```javascript
const player = {
    // Position and size (standard 12x12 hero)
    x: 150,
    y: 120,
    width: 12,
    height: 12,
    
    // Movement properties
    speed: 3,           // Pixels per frame
    rotation: 0,        // Current angle in radians
    rotationSpeed: 0.1, // How fast we rotate (radians per frame)
    
    // Velocity components
    velocityX: 0,
    velocityY: 0,
    
    // PixiJS sprite
    sprite: null
};

// Create the PixiJS sprite (facing right by default)
player.sprite = new PIXI.Graphics();
player.sprite.beginFill(0xff4444);  // Our standard red hero color
player.sprite.drawRect(0, 0, player.width, player.height);
player.sprite.endFill();
player.sprite.x = player.x;
player.sprite.y = player.y;
app.stage.addChild(player.sprite);
```

## Handling Rotation Input

Time to make your hero respond to controls! We'll use the arrow keys for rotation (left/right) and movement (up/down):

```javascript
// Key state tracking
const keys = {};

// Add event listeners for smooth input handling
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Update function called every frame
function updatePlayer() {
    // Rotation controls (left/right arrows)
    if (keys['ArrowLeft']) {
        player.rotation -= player.rotationSpeed;
    }
    if (keys['ArrowRight']) {
        player.rotation += player.rotationSpeed;
    }
    
    // Calculate movement based on current rotation
    let isMoving = false;
    
    if (keys['ArrowUp']) {
        // Move forward in the direction we're facing
        player.velocityX = player.speed * Math.cos(player.rotation);
        player.velocityY = player.speed * Math.sin(player.rotation);
        isMoving = true;
    } else if (keys['ArrowDown']) {
        // Move backward (reverse direction)
        player.velocityX = -player.speed * Math.cos(player.rotation);
        player.velocityY = -player.speed * Math.sin(player.rotation);
        isMoving = true;
    } else {
        // No movement keys pressed - stop the player
        player.velocityX = 0;
        player.velocityY = 0;
    }
    
    // Apply movement if we're moving
    if (isMoving) {
        moveCharacter(player, player.velocityX, player.velocityY);
    }
    
    // Update the sprite rotation and position
    player.sprite.rotation = player.rotation;
    player.sprite.x = player.x;
    player.sprite.y = player.y;
}
```

**Pro Tip**: The rotation speed of 0.1 radians gives you smooth, controlled rotation. That's about 5.7 degrees per frame - experiment with different values to find what feels best for your game!

## Updating Movement for Any Direction

Now that we can move in any direction (not just the cardinal directions), we need to update our collision detection function. The key change is handling fractional movement values instead of just -1, 0, or 1:

```javascript
function moveCharacter(player, deltaX, deltaY) {
    // Test vertical movement first
    getCornerPositions(player.x, player.y + deltaY, player);
    
    if (deltaY < -0.1) { // Moving up (with small threshold)
        if (player.canMoveUp) {
            player.y += deltaY;
        } else {
            // Snap to tile boundary
            player.y = player.tileY * game.tileSize + player.height;
        }
    } else if (deltaY > 0.1) { // Moving down
        if (player.canMoveDown) {
            player.y += deltaY;
        } else {
            // Snap to tile boundary  
            player.y = (player.tileY + 1) * game.tileSize - player.height;
        }
    }
    
    // Test horizontal movement
    getCornerPositions(player.x + deltaX, player.y, player);
    
    if (deltaX < -0.1) { // Moving left
        if (player.canMoveLeft) {
            player.x += deltaX;
        } else {
            // Snap to tile boundary
            player.x = player.tileX * game.tileSize + player.width;
        }
    } else if (deltaX > 0.1) { // Moving right
        if (player.canMoveRight) {
            player.x += deltaX;
        } else {
            // Snap to tile boundary
            player.x = (player.tileX + 1) * game.tileSize - player.width;
        }
    }
    
    // Update tile position
    player.tileX = Math.floor(player.x / game.tileSize);
    player.tileY = Math.floor(player.y / game.tileSize);
}
```

**Why the 0.1 threshold?** When using `Math.cos()` and `Math.sin()`, you sometimes get tiny values like 0.000000001 instead of exactly 0. The threshold prevents microscopic "movements" that would be invisible on screen.

## Handling Rotation Collision Challenges

Here's a neat challenge: when your character rotates, their visual bounds change, but our collision detection still uses the original rectangular bounds. This can cause corners to clip through walls slightly.

![](Diagram showing rotated character collision bounds)

**Two Solutions:**

### Option 1: Simple Circular Collision
For most games, treating your character as a circle works amazingly well:

```javascript
function getCornerPositions(x, y, player) {
    // Use circular collision - radius is half the character's size
    const radius = Math.max(player.width, player.height) / 2;
    const centerX = x + player.width / 2;
    const centerY = y + player.height / 2;
    
    // Check if circle overlaps with any tiles
    const leftTile = Math.floor((centerX - radius) / game.tileSize);
    const rightTile = Math.floor((centerX + radius) / game.tileSize);
    const topTile = Math.floor((centerY - radius) / game.tileSize);
    const bottomTile = Math.floor((centerY + radius) / game.tileSize);
    
    // Simple collision flags
    player.canMoveLeft = !checkTileCollision(leftTile, Math.floor(centerY / game.tileSize));
    player.canMoveRight = !checkTileCollision(rightTile, Math.floor(centerY / game.tileSize));
    player.canMoveUp = !checkTileCollision(Math.floor(centerX / game.tileSize), topTile);
    player.canMoveDown = !checkTileCollision(Math.floor(centerX / game.tileSize), bottomTile);
}
```

### Option 2: Live with the Clipping
For square-ish characters, the visual clipping is minimal and barely noticeable during gameplay. Many successful games use this approach because it's simple and performs well.

## Putting It All Together

Add this to your main game loop:

```javascript
// Game loop
function gameLoop() {
    updatePlayer();
    
    // Your other game updates here...
    
    requestAnimationFrame(gameLoop);
}

// Start the game!
gameLoop();
```

**🎉 Congratulations!** You've just implemented 360-degree character movement! Your hero can now:
- Rotate smoothly with the arrow keys  
- Move forward and backward in any direction
- Handle collisions with directional movement
- Move like characters in modern action games

**Try This**: Experiment with different rotation speeds and movement speeds to find what feels right for your game. Top-down shooters often use faster rotation, while exploration games prefer slower, more deliberate movement.

In the next tutorial, we'll take this rotation concept even further by rotating the entire background around a fixed player - creating camera effects that'll make your game feel truly dynamic!