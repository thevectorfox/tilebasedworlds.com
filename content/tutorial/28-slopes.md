+++
title = "Slopes"
date = 2026-03-10T00:00:00+11:00
weight = 28
draft = false
tags = ["advanced", "optimization", "tutorial"]
next = ""
prev = "/tutorial/27-pathfinding-best-first/"
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

## CODE IT

Start with the code from tutorial 7 Jumping.

Declare new tile prototypes:

```
game.Tile4 = function() {};
game.Tile4.prototype.walkable = true;
game.Tile4.prototype.slope = 1;
game.Tile4.prototype.frame = 4;
game.Tile5 = function() {};
game.Tile5.prototype.walkable = true;
game.Tile5.prototype.slope = -1;
game.Tile5.prototype.frame = 5;
```

Tile4 has slope moving upward (/) and tile5 has slope moving down (\). Draw the slopes in frames you have set with frame property.

New functions are such nice things. They are fresh, smell good and do things you never knew could be done. Let's make checkForSlopes function:

```
function checkForSlopes (ob, diry, dirx)
{
  if (game["t_" + (ob.ytile + 1) + "_" + ob.xtile].slope and !ob.jump)
  {
    ob.ytile += 1;
    ob.y += game.tileH;
  }
  if (game["t_" + ob.ytile + "_" + ob.xtile].slope and diry != -1)
  {
    if (diry == 1)
    {
      ob.y = (ob.ytile + 1) * game.tileH - ob.height;
    }
    var xpos = ob.x - ob.xtile * game.tileW;
    ob.onSlope = game["t_" + ob.ytile + "_" + ob.xtile].slope;
    ob.jump = false;
    if(game["t_" + ob.ytile + "_" + ob.xtile].slope == 1)
    {
      ob.addy = xpos;
      ob.clip._y = (ob.ytile + 1) * game.tileH - ob.height - ob.addy;
    }
    else
    {
      ob.addy = game.tileW - xpos;
      ob.clip._y = (ob.ytile + 1) * game.tileH - ob.height - ob.addy;
    }
  }
  else
  {
    if((ob.onSlope == 1 and dirx == 1) or (ob.onSlope == -1 and dirx == -1))
    {
      ob.ytile -= 1;
      ob.y -= game.tileH;
      ob.clip._y = ob.y;
    }
    ob.onSlope = false;
  }
}
```

This function will be called from moveChar function with movement variables dirx and diry. First if statement checks for the slope on the tile below current tile. This is for the situation, where hero currently stands on unwalkable tile, but moves left or right and there is slope going down from his current height. If there is slope below hero, we increase the ytile and y. However, we will not check for it, if hero is jumping.

Next if statement checks for the slope on the tile hero currently is. The diry != -1 part ignores the check, if SPACE key has been pressed and hero jumps up.

If we were falling down (diry == 1), we will set the y property as if hero would of landed on tile below. We set jump property to false and onSlope property equal to the slope value on current tile (1 or -1).

xpos is the value of how far from the left edge of current tile center of our hero is:

![](/p29_6.gif)

If slope is going up, then we move hero up by the value of xpos, if its going down, then by the value of tileW-xpos. Note that if you don't use square tile, then you would need to find xpos as percentage from tileW.

Last part after else statement checks if we were standing on slope, but now we have moved off from it onto higher tile.

Next take moveChar function. Modify the check for going left and right:

```
//left
if ((ob.downleft and ob.upleft) or ob.onSlope)
{
  ...
 
//right
if ((ob.upright and ob.downright) or ob.onSlope)
{
  ...
```
 
Here we will basically ignore all collision checks for left/right movement as long hero is on the slope. Remember, while on slope, he is standing partially inside the wall, so we can't use normal collision with his corners.

After placing the hero movie clip, call checkForSlopes function:

```
ob.clip._x = ob.x;
ob.clip._y = ob.y;
checkForSlopes(ob, diry, dirx);
```

When we jump while standing on the slope, we have to update the y coordinate of the hero. Modify detectKeys function:

```
if (Key.isDown(Key.SPACE))
{
  if (!ob.jump)
  {
    //if we were on slope, update
    if (ob.onSlope)
    {
      ob.y -= ob.addy;
      ob.ytile = Math.floor(ob.y / game.tileH);
    }
    ob.jump = true;
    ob.jumpspeed = ob.jumpstart;
  }
}
else if (Key.isDown(Key.RIGHT))
{
  keyPressed = _root.moveChar(ob, 1, 0);
}
else if (Key.isDown(Key.LEFT))
{
  keyPressed = _root.moveChar(ob, -1, 0);
}
```

If hero has onSlope property set to true, we will first update its y property and calculate new value for the ytile.

You can download the source fla with all the code and movie set up here.