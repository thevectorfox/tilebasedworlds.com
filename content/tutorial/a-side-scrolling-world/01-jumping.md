+++
title = "Jumping"
date = 2026-03-09T05:00:00+11:00
weight = 1
draft = false
slug = "jumping"
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/a-side-scrolling-world/clouds/"
prev = ""
+++

This tutorial switches from top-down to side-scrolling view. The hero moves left and right with arrow keys and jumps with spacebar. The jump mechanic is built on two properties: an initial upward velocity and a per-frame gravity that pulls the hero back down.

{{< pixidemo title="Jumping" >}}
const app = new PIXI.Application();

await app.init({
    width: 300,
    height: 240,
    backgroundColor: 0x87CEEB
});

document.body.appendChild(app.canvas);

// Game constants
const TILE_SIZE = 30;
const GRAVITY = 0.8;
const JUMP_POWER = -15;

// Create a simple map
const map = [
    [1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,1,1,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,0,0,0],
    [0,0,1,1,0,0,0,0,1,0],
    [0,0,0,0,0,0,0,0,0,0],
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
                .fill(0x8B4513);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            mapContainer.addChild(tile);
        }
    }
}

// Create hero
const hero = new PIXI.Graphics()
    .rect(0, 0, 12, 12)
    .fill(0xff4444);
hero.x = 60;
hero.y = map.length * TILE_SIZE - TILE_SIZE - 12;
app.stage.addChild(hero);

// Hero properties
const player = {
    sprite: hero,
    x: 60,
    y: map.length * TILE_SIZE - TILE_SIZE - 12,
    width: 12,
    height: 12,
    velocityX: 0,
    velocityY: 0,
    speed: 2,
    jumpPower: JUMP_POWER,
    onGround: false
};

// Status display for educational purposes
function updateStatus() {
    const vY = player.velocityY.toFixed(1);
    const status = `Velocity Y: ${vY} | Ground: ${player.onGround ? 'Yes' : 'No'} | State: ${
        player.onGround ? 'Standing' : player.velocityY < 0 ? 'Rising' : 'Falling'
    }`;
    window.parent.postMessage({ type: 'pixidemo-status', text: status }, '*');
}

// Input handling with browser scroll prevention
const keys = {};
window.addEventListener('keydown', (e) => { 
    keys[e.code] = true; 
    // Prevent default browser behavior (especially spacebar scrolling!)
    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
        e.preventDefault();
    }
});
window.addEventListener('keyup', (e) => { 
    keys[e.code] = false; 
    // Prevent default for consistency
    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
        e.preventDefault();
    }
});

// Collision detection
function checkTileCollision(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) {
        return false;
    }
    
    return map[row][col] === 1;
}

function updatePlayer() {
    // Horizontal movement
    if (keys['ArrowLeft']) {
        player.velocityX = -player.speed;
    } else if (keys['ArrowRight']) {
        player.velocityX = player.speed;
    } else {
        player.velocityX = 0;
    }
    
    // Jumping - only when on ground!
    if (keys['Space'] && player.onGround) {
        player.velocityY = player.jumpPower;
        player.onGround = false;
    }
    
    // Apply gravity
    player.velocityY += GRAVITY;
    
    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Collision detection
    // Check ground collision while falling
    const groundCheck = checkTileCollision(player.x + player.width/2, player.y + player.height + 1);
    if (groundCheck && player.velocityY > 0) {
        // Land on ground - snap to tile boundary
        player.y = Math.floor((player.y + player.height) / TILE_SIZE) * TILE_SIZE - player.height;
        player.velocityY = 0;
        player.onGround = true;
    } else if (!groundCheck) {
        player.onGround = false;
    }
    
    // Check ceiling collision while jumping up
    if (checkTileCollision(player.x + player.width/2, player.y) && player.velocityY < 0) {
        player.y = Math.ceil(player.y / TILE_SIZE) * TILE_SIZE;
        player.velocityY = 0; // Stop upward movement
    }
    
    // Keep player in bounds
    player.x = Math.max(0, Math.min(player.x, 300 - player.width));
    player.y = Math.max(0, player.y);
    
    // Update sprite visuals
    player.sprite.x = player.x;
    player.sprite.y = player.y;
    
    // Educational status display
    updateStatus();
}

// Game loop
app.ticker.add(updatePlayer);
{{< /pixidemo >}}


## Jump Physics: Making It Feel Right

In this coordinate system, moving up means decreasing Y. Pressing spacebar sets `velocityY` to a negative value like `-15` pixels per frame. Each frame after that, gravity increments `velocityY` back toward positive (downward):

```javascript
// Each frame, gravity makes you fall faster
player.velocityY += gravity;
player.y += player.velocityY;
```

Watch this in action: Starting jump speed `-15`, gravity `0.8`:
- Frame 1: velocity = -15, move up 15 pixels
- Frame 2: velocity = -14.2, move up 14.2 pixels  
- Frame 3: velocity = -13.4, move up 13.4 pixels
- ...eventually velocity = 0 (peak of jump)
- Then velocity becomes positive and you fall!

Gravity values control fall feel: 0.3 is floaty, 1.2 is snappy. Different characters can have separate gravity values.

### Collision Response

When the player contacts a surface:
- **Hit ceiling while jumping up?** Set `velocityY = 0` and start falling
- **Land on ground while falling?** Set `velocityY = 0` and allow jumping again
- **Walk off a platform?** Start falling immediately!

Keep velocities smaller than the tile size. If `velocityY` exceeds `TILE_SIZE` in a single frame, the player can skip past a one-tile-thick floor without triggering the collision check.

Horizontal and vertical velocities are independent — left/right movement is unaffected by jumping or falling.


## Player Properties

The player object needs a few extra properties to support jumping:

```javascript
const player = {
    x: 100,
    y: 200,
    width: 12,
    height: 12,
    velocityX: 0,
    velocityY: 0,
    speed: 2,              // Left/right movement speed
    jumpPower: -15,        // Initial upward velocity (negative = up)
    gravity: 0.8,          // Added to velocityY each frame
    onGround: false        // Prevents jumping while airborne
};
```

### Spawn Position

Place the hero on top of a floor tile rather than in open space. Start with `onGround: true` and `velocityY: 0` so the hero doesn't fall through the floor on the first frame:

```javascript
function placeHeroOnGround(tileX, tileY) {
    player.x = tileX * TILE_SIZE;
    player.y = (tileY + 1) * TILE_SIZE - player.height;
    player.onGround = true;
    player.velocityY = 0;
}
```


## Input Handling

Track which keys are held with a `keys` object updated by event listeners:

```javascript
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    // Prevents spacebar from scrolling the page
    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
        e.preventDefault();
    }
});

function handleInput() {
    player.velocityX = 0;

    if (keys['ArrowLeft'])  player.velocityX = -player.speed;
    if (keys['ArrowRight']) player.velocityX =  player.speed;

    if (keys['Space'] && player.onGround) {
        player.velocityY = player.jumpPower;
        player.onGround = false;
    }
}
```

Checking `player.onGround` before applying `jumpPower` prevents the player from jumping while airborne. The `e.preventDefault()` calls prevent the browser from scrolling the page when spacebar or arrow keys are pressed — without them the page scrolls instead of the hero jumping.

## Physics Update

Each frame, apply gravity and move the player by their current velocity:

```javascript
function updatePhysics() {
    player.velocityY += player.gravity;

    // Cap fall speed — if velocityY exceeds TILE_SIZE the player
    // can skip past a one-tile floor in a single frame
    const maxFallSpeed = TILE_SIZE * 0.8;
    if (player.velocityY > maxFallSpeed) player.velocityY = maxFallSpeed;

    player.x += player.velocityX;
    player.y += player.velocityY;

    player.x = Math.max(0, Math.min(player.x, 300 - player.width));
}
```

Separating input, physics, and collision into distinct functions makes each piece straightforward to modify independently:

```javascript
function gameLoop() {
    handleInput();
    updatePhysics();
    checkCollisions();
}
```

## Collision Detection

The `isSolid` helper checks a single pixel coordinate against the map array:

```javascript
function isSolid(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return true;
    return map[row][col] === 1;
}
```

Collision runs separately for vertical and horizontal movement. Checking two points (left foot and right foot, or left and right of the head) catches contacts that a single midpoint check would miss:

```javascript
function checkCollisions() {
    // Falling: will the player's bottom overlap a tile?
    if (player.velocityY > 0) {
        const newBottom = player.y + player.height + player.velocityY;
        if (isSolid(player.x + 2, newBottom) || isSolid(player.x + player.width - 2, newBottom)) {
            player.y = Math.floor(newBottom / TILE_SIZE) * TILE_SIZE - player.height;
            player.velocityY = 0;
            player.onGround = true;
        } else {
            player.y += player.velocityY;
        }
    } else if (player.velocityY < 0) {
        // Rising: will the player's top overlap a tile?
        const newTop = player.y + player.velocityY;
        if (isSolid(player.x + 2, newTop) || isSolid(player.x + player.width - 2, newTop)) {
            player.y = Math.ceil(newTop / TILE_SIZE) * TILE_SIZE;
            player.velocityY = 0;
        } else {
            player.y += player.velocityY;
        }
    }
}
```

### Edge Detection

When the player walks off a platform's edge, `onGround` needs to become `false` so gravity resumes. Check whether there is still solid ground beneath the player's feet each frame:

```javascript
if (player.onGround) {
    if (!isSolid(player.x + 2, player.y + player.height + 1) &&
        !isSolid(player.x + player.width - 2, player.y + player.height + 1)) {
        player.onGround = false;
    }
}
```

The +1 offset tests one pixel below the feet — if neither foot is over a solid tile, gravity takes over next frame.

Next: [Clouds](/tutorial/a-side-scrolling-world/clouds/)