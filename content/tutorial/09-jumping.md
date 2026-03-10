+++
title = "Jumping"
date = 2026-03-09T05:00:00+11:00
weight = 9
draft = false
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/10-clouds/"
prev = "/tutorial/08-open-the-door/"
+++

Time to add one of the most satisfying mechanics in gaming - jumping! We're switching from top-down to side-scrolling view, where your hero can run left and right with arrow keys and launch into the air with the spacebar. Let's create that perfect jump feel that makes players want to bounce around your world!

<div id="jumpingDemo" style="text-align: center; margin: 20px 0;">
    <canvas id="jumpCanvas" width="640" height="480" style="border: 2px solid #333; background: #87CEEB;"></canvas>
    <div style="margin-top: 10px;">
        <strong>Controls:</strong> Arrow Keys to move, Spacebar to jump
    </div>
</div>

<script type="module">
import { Application, Sprite, Container, Graphics, Ticker } from 'https://unpkg.com/pixi.js@8.0.0/dist/pixi.min.mjs';

const canvas = document.getElementById('jumpCanvas');
const app = new Application();

await app.init({
    canvas: canvas,
    width: 640,
    height: 480,
    backgroundColor: 0x87CEEB
});

// Game constants
const TILE_SIZE = 40;
const GRAVITY = 0.8;
const JUMP_POWER = -15;

// Create a simple map
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,1,0,0,0,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,0,0,0,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Create map display
const mapContainer = new Container();
app.stage.addChild(mapContainer);

for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
        if (map[row][col] === 1) {
            const tile = new Graphics()
                .rect(0, 0, TILE_SIZE, TILE_SIZE)
                .fill(0x8B4513);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            mapContainer.addChild(tile);
        }
    }
}

// Create hero
const hero = new Graphics()
    .rect(0, 0, 30, 35)
    .fill(0xFF6B6B);
hero.x = 80;
hero.y = map.length * TILE_SIZE - TILE_SIZE - 35;
app.stage.addChild(hero);

// Hero properties
const player = {
    sprite: hero,
    x: 80,
    y: map.length * TILE_SIZE - TILE_SIZE - 35,
    width: 30,
    height: 35,
    velocityX: 0,
    velocityY: 0,
    speed: 4,
    jumpPower: JUMP_POWER,
    onGround: false,
    jumping: false
};

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

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
    
    // Jumping
    if (keys['Space'] && player.onGround) {
        player.velocityY = player.jumpPower;
        player.jumping = true;
        player.onGround = false;
    }
    
    // Apply gravity
    player.velocityY += GRAVITY;
    
    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Collision detection
    // Check ground
    const groundCheck = checkTileCollision(player.x + player.width/2, player.y + player.height + 1);
    if (groundCheck && player.velocityY > 0) {
        player.y = Math.floor((player.y + player.height) / TILE_SIZE) * TILE_SIZE - player.height;
        player.velocityY = 0;
        player.onGround = true;
        player.jumping = false;
    } else if (!groundCheck) {
        player.onGround = false;
    }
    
    // Check ceiling
    if (checkTileCollision(player.x + player.width/2, player.y) && player.velocityY < 0) {
        player.y = Math.ceil(player.y / TILE_SIZE) * TILE_SIZE;
        player.velocityY = 0;
    }
    
    // Keep player in bounds
    player.x = Math.max(0, Math.min(player.x, 640 - player.width));
    player.y = Math.max(0, player.y);
    
    // Update sprite position
    player.sprite.x = player.x;
    player.sprite.y = player.y;
}

// Game loop
app.ticker.add(updatePlayer);
</script>


## Jump Physics: Making It Feel Right

Every great jump starts with an upward burst! In our coordinate system, moving up means **decreasing** the Y coordinate. So when you hit spacebar, we set `velocityY` to a negative value like `-15` pixels per frame.

Here's where the magic happens: **gravity**! After that initial push, gravity constantly pulls your hero back down. Each frame, we add gravity (a positive value like `0.8`) to the Y velocity:

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

**Pro tip**: Experiment with gravity values! Low gravity (0.3) feels floaty like Mario on the moon. High gravity (1.2) feels snappy like Mega Man. Different characters can have different gravity for unique feels!

### Collision Magic

When your hero smacks into something:
- **Hit ceiling while jumping up?** Set `velocityY = 0` and start falling
- **Land on ground while falling?** Set `velocityY = 0` and allow jumping again
- **Walk off a platform?** Start falling immediately!

⚠️ **Speed limit warning**: Keep velocities smaller than your tile size, or your hero might teleport through walls! Fast-moving objects need more collision checks.

The beauty of physics: jumping doesn't interfere with left/right movement at all. You can run and jump simultaneously for that perfect platformer feel!


## Your Jumping Hero Setup

Let's upgrade our hero with jumping superpowers! Add these essential properties:

```javascript
const player = {
    // Position and movement
    x: 100,
    y: 200,
    width: 30,
    height: 35,
    
    // Physics properties
    velocityX: 0,
    velocityY: 0,
    speed: 4,              // Left/right movement speed
    jumpPower: -15,        // Initial upward velocity
    gravity: 0.8,          // How fast gravity pulls down
    
    // State tracking
    onGround: false,       // Can we jump right now?
    isJumping: false       // Are we currently in the air?
};
```

**Key properties explained:**
- `jumpPower`: Negative value for upward force (try -12 to -20)
- `gravity`: How quickly you fall back down (0.5 = floaty, 1.2 = quick)
- `onGround`: Prevents double-jumping unless you want Moon physics!

### Spawn Position Fix

When placing your hero on the map, make sure they start **on top** of a tile, not floating in mid-air:

```javascript
// Place hero at bottom of starting tile
function placeHeroOnGround(tileX, tileY) {
    player.x = tileX * TILE_SIZE;
    player.y = (tileY + 1) * TILE_SIZE - player.height;
    player.onGround = true;
    player.velocityY = 0;
}
```

This ensures your hero starts standing properly instead of immediately falling through the world!


## Input Handling: Launch Into Action!

Time to wire up those controls! We'll use modern event listeners for smooth, responsive input:

```javascript
// Track which keys are currently pressed
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

function handleInput() {
    // Horizontal movement
    player.velocityX = 0; // Reset horizontal velocity
    
    if (keys['ArrowLeft']) {
        player.velocityX = -player.speed;
    }
    if (keys['ArrowRight']) {
        player.velocityX = player.speed;
    }
    
    // Jumping - only if on ground!
    if (keys['Space'] && player.onGround) {
        player.velocityY = player.jumpPower;
        player.isJumping = true;
        player.onGround = false;
        
        // Optional: Add jump sound effect here!
        // playSound('jump');
    }
}
```

**Anti-double-jump protection**: Notice how we check `player.onGround` before allowing a jump. This prevents infinite air-jumping unless you specifically want that mechanic!

**Pro tip**: You can create different jump feels by varying the `jumpPower` based on how long spacebar is held, or add coyote time (brief jump window after leaving a platform). These small touches make huge differences in game feel!

## Physics Update: The Heart of Jumping

Here's where the magic happens! Every frame, we update physics and position:

```javascript
function updatePhysics() {
    // Apply gravity constantly
    player.velocityY += player.gravity;
    
    // Cap falling speed to prevent tunneling through tiles
    const maxFallSpeed = TILE_SIZE * 0.8;
    if (player.velocityY > maxFallSpeed) {
        player.velocityY = maxFallSpeed;
    }
    
    // Update position based on velocity
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Keep player in world bounds
    player.x = Math.max(0, Math.min(player.x, worldWidth - player.width));
}
```

**Why cap falling speed?** If your hero falls too fast, they might skip past collision tiles entirely. Think of it as a speed limit that prevents wall-clipping bugs!

### Modern Movement System

Unlike the old approach, modern games separate input, physics, and collision:

```javascript
function gameLoop() {
    handleInput();        // Read what player wants to do
    updatePhysics();      // Apply gravity and velocity
    checkCollisions();    // Handle hitting walls/ground
    updateAnimation();    // Make it look pretty
    render();            // Draw everything
}
```

This clean separation makes your code easier to debug and modify. Want to add power-ups that change gravity? Just modify `updatePhysics()`. Need different collision rules? Update `checkCollisions()`!

## Collision Detection: Bouncing Off Reality

Now for the crucial part - making your hero actually interact with the world!

```javascript
function checkCollisions() {
    // Check if hitting ground while falling
    if (player.velocityY > 0) {
        const groundY = checkGroundCollision(player.x, player.y + player.height);
        if (groundY !== null) {
            player.y = groundY - player.height;
            player.velocityY = 0;
            player.onGround = true;
            player.isJumping = false;
        }
    }
    
    // Check if hitting ceiling while jumping
    if (player.velocityY < 0) {
        const ceilingY = checkCeilingCollision(player.x, player.y);
        if (ceilingY !== null) {
            player.y = ceilingY;
            player.velocityY = 0; // Stop upward movement
        }
    }
    
    // Check for platform edges (start falling)
    if (player.onGround && !isStandingOnSolid()) {
        player.onGround = false;
        // Start falling with zero initial velocity
    }
}

function checkGroundCollision(x, y) {
    // Check if the player's bottom edge hits a solid tile
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    
    if (map[tileY] && map[tileY][tileX] === 1) {
        return tileY * TILE_SIZE;
    }
    return null;
}

function isStandingOnSolid() {
    // Check if there's solid ground beneath the player
    const leftFoot = checkGroundCollision(player.x, player.y + player.height + 1);
    const rightFoot = checkGroundCollision(player.x + player.width, player.y + player.height + 1);
    
    return leftFoot !== null || rightFoot !== null;
}
```

### Edge Detection: No More Floating Heroes!

**The classic problem**: Hero walks off a platform but keeps floating in mid-air like a cartoon character who hasn't looked down yet.

**The solution**: Every frame, check if there's still solid ground beneath your hero. If not, immediately start falling!

```javascript
// In your main game loop, after movement:
if (player.onGround && !isStandingOnSolid()) {
    player.onGround = false;
    // Hero will start falling next frame due to gravity
}
```

**Boom!** Now you have realistic jumping physics that feel responsive and natural. Your hero can run, jump, hit ceilings, land on platforms, and fall off edges just like in professional games!

**Next up**: In the clouds tutorial, we'll add one-way platforms you can jump through from below but land on from above. The jumping foundation you just built makes this incredibly easy to add!