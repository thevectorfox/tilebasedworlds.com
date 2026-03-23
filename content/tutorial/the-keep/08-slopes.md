+++
title = "Slopes"
date = 2026-03-10T00:00:00+11:00
weight = 8
draft = true
slug = "slopes"
tags = ["advanced", "optimization", "tutorial"]
next = ""
prev = "/tutorial/the-keep/depth/"
+++

🎉 **Welcome to the GRAND FINALE!** 🎉

You've mastered tile collision, jumping physics, pathfinding AI, and camera rotation. Now it's time for the ultimate challenge: **slopes!** This isn't just another tutorial - this is where your tile-based world transforms from blocky Minecraft terrain into smooth, flowing landscapes like *Super Mario World* or *Sonic the Hedgehog*.

**The Magic**: Instead of forcing players to jump onto every elevated platform, slopes create **seamless terrain** where characters glide naturally up hills and down valleys. It's the difference between climbing stairs and walking up a ramp!

**What You'll Master:**
- Diagonal tile types for smooth terrain transitions
- Dynamic character positioning based on slope angle
- Modified collision detection for angled surfaces
- Physics that feel natural and responsive
- The mathematical beauty behind smooth terrain

**Prerequisites:**
- Completed the jumping physics tutorial
- Ready to tackle some elegant math
- Prepared to be amazed by what you create!

Time to give your characters the ultimate gift: **the ability to walk on any terrain!** 🏔️

<div id="slopesDemo" style="text-align: center; margin: 20px 0;">
    <canvas id="slopesCanvas" width="400" height="300" style="border: 2px solid #333; background: #87CEEB; display: block; margin: 0 auto;"></canvas>
    <div style="margin-top: 10px; font-family: monospace;">
        <strong>🏃‍♀️ Walk the slopes!</strong> Arrow keys to move, Spacebar to jump<br>
        Watch the smooth terrain transitions and perfect slope physics!
    </div>
    <div id="slopesStatus" style="margin-top: 5px; font-size: 12px; color: #666; min-height: 16px;"></div>
</div>

<script type="module">
import { Application, Container, Graphics } from 'https://unpkg.com/pixi.js@8.0.0/dist/pixi.min.mjs';

const canvas = document.getElementById('slopesCanvas');
const app = new Application();

await app.init({
    canvas: canvas,
    width: 400,
    height: 300,
    backgroundColor: 0x87CEEB  // Sky blue
});

// Game constants
const TILE_SIZE = 30;
const GRAVITY = 0.8;
const JUMP_POWER = -16;
const MOVE_SPEED = 3;

// Tile types
const TILE_TYPE = {
    EMPTY: 0,
    SOLID: 1,
    SLOPE_UP: 2,    // / slope (bottom-left to top-right)
    SLOPE_DOWN: 3   // \ slope (top-left to bottom-right)
};

// Create a terrain with various slopes
const map = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,2,1,1,3,0,0,2,1,3,0,0],
    [0,2,1,1,1,1,3,2,1,1,1,3,0],
    [2,1,1,1,1,1,1,1,1,1,1,1,3],
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const COLS = map[0].length;
const ROWS = map.length;

// Create visual representation
function createTileGraphic(type, x, y) {
    const tile = new Graphics();
    
    switch(type) {
        case TILE_TYPE.SOLID:
            tile.rect(0, 0, TILE_SIZE, TILE_SIZE).fill(0x8B4513); // Brown
            break;
        case TILE_TYPE.SLOPE_UP:
            // Draw / slope
            tile.beginFill(0x90EE90); // Light green
            tile.moveTo(0, TILE_SIZE);
            tile.lineTo(TILE_SIZE, 0);
            tile.lineTo(TILE_SIZE, TILE_SIZE);
            tile.closePath();
            tile.endFill();
            break;
        case TILE_TYPE.SLOPE_DOWN:
            // Draw \ slope
            tile.beginFill(0x90EE90);
            tile.moveTo(0, 0);
            tile.lineTo(TILE_SIZE, TILE_SIZE);
            tile.lineTo(0, TILE_SIZE);
            tile.closePath();
            tile.endFill();
            break;
    }
    
    tile.x = x;
    tile.y = y;
    return tile;
}

// Build the visual map
for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
        const tileType = map[row][col];
        if (tileType !== TILE_TYPE.EMPTY) {
            const tile = createTileGraphic(tileType, col * TILE_SIZE, row * TILE_SIZE);
            app.stage.addChild(tile);
        }
    }
}

// Create hero
const hero = new Graphics();
hero.circle(6, 6, 6).fill(0xff4444); // Red circle
app.stage.addChild(hero);

// Player state
const player = {
    x: 3 * TILE_SIZE,
    y: 4 * TILE_SIZE,
    width: 12,
    height: 12,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
    onSlope: false,
    slopeType: 0
};

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// Utility functions
function getTileAt(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
        return TILE_TYPE.EMPTY;
    }
    
    return map[row][col];
}

function isSolid(tileType) {
    return tileType === TILE_TYPE.SOLID;
}

function isSlope(tileType) {
    return tileType === TILE_TYPE.SLOPE_UP || tileType === TILE_TYPE.SLOPE_DOWN;
}

// The magic: Calculate height on a slope based on X position
function getHeightOnSlope(x, y, slopeType) {
    const tileX = Math.floor(x / TILE_SIZE) * TILE_SIZE;
    const tileY = Math.floor(y / TILE_SIZE) * TILE_SIZE;
    const localX = x - tileX; // Position within the tile (0 to TILE_SIZE)
    
    if (slopeType === TILE_TYPE.SLOPE_UP) {
        // / slope: height increases as we move right
        const slopeHeight = TILE_SIZE - localX;
        return tileY + slopeHeight;
    } else if (slopeType === TILE_TYPE.SLOPE_DOWN) {
        // \ slope: height increases as we move left  
        const slopeHeight = localX;
        return tileY + slopeHeight;
    }
    
    return y; // Not on a slope
}

// Enhanced collision detection with slope support
function updatePhysics() {
    // Horizontal movement
    player.velocityX = 0;
    if (keys['ArrowLeft']) {
        player.velocityX = -MOVE_SPEED;
    }
    if (keys['ArrowRight']) {
        player.velocityX = MOVE_SPEED;
    }
    
    // Jumping
    if (keys['Space'] && player.onGround) {
        player.velocityY = JUMP_POWER;
        player.onGround = false;
        
        // If jumping from a slope, adjust Y position
        if (player.onSlope) {
            const centerX = player.x + player.width / 2;
            const groundY = getHeightOnSlope(centerX, player.y, player.slopeType);
            player.y = groundY - player.height;
        }
    }
    
    // Apply gravity
    player.velocityY += GRAVITY;
    
    // Horizontal movement with collision
    const newX = player.x + player.velocityX;
    const leftTile = getTileAt(newX, player.y + player.height - 5);
    const rightTile = getTileAt(newX + player.width, player.y + player.height - 5);
    
    // Allow movement if not hitting solid walls (slopes are walkable)
    if (!isSolid(leftTile) && !isSolid(rightTile)) {
        player.x = newX;
    }
    
    // Vertical movement and ground detection
    const newY = player.y + player.velocityY;
    const centerX = player.x + player.width / 2;
    const groundTile = getTileAt(centerX, newY + player.height);
    
    if (isSlope(groundTile)) {
        // Walking on a slope!
        const slopeGroundY = getHeightOnSlope(centerX, newY + player.height, groundTile);
        
        if (newY + player.height >= slopeGroundY && player.velocityY >= 0) {
            // Land on or walk along the slope
            player.y = slopeGroundY - player.height;
            player.velocityY = 0;
            player.onGround = true;
            player.onSlope = true;
            player.slopeType = groundTile;
        } else {
            // Above the slope (jumping or falling)
            player.y = newY;
            player.onSlope = false;
        }
    } else if (isSolid(groundTile) && player.velocityY >= 0) {
        // Land on solid ground
        const tileY = Math.floor((newY + player.height) / TILE_SIZE) * TILE_SIZE;
        player.y = tileY - player.height;
        player.velocityY = 0;
        player.onGround = true;
        player.onSlope = false;
    } else if (groundTile === TILE_TYPE.EMPTY) {
        // Falling through air
        player.y = newY;
        player.onGround = false;
        player.onSlope = false;
        
        // Check if we just walked off a slope
        if (player.onSlope && player.velocityY >= 0) {
            player.onSlope = false;
        }
    } else {
        // Hit ceiling
        if (player.velocityY < 0) {
            player.velocityY = 0;
        }
        player.y = newY;
    }
    
    // Keep player in bounds
    player.x = Math.max(0, Math.min(player.x, COLS * TILE_SIZE - player.width));
    player.y = Math.max(0, player.y);
    
    // Update visual position
    hero.x = player.x;
    hero.y = player.y;
}

// Status display
const statusElement = document.getElementById('slopesStatus');
function updateStatus() {
    const state = player.onSlope ? `On ${player.slopeType === TILE_TYPE.SLOPE_UP ? '/ slope' : '\\ slope'}` : 
                  player.onGround ? 'On ground' : 'In air';
    const pos = `(${Math.floor(player.x)}, ${Math.floor(player.y)})`;
    statusElement.textContent = `State: ${state} | Position: ${pos} | Velocity: (${player.velocityX.toFixed(1)}, ${player.velocityY.toFixed(1)})`;
}

// Game loop
app.ticker.add(() => {
    updatePhysics();
    updateStatus();
});

// Initialize position
hero.x = player.x;
hero.y = player.y;
</script>

## The Science of Smooth Terrain

**Did you see that magic?! ✨** Your character just walked up and down hills as naturally as walking on flat ground! No awkward jumping, no getting stuck on elevation changes - just pure, fluid movement that feels incredible.

**Why This Matters:**
Slopes transform your game world from a blocky, artificial grid into **natural, flowing terrain**. Compare:

- **Without slopes**: Jump, jump, jump up every platform like a robot 🤖
- **With slopes**: Glide smoothly up hills and down valleys like a real character 🏃‍♀️

**The Mathematical Beauty:**
The secret is **dynamic height calculation**. Instead of treating every tile as flat, we calculate the exact height based on where the character stands within the sloped tile:

```javascript
// For a / slope (bottom-left to top-right)
function getHeightOnSlope(x, localTileX, slopeType) {
    const positionInTile = x - localTileX; // 0 to TILE_SIZE
    
    if (slopeType === SLOPE_UP) {
        // Height decreases as we move right
        return TILE_SIZE - positionInTile;
    } else if (slopeType === SLOPE_DOWN) {
        // Height increases as we move right
        return positionInTile;
    }
}
```

**Real-World Usage:**
- **Platformers**: *Super Mario World*, *Sonic*, *Rayman*
- **Racing games**: Smooth track banking and hills
- **RPGs**: Natural mountain paths and valleys
- **Metroidvania**: Complex interconnected terrain


## Understanding Slope Physics

**The Challenge**: Traditional tile collision treats everything as rectangles. But slopes require **continuous height calculation** - your character's Y position must smoothly follow the diagonal surface.

**Key Insights:**

### 1. Slope Types
We need just two slope types to create any terrain:

```javascript
const SLOPE_TYPES = {
    UP: 2,      // / slope (rises left to right)
    DOWN: 3     // \ slope (falls left to right)
};
```

### 2. Position-Based Height
Unlike flat tiles, slopes require **dynamic positioning**:

```javascript
// Traditional flat collision:
if (hitTile) {
    player.y = tileTop; // Always same height
}

// Advanced slope collision:
if (onSlope) {
    const height = calculateSlopeHeight(player.x, tile);
    player.y = height - player.height; // Dynamic height!
}
```

### 3. The Critical Constraint
⚠️ **Important**: Our slopes must go corner-to-corner of a tile. No arbitrary angles! This keeps collision detection fast and predictable:

```
✅ Valid slopes:     ❌ Invalid slopes:
    /|  |\               ~
   / |  | \              /~
  /  |  |  \            /
```

**Why This Works**: Corner-to-corner slopes ensure the math stays simple and fast. Complex angles would require expensive trigonometry every frame!

## Building Your Slope System

Time to implement the magic! Let's break this down into digestible chunks:

### Step 1: Define Slope Tiles

```javascript
// Enhanced tile types for terrain
const TILE_TYPE = {
    EMPTY: 0,
    SOLID: 1,
    SLOPE_UP: 2,     // / slope
    SLOPE_DOWN: 3    // \ slope
};

// Tile properties for game logic
const tileProperties = {
    [TILE_TYPE.EMPTY]: { walkable: true, solid: false, slope: false },
    [TILE_TYPE.SOLID]: { walkable: false, solid: true, slope: false },
    [TILE_TYPE.SLOPE_UP]: { walkable: true, solid: false, slope: 1 },
    [TILE_TYPE.SLOPE_DOWN]: { walkable: true, solid: false, slope: -1 }
};

function getTileInfo(tileType) {
    return tileProperties[tileType] || tileProperties[TILE_TYPE.EMPTY];
}
```

### Step 2: The Heart - Slope Height Calculation

```javascript
// This is where the magic happens!
function calculateSlopeHeight(worldX, worldY, tileSize) {
    const tileX = Math.floor(worldX / tileSize);
    const tileY = Math.floor(worldY / tileSize);
    const tileType = getTileAt(tileX, tileY);
    
    if (!getTileInfo(tileType).slope) {
        return null; // Not on a slope
    }
    
    // Position within the tile (0 to tileSize)
    const localX = worldX - (tileX * tileSize);
    const tileBottomY = (tileY + 1) * tileSize;
    
    if (tileType === TILE_TYPE.SLOPE_UP) {
        // / slope: height = tileSize - localX
        const slopeHeight = tileSize - localX;
        return tileBottomY - slopeHeight;
    } else if (tileType === TILE_TYPE.SLOPE_DOWN) {
        // \ slope: height = localX
        const slopeHeight = localX;
        return tileBottomY - slopeHeight;
    }
    
    return null;
}
```

**🧠 Math Breakdown**:
- **localX**: How far into the tile we are (0-30 for 30px tiles)
- **SLOPE_UP**: As we move right, ground gets higher (height = 30 - localX)
- **SLOPE_DOWN**: As we move right, ground gets lower (height = localX)
- **Result**: Smooth height that changes pixel by pixel!

### Step 3: Enhanced Movement with Slope Support

```javascript
function updatePlayerMovement(player, input, gameMap) {
    // Horizontal movement (same as before)
    player.velocityX = 0;
    if (input.left) player.velocityX = -player.speed;
    if (input.right) player.velocityX = player.speed;
    
    // Jumping with slope awareness
    if (input.jump && player.onGround) {
        player.velocityY = player.jumpPower;
        player.onGround = false;
        
        // Special case: jumping from slope
        if (player.onSlope) {
            const centerX = player.x + player.width / 2;
            const slopeHeight = calculateSlopeHeight(centerX, player.y, TILE_SIZE);
            if (slopeHeight !== null) {
                player.y = slopeHeight - player.height; // Adjust position
            }
            player.onSlope = false;
        }
    }
    
    // Apply gravity
    player.velocityY += player.gravity;
    
    // Test horizontal movement
    const newX = player.x + player.velocityX;
    if (!checkHorizontalCollision(newX, player.y, player, gameMap)) {
        player.x = newX;
    }
    
    // Test vertical movement with slope detection
    const newY = player.y + player.velocityY;
    checkVerticalMovement(player.x, newY, player, gameMap);
}

function checkVerticalMovement(x, newY, player, gameMap) {
    const centerX = x + player.width / 2;
    const footY = newY + player.height;
    const tileType = getTileAt(centerX, footY, gameMap);
    const tileInfo = getTileInfo(tileType);
    
    if (tileInfo.slope && player.velocityY >= 0) {
        // Check if we're touching the slope surface
        const slopeHeight = calculateSlopeHeight(centerX, footY, TILE_SIZE);
        
        if (slopeHeight !== null && footY >= slopeHeight) {
            // Land on or walk along slope
            player.y = slopeHeight - player.height;
            player.velocityY = 0;
            player.onGround = true;
            player.onSlope = true;
            return;
        }
    }
    
    if (tileInfo.solid && player.velocityY >= 0) {
        // Hit solid ground
        const tileY = Math.floor(footY / TILE_SIZE) * TILE_SIZE;
        player.y = tileY - player.height;
        player.velocityY = 0;
        player.onGround = true;
        player.onSlope = false;
        return;
    }
    
    // Falling through air
    player.y = newY;
    player.onGround = false;
    player.onSlope = false;
}
```

**🎯 Key Features**:
- **Smooth Walking**: Character height adjusts pixel-perfectly to slope angle
- **Natural Transitions**: Seamless movement between flat and sloped terrain
- **Jump Integration**: Jumping works perfectly from any slope angle
- **Performance**: Fast math keeps the game running at 60 FPS

## Advanced Slope Techniques

### Visual Polish: Drawing Slopes

Make your slopes look amazing with proper graphics:

```javascript
function createSlopeGraphic(tileType, x, y, tileSize) {
    const graphic = new PIXI.Graphics();
    
    if (tileType === TILE_TYPE.SLOPE_UP) {
        // / slope - grass green with subtle gradient
        graphic.beginFill(0x90EE90);
        graphic.moveTo(0, tileSize);        // Bottom-left
        graphic.lineTo(tileSize, 0);        // Top-right  
        graphic.lineTo(tileSize, tileSize); // Bottom-right
        graphic.closePath();
        graphic.endFill();
        
        // Add a subtle outline
        graphic.lineStyle(1, 0x228B22);
        graphic.moveTo(0, tileSize);
        graphic.lineTo(tileSize, 0);
        
    } else if (tileType === TILE_TYPE.SLOPE_DOWN) {
        // \ slope
        graphic.beginFill(0x90EE90);
        graphic.moveTo(0, 0);              // Top-left
        graphic.lineTo(tileSize, tileSize); // Bottom-right
        graphic.lineTo(0, tileSize);       // Bottom-left
        graphic.closePath();
        graphic.endFill();
        
        graphic.lineStyle(1, 0x228B22);
        graphic.moveTo(0, 0);
        graphic.lineTo(tileSize, tileSize);
    }
    
    graphic.x = x;
    graphic.y = y;
    return graphic;
}
```

### Performance Optimization

For large worlds with many slopes:

```javascript
// Cache slope calculations for better performance
class SlopeCalculator {
    constructor(tileSize) {
        this.tileSize = tileSize;
        this.cache = new Map();
    }
    
    getHeight(worldX, worldY, map) {
        const tileX = Math.floor(worldX / this.tileSize);
        const tileY = Math.floor(worldY / this.tileSize);
        const key = `${tileX},${tileY},${worldX % this.tileSize}`;
        
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        const height = this.calculateHeight(worldX, worldY, map);
        this.cache.set(key, height);
        
        // Limit cache size
        if (this.cache.size > 1000) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        return height;
    }
    
    calculateHeight(worldX, worldY, map) {
        // Your height calculation logic here
        return calculateSlopeHeight(worldX, worldY, this.tileSize);
    }
}
```

## � Interactive Demo: Complete Slope Physics

Experience the magic of smooth slope movement! Move with **WASD** or **arrow keys**, jump with **SPACE**, and watch the real-time physics calculations:

<canvas id="slopeDemo" width="300" height="240" style="border: 2px solid #333; background: #87CEEB;"></canvas>

<script src="https://pixijs.download/release/pixi.min.js"></script>
<script>
(function() {
    const canvas = document.getElementById('slopeDemo');
    const app = new PIXI.Application({
        view: canvas,
        width: 300,
        height: 240,
        backgroundColor: 0x87CEEB
    });

    const TILE_SIZE = 30;
    const TILE_TYPE = {
        EMPTY: 0,
        SOLID: 1,
        SLOPE_UP: 2,
        SLOPE_DOWN: 3
    };

    const tileProperties = {
        [TILE_TYPE.EMPTY]: { walkable: true, solid: false, slope: false },
        [TILE_TYPE.SOLID]: { walkable: false, solid: true, slope: false },
        [TILE_TYPE.SLOPE_UP]: { walkable: true, solid: false, slope: 1 },
        [TILE_TYPE.SLOPE_DOWN]: { walkable: true, solid: false, slope: -1 }
    };

    const gameMap = [
        [1,1,1,1,1,1,1,1,1,1],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,2,3,0,0],
        [0,0,2,3,2,2,1,1,3,0],
        [2,2,1,1,1,1,1,1,1,2],
        [1,1,1,1,1,1,1,1,1,1]
    ];

    const player = {
        x: 60,
        y: 150,
        width: 12,
        height: 12,
        velocityX: 0,
        velocityY: 0,
        speed: 2,
        jumpPower: -8,
        gravity: 0.4,
        onGround: false,
        onSlope: false,
        sprite: null
    };

    const keys = {
        left: false,
        right: false,
        up: false,
        space: false
    };

    // Create world graphics
    const mapContainer = new PIXI.Container();
    app.stage.addChild(mapContainer);

    function createTileGraphic(tileType) {
        const graphic = new PIXI.Graphics();
        
        switch(tileType) {
            case TILE_TYPE.SOLID:
                graphic.beginFill(0x8B4513);
                graphic.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
                graphic.endFill();
                graphic.lineStyle(1, 0x654321);
                graphic.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
                break;
                
            case TILE_TYPE.SLOPE_UP:
                graphic.beginFill(0x90EE90);
                graphic.moveTo(0, TILE_SIZE);
                graphic.lineTo(TILE_SIZE, 0);
                graphic.lineTo(TILE_SIZE, TILE_SIZE);
                graphic.closePath();
                graphic.endFill();
                graphic.lineStyle(2, 0x228B22);
                graphic.moveTo(0, TILE_SIZE);
                graphic.lineTo(TILE_SIZE, 0);
                break;
                
            case TILE_TYPE.SLOPE_DOWN:
                graphic.beginFill(0x90EE90);
                graphic.moveTo(0, 0);
                graphic.lineTo(TILE_SIZE, TILE_SIZE);
                graphic.lineTo(0, TILE_SIZE);
                graphic.closePath();
                graphic.endFill();
                graphic.lineStyle(2, 0x228B22);
                graphic.moveTo(0, 0);
                graphic.lineTo(TILE_SIZE, TILE_SIZE);
                break;
        }
        
        return graphic;
    }

    for (let y = 0; y < gameMap.length; y++) {
        for (let x = 0; x < gameMap[y].length; x++) {
            const tileType = gameMap[y][x];
            if (tileType !== TILE_TYPE.EMPTY) {
                const tileGraphic = createTileGraphic(tileType);
                tileGraphic.x = x * TILE_SIZE;
                tileGraphic.y = y * TILE_SIZE;
                mapContainer.addChild(tileGraphic);
            }
        }
    }

    // Create player
    const playerGraphic = new PIXI.Graphics();
    playerGraphic.beginFill(0xFF4444);
    playerGraphic.drawRect(0, 0, player.width, player.height);
    playerGraphic.endFill();
    app.stage.addChild(playerGraphic);
    player.sprite = playerGraphic;

    // Create physics display
    const physicsText = new PIXI.Text('', {
        fontFamily: 'Arial',
        fontSize: 10,
        fill: 0x000000,
        align: 'left'
    });
    physicsText.x = 5;
    physicsText.y = 5;
    app.stage.addChild(physicsText);

    function getTileAt(x, y) {
        const tileX = Math.floor(x / TILE_SIZE);
        const tileY = Math.floor(y / TILE_SIZE);
        if (tileY >= 0 && tileY < gameMap.length && tileX >= 0 && tileX < gameMap[tileY].length) {
            return gameMap[tileY][tileX];
        }
        return TILE_TYPE.EMPTY;
    }

    function getTileInfo(tileType) {
        return tileProperties[tileType] || tileProperties[TILE_TYPE.EMPTY];
    }

    function calculateSlopeHeight(worldX, worldY) {
        const tileX = Math.floor(worldX / TILE_SIZE);
        const tileY = Math.floor(worldY / TILE_SIZE);
        
        if (tileY < 0 || tileY >= gameMap.length || tileX < 0 || tileX >= gameMap[tileY].length) {
            return null;
        }
        
        const tileType = gameMap[tileY][tileX];
        
        if (!getTileInfo(tileType).slope) {
            return null;
        }
        
        const localX = worldX - (tileX * TILE_SIZE);
        const tileBottomY = (tileY + 1) * TILE_SIZE;
        
        if (tileType === TILE_TYPE.SLOPE_UP) {
            const slopeHeight = TILE_SIZE - localX;
            return tileBottomY - slopeHeight;
        } else if (tileType === TILE_TYPE.SLOPE_DOWN) {
            const slopeHeight = localX;
            return tileBottomY - slopeHeight;
        }
        
        return null;
    }

    function updatePlayer() {
        // Horizontal movement
        player.velocityX = 0;
        if (keys.left) player.velocityX = -player.speed;
        if (keys.right) player.velocityX = player.speed;
        
        // Jumping
        if ((keys.up || keys.space) && player.onGround) {
            player.velocityY = player.jumpPower;
            player.onGround = false;
        }
        
        // Apply gravity
        player.velocityY += player.gravity;
        
        // Test horizontal movement
        const newX = player.x + player.velocityX;
        if (!checkHorizontalCollision(newX, player.y)) {
            player.x = newX;
        }
        
        // Test vertical movement
        const newY = player.y + player.velocityY;
        checkVerticalMovement(player.x, newY);
        
        // Update sprite position
        player.sprite.x = player.x;
        player.sprite.y = player.y;
    }

    function checkHorizontalCollision(newX, y) {
        const tileType = getTileAt(newX + player.width/2, y + player.height);
        return getTileInfo(tileType).solid;
    }

    function checkVerticalMovement(x, newY) {
        const centerX = x + player.width / 2;
        const footY = newY + player.height;
        const tileType = getTileAt(centerX, footY);
        const tileInfo = getTileInfo(tileType);
        
        if (tileInfo.slope && player.velocityY >= 0) {
            const slopeHeight = calculateSlopeHeight(centerX, footY);
            
            if (slopeHeight !== null && footY >= slopeHeight) {
                player.y = slopeHeight - player.height;
                player.velocityY = 0;
                player.onGround = true;
                player.onSlope = true;
                return;
            }
        }
        
        if (tileInfo.solid && player.velocityY >= 0) {
            const tileY = Math.floor(footY / TILE_SIZE) * TILE_SIZE;
            player.y = tileY - player.height;
            player.velocityY = 0;
            player.onGround = true;
            player.onSlope = false;
            return;
        }
        
        player.y = newY;
        player.onGround = false;
        player.onSlope = false;
    }

    function updatePhysicsDisplay() {
        const centerX = player.x + player.width / 2;
        const footY = player.y + player.height;
        const slopeHeight = calculateSlopeHeight(centerX, footY);
        
        physicsText.text = `Position: (${Math.round(player.x)}, ${Math.round(player.y)})
Velocity: (${player.velocityX.toFixed(1)}, ${player.velocityY.toFixed(1)})
State: ${player.onSlope ? 'On Slope' : (player.onGround ? 'On Ground' : 'In Air')}
Slope Height: ${slopeHeight ? slopeHeight.toFixed(1) : 'None'}`;
    }

    // Input handling
    document.addEventListener('keydown', (e) => {
        switch(e.code) {
            case 'KeyA': case 'ArrowLeft': keys.left = true; break;
            case 'KeyD': case 'ArrowRight': keys.right = true; break;
            case 'KeyW': case 'ArrowUp': keys.up = true; break;
            case 'Space': keys.space = true; e.preventDefault(); break;
        }
    });

    document.addEventListener('keyup', (e) => {
        switch(e.code) {
            case 'KeyA': case 'ArrowLeft': keys.left = false; break;
            case 'KeyD': case 'ArrowRight': keys.right = false; break;
            case 'KeyW': case 'ArrowUp': keys.up = false; break;
            case 'Space': keys.space = false; break;
        }
    });

    // Game loop
    app.ticker.add(() => {
        updatePlayer();
        updatePhysicsDisplay();
    });

    // Instructions
    const instructions = new PIXI.Text('WASD/Arrows to move, SPACE to jump', {
        fontFamily: 'Arial',
        fontSize: 11,
        fill: 0x000000,
        align: 'center'
    });
    instructions.x = 300/2 - instructions.width/2;
    instructions.y = 220;
    app.stage.addChild(instructions);
})();
</script>

**🎯 Demo Features:**
- **Smooth Slope Walking**: Character height adjusts perfectly to terrain
- **Real-time Physics**: Watch velocity and position calculations live
- **Seamless Transitions**: Move naturally between flat ground and slopes  
- **Jump Integration**: Jumping works from any position on slopes
- **Professional Feel**: Physics that match commercial games

## �🎉 **CONGRATULATIONS - YOU'VE COMPLETED THE ENTIRE SERIES!** 🎉

**What an incredible journey!** You started with basic tile collision and finished with **advanced slope physics** that rivals professional games. You've mastered:

✨ **28 Advanced Tutorials** covering every aspect of tile-based games
🎮 **Modern JavaScript/PixiJS** implementation ready for real projects  
🧠 **Professional Algorithms** including pathfinding and physics systems
🏗️ **Scalable Architecture** patterns used in AAA game development
🎯 **Interactive Learning** with hands-on demos for every concept

**Your Game Development Superpowers:**
- Tile-based collision detection and movement systems
- Jumping physics with gravity and platform mechanics  
- Enemy AI with pathfinding intelligence
- Smooth camera systems and world rotation effects
- Advanced terrain with realistic slope physics
- Performance optimization for large game worlds

**What's Next?** You now have the foundation to build:
- **Platformers** like Super Mario or Celeste
- **Metroidvania** games with interconnected worlds
- **Tower Defense** with intelligent enemy pathfinding
- **RPGs** with tile-based movement and exploration
- **Puzzle Games** with physics-based mechanics

The game development world is your oyster! 🚀

**Keep Building, Keep Learning, Keep Creating Amazing Games!** 🎮✨