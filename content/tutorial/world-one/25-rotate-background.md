+++
title = "Rotate Background"
date = 2026-03-09T21:00:00+11:00
weight = 25
draft = false
slug = "rotate-background"
tags = ["advanced", "optimization", "tutorial"]
next = "/tutorial/world-one/pathfinding-breadth-first/"
prev = "/tutorial/world-one/rotate-hero/"
+++

Ready for some serious game magic? In the last tutorial, your hero learned to rotate and move in any direction. Now we're taking it to the next level: **the world itself will rotate around your hero!** 

This technique creates those mind-bending effects you see in space games like *Asteroids*, racing games with spinning tracks, or puzzle games where the entire level rotates. Your hero stays perfectly centered while the universe spins around them - it's like being the center of your own personal tornado!

**What You'll Build:**
- A world that rotates around a fixed player
- Smooth background scrolling in any direction  
- Camera effects that make your game feel dynamic and alive
- Performance optimization for rotating large worlds

**Prerequisites:**
- Completed the hero rotation tutorial
- Understanding of coordinate transformations
- Basic knowledge of PixiJS containers

Time to make your players feel like they control the very fabric of space and time!

{{< pixidemo title="Rotate Background" >}}
const app = new PIXI.Application();

await app.init({
    width: 300,
    height: 240,
    backgroundColor: 0x0a0a0a
});
document.body.appendChild(app.canvas);

// Game constants
const TILE_SIZE = 30;
const WORLD_SIZE = 15; // 15x15 tile world

// Create a larger world map
const worldMap = [];
for (let row = 0; row < WORLD_SIZE; row++) {
    worldMap[row] = [];
    for (let col = 0; col < WORLD_SIZE; col++) {
        // Create interesting patterns
        if (row === 0 || row === WORLD_SIZE-1 || col === 0 || col === WORLD_SIZE-1) {
            worldMap[row][col] = 1; // Border walls
        } else if ((row + col) % 3 === 0) {
            worldMap[row][col] = 2; // Pattern blocks
        } else if (row % 4 === 0 && col % 4 === 0) {
            worldMap[row][col] = 3; // Corner markers
        } else {
            worldMap[row][col] = 0; // Empty space
        }
    }
}

// Create world container that will rotate
const worldContainer = new PIXI.Container();
app.stage.addChild(worldContainer);

// Position the world container at screen center
worldContainer.x = 150; // Center of 300px canvas
worldContainer.y = 120; // Center of 240px canvas

// Create the tile map
for (let row = 0; row < WORLD_SIZE; row++) {
    for (let col = 0; col < WORLD_SIZE; col++) {
        if (worldMap[row][col] > 0) {
            let color;
            if (worldMap[row][col] === 1) color = 0x34495e; // Walls
            else if (worldMap[row][col] === 2) color = 0x2980b9; // Pattern
            else color = 0xe74c3c; // Corners

            const tile = new PIXI.Graphics()
                .rect(0, 0, TILE_SIZE, TILE_SIZE).fill(color);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            worldContainer.addChild(tile);
        }
    }
}

// Create fixed hero at screen center
const hero = new PIXI.Graphics()
    .rect(-1, -6, 2, 12).fill(0xffff00)
    .rect(-6, -1, 12, 2).fill(0xffff00);
hero.x = 150; // Fixed at screen center
hero.y = 120;
app.stage.addChild(hero);

// Camera/world transform properties
const camera = {
    rotation: 0,
    rotationSpeed: 0.05,
    x: 0,
    y: 0,
    moveSpeed: 3
};

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// Status display
function updateStatus() {
    const degrees = (camera.rotation * 180 / Math.PI).toFixed(0);
    const normalizedDegrees = ((degrees % 360) + 360) % 360;
    window.parent.postMessage({ type: 'status', text: `World Rotation: ${normalizedDegrees}° | Camera: (${camera.x.toFixed(0)}, ${camera.y.toFixed(0)})` }, '*');
}

// Update function
function updateCamera() {
    // Rotate the world (left/right arrows)
    if (keys['ArrowLeft']) {
        camera.rotation += camera.rotationSpeed;
    }
    if (keys['ArrowRight']) {
        camera.rotation -= camera.rotationSpeed;
    }
    
    // Move through the world (up/down arrows)
    if (keys['ArrowUp']) {
        // Move "forward" in world space
        camera.x += camera.moveSpeed * Math.cos(camera.rotation);
        camera.y += camera.moveSpeed * Math.sin(camera.rotation);
    }
    if (keys['ArrowDown']) {
        // Move "backward" in world space
        camera.x -= camera.moveSpeed * Math.cos(camera.rotation);
        camera.y -= camera.moveSpeed * Math.sin(camera.rotation);
    }
    
    // Apply transforms to world container
    // The world rotates around its center point
    worldContainer.rotation = camera.rotation;
    
    // The world scrolls opposite to camera movement
    worldContainer.x = 150 - camera.x;
    worldContainer.y = 120 - camera.y;
    
    // Visual feedback
    hero.tint = (keys['ArrowUp'] || keys['ArrowDown']) ? 0xffaaaa : 0xffffff;
    
    updateStatus();
}

// Game loop
app.ticker.add(updateCamera);
{{< /pixidemo >}}

## The Magic Behind Rotating Worlds

**Mind = Blown** 🤯 What you just experienced is the power of **coordinate space transformation**! Instead of moving the player around a static world, we're doing the opposite - keeping the player fixed and moving the entire world around them.

This technique is used in tons of games:
- 🚀 **Space games**: Your ship stays centered while asteroids swirl around you
- 🏎️ **Racing games**: The track rotates beneath your car
- 🧩 **Puzzle games**: Levels that physically rotate to solve challenges
- 🌌 **Exploration games**: Camera effects that follow terrain or create dramatic angles

**Performance Tip**: Notice how smooth the demo runs even with a large world? That's because modern browsers and PixiJS are optimized for this kind of transformation. Still, be mindful with huge worlds - only render what's visible!

## Container Setup: The Foundation of World Rotation

The key insight is that **rotation happens around a pivot point**. If you just rotate your tile map directly, it'll spin around its top-left corner - creating a nauseating whirlpool effect instead of smooth camera rotation!

**The solution**: Use a **container hierarchy** where the rotation point is exactly where you want it:

```javascript
// Create the world container - this will handle rotation
const worldContainer = new PIXI.Container();
app.stage.addChild(worldContainer);

// Position the container at the center of your screen
// This becomes the rotation point!
worldContainer.x = screenWidth / 2;  // 150 for 300px screen
worldContainer.y = screenHeight / 2; // 120 for 240px screen

// Now add all your tiles to this container
for (let row = 0; row < mapHeight; row++) {
    for (let col = 0; col < mapWidth; col++) {
        if (map[row][col] > 0) {
            const tile = createTile(map[row][col]);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            worldContainer.addChild(tile); // Add to world, not stage!
        }
    }
}
```

**Why this works**: Now when you rotate `worldContainer`, everything inside rotates around the screen center - exactly what we want!

## Creating Your Rotatable World

Let's build this step by step! Here's how to set up a world that can rotate around your hero:

```javascript
const game = {
    tileSize: 30,
    screenWidth: 300,
    screenHeight: 240
};

// Step 1: Create the main world container
function setupWorld() {
    // This container will hold everything that rotates
    const worldContainer = new PIXI.Container();
    
    // Position at screen center - this is our rotation pivot point
    worldContainer.x = game.screenWidth / 2;
    worldContainer.y = game.screenHeight / 2;
    
    app.stage.addChild(worldContainer);
    
    return worldContainer;
}

// Step 2: Build your tile map inside the world container
function buildMap(worldContainer, map) {
    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            if (map[row][col] > 0) {
                const tile = new PIXI.Graphics();
                tile.beginFill(getTileColor(map[row][col]));
                tile.drawRect(0, 0, game.tileSize, game.tileSize);
                tile.endFill();
                
                // Position in world coordinates
                tile.x = col * game.tileSize;
                tile.y = row * game.tileSize;
                
                worldContainer.addChild(tile); // Critical: add to world!
            }
        }
    }
}
```

**Pro tip**: Position your rotation center slightly lower than screen center (like y = 160 instead of 120) to give players more forward visibility - just like looking ahead while driving!

## Camera Positioning: Making the Hero the Center of Attention

Here's where the real magic happens! Your hero stays perfectly still on screen, but the world moves around them. This requires **inverse camera math** - when the camera "moves right", the world moves left!

```javascript
const camera = {
    x: 0,           // Camera position in world coordinates
    y: 0,
    rotation: 0,    // How much the world is rotated
    
    // Convert camera position to world container position
    updateWorldTransform(worldContainer) {
        // The world moves opposite to camera movement
        worldContainer.x = (game.screenWidth / 2) - this.x;
        worldContainer.y = (game.screenHeight / 2) - this.y;
        worldContainer.rotation = this.rotation;
    }
};

// Initialize camera to center on starting position
function initializeCamera(startTileX, startTileY) {
    // Center camera on the starting tile
    camera.x = startTileX * game.tileSize + game.tileSize / 2;
    camera.y = startTileY * game.tileSize + game.tileSize / 2;
    
    // Move world to show hero at screen center
    camera.updateWorldTransform(worldContainer);
}
```

**Think of it like this**: Imagine you're holding a map and pointing a flashlight at your current location. When you "move north" on the map, you actually slide the map south under the flashlight. Same principle here!

## Smooth Camera Movement: Following the Action

Every time your hero "moves", you need to update the camera to keep them centered. Here's the smooth movement system:

```javascript
function updateCamera(deltaTime) {
    // Calculate movement based on input and rotation
    let moveX = 0, moveY = 0;
    
    if (keys['ArrowUp']) {
        // Move forward in the direction we're facing
        moveX = player.speed * Math.cos(camera.rotation) * deltaTime;
        moveY = player.speed * Math.sin(camera.rotation) * deltaTime;
    }
    if (keys['ArrowDown']) {
        // Move backward
        moveX = -player.speed * Math.cos(camera.rotation) * deltaTime;
        moveY = -player.speed * Math.sin(camera.rotation) * deltaTime;
    }
    
    // Update camera position (this is where the hero "is" in world space)
    camera.x += moveX;
    camera.y += moveY;
    
    // Move the world to keep hero centered on screen
    camera.updateWorldTransform(worldContainer);
}

// Alternative: Smooth camera following (for advanced effects)
function smoothCamera(targetX, targetY, smoothing = 0.1) {
    camera.x += (targetX - camera.x) * smoothing;
    camera.y += (targetY - camera.y) * smoothing;
    camera.updateWorldTransform(worldContainer);
}
```

**The beauty**: Your hero sprite never actually moves - it stays at `(screenWidth/2, screenHeight/2)` while the entire universe repositions itself around them!

## World Rotation: Spinning the Universe

Now for the spectacular finale - rotating the entire world! This creates those amazing effects where it looks like reality itself is bending around your hero:

```javascript
function handleRotationInput() {
    const rotationSpeed = 0.05; // Radians per frame (~3 degrees)
    
    if (keys['ArrowLeft']) {
        // Rotate world clockwise (hero appears to turn left)
        camera.rotation += rotationSpeed;
        worldContainer.rotation = camera.rotation;
    }
    
    if (keys['ArrowRight']) {
        // Rotate world counter-clockwise (hero appears to turn right)
        camera.rotation -= rotationSpeed;
        worldContainer.rotation = camera.rotation;
    }
    
    // Optional: Rotate hero sprite to show facing direction
    if (player.showDirection) {
        player.sprite.rotation = -camera.rotation; // Opposite of world
    }
}

// Complete update loop
function gameLoop() {
    handleRotationInput();
    updateCamera(app.ticker.deltaTime);
    
    // Your other game logic here...
    
    requestAnimationFrame(gameLoop);
}
```

**Advanced Effect**: Notice how the camera rotation affects movement direction? When the world is rotated 90°, pressing "up" moves you in what appears to be "left"! This creates mind-bending puzzle mechanics.

## Performance and Visual Polish

**🎨 Fixing Visual Glitches**: When rotating pixel art, you might notice thin lines appearing between tiles. Here's how to fix it:

```javascript
// Option 1: Overlap tiles slightly
function createTile(type) {
    const tile = new PIXI.Graphics();
    tile.beginFill(getTileColor(type));
    // Make tiles 1px larger but position them normally
    tile.drawRect(0, 0, game.tileSize + 1, game.tileSize + 1);
    tile.endFill();
    return tile;
}

// Option 2: Use PixiJS settings for crisp rendering
function setupCrispRendering() {
    // Disable anti-aliasing for pixel-perfect tiles
    app.renderer.view.style.imageRendering = 'pixelated';
    app.renderer.roundPixels = true;
}
```

**⚡ Performance Optimization**:

```javascript
// Cull off-screen tiles when rotating large worlds
function optimizeWorldRendering(worldContainer) {
    const bounds = worldContainer.getBounds();
    
    worldContainer.children.forEach(tile => {
        // Simple frustum culling
        const inView = tile.x > bounds.x - 100 && 
                      tile.x < bounds.x + bounds.width + 100;
        tile.visible = inView;
    });
}
```

**🎉 Congratulations!** You've just mastered one of the coolest camera effects in game development! Your players can now:

- ✨ Experience smooth world rotation around their character
- 🚀 Move through space with the universe spinning around them  
- 🎮 Enjoy professional-quality camera effects
- 🎯 Navigate with directional movement that follows world rotation

**Try This**: Experiment with different rotation speeds, add smooth easing, or try rotating only when moving. Many games combine this with particle effects or screen shake for extra impact!

In the next tutorial, we'll explore pathfinding - teaching your enemies to navigate around this beautifully rotating world!