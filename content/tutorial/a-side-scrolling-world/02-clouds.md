+++
title = "Clouds"
date = 2026-03-09T06:00:00+11:00
weight = 2
draft = false
slug = "clouds"
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/a-side-scrolling-world/ladders/"
prev = "/tutorial/a-side-scrolling-world/jumping/"
+++

Cloud platforms are one-way surfaces: the player can jump through them from below, pass through them from the sides, but lands on top when falling. This tutorial adds that behaviour to the jumping system from the previous tutorial.

{{< pixidemo title="Clouds" >}}
const app = new PIXI.Application();

await app.init({
    width: 300,
    height: 240,
    backgroundColor: 0x87CEEB
});

// Game constants
const TILE_SIZE = 30;
const GRAVITY = 0.8;
const JUMP_POWER = -15;

// Tile types
const EMPTY = 0;
const SOLID = 1;
const CLOUD = 2;

// Create a map with cloud platforms
const map = [
    [1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,2,2,0,0,2,2,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,2,0,0,0,0,0],
    [0,2,2,0,0,0,0,2,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1]
];

document.body.appendChild(app.canvas);

// Create map display
const mapContainer = new PIXI.Container();
app.stage.addChild(mapContainer);

for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
        if (map[row][col] === SOLID) {
            const tile = new PIXI.Graphics()
                .rect(0, 0, TILE_SIZE, TILE_SIZE)
                .fill(0x8B4513);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            mapContainer.addChild(tile);
        } else if (map[row][col] === CLOUD) {
            const cloud = new PIXI.Graphics()
                .rect(0, 0, TILE_SIZE, TILE_SIZE)
                .fill(0xFFFFFF)
                .stroke({width: 2, color: 0x4169E1});
            cloud.x = col * TILE_SIZE;
            cloud.y = row * TILE_SIZE;
            mapContainer.addChild(cloud);
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
    onGround: false,
    wasFalling: false
};

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
        e.preventDefault();
    }
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// Collision detection
function getTileAt(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) {
        return EMPTY;
    }
    
    return map[row][col];
}

function isSolidTile(x, y) {
    return getTileAt(x, y) === SOLID;
}

function isCloudPlatform(x, y) {
    return getTileAt(x, y) === CLOUD;
}

// Cloud platform logic - only solid when falling onto them from above
function canLandOnCloud(playerX, playerY, playerHeight, velocityY) {
    if (velocityY <= 0) return false; // Only when falling
    
    const platformY = Math.floor((playerY + playerHeight) / TILE_SIZE) * TILE_SIZE;
    const leftFoot = isCloudPlatform(playerX + 5, playerY + playerHeight + 1);
    const rightFoot = isCloudPlatform(playerX + player.width - 5, playerY + playerHeight + 1);
    
    // Check if we're falling onto the platform from above
    if ((leftFoot || rightFoot) && playerY + playerHeight <= platformY + 5) {
        return platformY;
    }
    
    return false;
}

function updatePlayer() {
    // Store if player was falling (for cloud platform detection)
    player.wasFalling = player.velocityY > 0;
    
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
        player.onGround = false;
    }
    
    // Apply gravity
    player.velocityY += GRAVITY;
    
    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Collision detection
    // Check solid ground collision
    const groundCheckLeft = isSolidTile(player.x + 5, player.y + player.height + 1);
    const groundCheckRight = isSolidTile(player.x + player.width - 5, player.y + player.height + 1);
    
    if ((groundCheckLeft || groundCheckRight) && player.velocityY > 0) {
        player.y = Math.floor((player.y + player.height) / TILE_SIZE) * TILE_SIZE - player.height;
        player.velocityY = 0;
        player.onGround = true;
    }
    
    // Check cloud platform collision
    const cloudLanding = canLandOnCloud(player.x, player.y, player.height, player.velocityY);
    if (cloudLanding && player.wasFalling) {
        player.y = cloudLanding - player.height;
        player.velocityY = 0;
        player.onGround = true;
    }
    
    // Check ceiling collision (only solid tiles block upward movement)
    if (isSolidTile(player.x + player.width/2, player.y) && player.velocityY < 0) {
        player.y = Math.ceil(player.y / TILE_SIZE) * TILE_SIZE;
        player.velocityY = 0;
    }
    
    // Check if still on solid ground
    if (player.onGround) {
        const stillOnSolid = groundCheckLeft || groundCheckRight || 
                           isCloudPlatform(player.x + 5, player.y + player.height + 1) ||
                           isCloudPlatform(player.x + player.width - 5, player.y + player.height + 1);
        if (!stillOnSolid) {
            player.onGround = false;
        }
    }
    
    // Keep player in bounds
    player.x = Math.max(0, Math.min(player.x, 300 - player.width));
    player.y = Math.max(0, player.y);
    
    // Update sprite position
    player.sprite.x = player.x;
    player.sprite.y = player.y;
}

// Game loop
app.ticker.add(updatePlayer);

{{< /pixidemo >}}

## How Cloud Platforms Work

A solid tile blocks movement from every direction. A cloud tile applies collision only when the player is falling downward: the player can jump through from below, pass through from the sides, but lands on top when descending.

This selective collision is what creates the layered platform structures common in platformers — the player can reach higher platforms from below without needing a separate entry path.

![Normal solid wall blocks hero from all directions](/p11_2.gif)

![Cloud platform allows entry from sides/below, stops from above](/p11_3.gif)

## Tile Types

Define tile type constants rather than sprinkling literal numbers through the code:

```javascript
// Define tile types as constants
const TILE_TYPES = {
    EMPTY: 0,
    SOLID: 1, 
    CLOUD: 2
};

const tileProperties = {
    [TILE_TYPES.EMPTY]: {
        walkable: true,
        solid: false,
        cloud: false
    },
    [TILE_TYPES.SOLID]: {
        walkable: false,
        solid: true,
        cloud: false  
    },
    [TILE_TYPES.CLOUD]: {
        walkable: true,    // Can move through from sides
        solid: false,      // Not solid like normal walls
        cloud: true        // Special cloud behavior
    }
};

// Helper functions for tile checking
function getTileType(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) {
        return TILE_TYPES.EMPTY;
    }
    
    return map[row][col];
}

function isCloudTile(x, y) {
    return getTileType(x, y) === TILE_TYPES.CLOUD;
}

function isSolidTile(x, y) {
    return getTileType(x, y) === TILE_TYPES.SOLID;
}
```

Helper functions (`isCloudTile`, `isSolidTile`) keep the collision code readable, and adding a new tile type is a matter of adding one entry to `TILE_TYPES` and one to `tileProperties`.

## Cloud Platform Collision

A cloud tile is only solid when the player is falling onto it from above:

```javascript
function canLandOnCloudPlatform(player) {
    // Only check when player is falling down
    if (player.velocityY <= 0) {
        return null; // Not falling, can't land
    }
    
    // Check both feet positions
    const leftFootX = player.x + 5;  // Slight inset from edge
    const rightFootX = player.x + player.width - 5;
    const feetY = player.y + player.height + 1; // Just below player
    
    // Are either feet touching cloud platforms?
    const leftOnCloud = isCloudTile(leftFootX, feetY);
    const rightOnCloud = isCloudTile(rightFootX, feetY);
    
    if (leftOnCloud || rightOnCloud) {
        // Calculate exact platform surface
        const platformRow = Math.floor(feetY / TILE_SIZE);
        const platformY = platformRow * TILE_SIZE;
        
        // Only land if falling onto platform from above
        if (player.y + player.height <= platformY + 5) {
            return platformY; // Return platform surface Y position
        }
    }
    
    return null; // No valid cloud platform landing
}
```

The three conditions for landing: `velocityY > 0` (falling, not rising), the player's feet are at the platform's tile row, and the player's feet are at or above the platform surface (not already embedded inside it). Checking both feet handles the case where the player is partially over the edge.

### Integrating Cloud Collision

The collision function checks solid tiles first, then cloud tiles, then ceiling. Cloud tiles are never checked for upward movement:

```javascript
function checkCollisions() {
    // Normal solid tile collision first
    if (player.velocityY > 0) { // Falling
        const solidGroundHit = checkSolidGroundCollision();
        if (solidGroundHit) {
            landOnSurface(solidGroundHit);
            return;
        }
        
        // Check cloud platform collision
        const cloudLanding = canLandOnCloudPlatform(player);
        if (cloudLanding) {
            landOnSurface(cloudLanding);
            return;
        }
    }
    
    // Ceiling collision — cloud tiles never block upward movement
    if (player.velocityY < 0) {
        const ceilingHit = checkCeilingCollision(); // Only solid tiles
        if (ceilingHit) {
            hitCeiling(ceilingHit);
        }
    }
}

function landOnSurface(surfaceY) {
    player.y = surfaceY - player.height;
    player.velocityY = 0;
    player.onGround = true;
}
```

## Putting It All Together: Cloud Platform Movement

Now we need to update our movement and falling logic to handle cloud platforms correctly:

```javascript
// In your main game loop
function updateMovementAndCollision() {
    handleInput();        // Process player controls
    updatePhysics();      // Apply gravity and velocity
    checkCollisions();    // Handle all collision types
    checkStillOnGround(); // See if player walked off platform
}

function checkStillOnGround() {
    if (!player.onGround) return; // Already falling
    
    // Check if still standing on solid ground OR cloud platform
    const leftFoot = player.x + 5;
    const rightFoot = player.x + player.width - 5;
    const groundLevel = player.y + player.height + 1;
    
    const onSolid = isSolidTile(leftFoot, groundLevel) || 
                   isSolidTile(rightFoot, groundLevel);
    
    const onCloud = isCloudTile(leftFoot, groundLevel) || 
                   isCloudTile(rightFoot, groundLevel);
    
    // If not on any platform, start falling
    if (!onSolid && !onCloud) {
        player.onGround = false;
        // Gravity will take over next frame
    }
}
```

The edge-detection check (`checkStillOnGround`) must test for cloud tiles as well as solid tiles, otherwise the player will float in mid-air after walking off a cloud platform. When neither foot is over a solid or cloud tile, `player.onGround` becomes `false` and gravity resumes.

Next: [Ladders](/tutorial/a-side-scrolling-world/ladders/)