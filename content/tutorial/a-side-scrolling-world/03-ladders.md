+++
title = "Ladders"
date = 2026-03-09T07:00:00+11:00
weight = 3
draft = false
slug = "ladders"
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/a-side-scrolling-world/moving-tiles/"
prev = "/tutorial/a-side-scrolling-world/clouds/"
+++

Ladders let the player climb vertically through the level using the up and down arrow keys. While climbing, gravity is disabled and the player snaps to the ladder's centre column. This tutorial adds that system on top of the jumping mechanics from the previous tutorials.

{{< pixidemo title="Ladders" >}}
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
const CLIMB_SPEED = 2;

// Tile types
const EMPTY = 0;
const SOLID = 1;
const LADDER = 2;

// Create a map with ladders
const map = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,2,0,1,1,1],
    [1,0,0,0,0,2,0,0,0,1],
    [1,1,1,0,0,2,0,0,1,1],
    [1,0,0,0,0,2,0,0,0,1],
    [1,0,0,2,2,2,2,2,0,1],
    [1,1,1,1,1,1,1,1,1,1]
];

// Create map display
const mapContainer = new PIXI.Container();
app.stage.addChild(mapContainer);

for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
        const tileType = map[row][col];

        if (tileType === SOLID) {
            const tile = new PIXI.Graphics()
                .rect(0, 0, TILE_SIZE, TILE_SIZE)
                .fill(0x8B4513);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            mapContainer.addChild(tile);
        } else if (tileType === LADDER) {
            // Draw ladder background (slightly darker)
            const bg = new PIXI.Graphics()
                .rect(0, 0, TILE_SIZE, TILE_SIZE)
                .fill(0x654321);
            bg.x = col * TILE_SIZE;
            bg.y = row * TILE_SIZE;
            mapContainer.addChild(bg);

            // Draw ladder rungs
            const ladder = new PIXI.Graphics();
            for (let i = 0; i < 4; i++) {
                ladder.rect(5, 2 + i * 7, 20, 2).fill(0xD2B48C);
            }
            // Side rails
            ladder.rect(3, 0, 3, TILE_SIZE).fill(0xD2B48C);
            ladder.rect(24, 0, 3, TILE_SIZE).fill(0xD2B48C);
            ladder.x = col * TILE_SIZE;
            ladder.y = row * TILE_SIZE;
            mapContainer.addChild(ladder);
        }
    }
}

// Create hero
const hero = new PIXI.Graphics()
    .rect(0, 0, 12, 12)
    .fill(0xff4444);
hero.x = 60;
hero.y = 180;
app.stage.addChild(hero);

// Hero properties
const player = {
    sprite: hero,
    x: 60,
    y: 180,
    width: 12,
    height: 12,
    velocityX: 0,
    velocityY: 0,
    speed: 2,
    climbSpeed: CLIMB_SPEED,
    isClimbing: false,
    onGround: false
};

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// Helper functions
function getTileAt(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) {
        return EMPTY;
    }
    
    return map[row][col];
}

function isLadder(x, y) {
    return getTileAt(x, y) === LADDER;
}

function isSolid(x, y) {
    return getTileAt(x, y) === SOLID;
}

// Ladder detection
function canClimbHere() {
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    
    return isLadder(centerX, centerY);
}

function canClimbUp() {
    if (!canClimbHere()) return false;
    
    const centerX = player.x + player.width / 2;
    const topY = player.y - player.climbSpeed;
    
    return isLadder(centerX, topY) || isLadder(centerX, player.y);
}

function canClimbDown() {
    if (!canClimbHere()) return false;
    
    const centerX = player.x + player.width / 2;
    const bottomY = player.y + player.height + player.speed;
    
    return isLadder(centerX, bottomY);
}

function updatePlayer() {
    // Handle climbing vs normal movement
    if (player.isClimbing) {
        // Climbing movement
        player.velocityX = 0; // No horizontal drift while climbing
        player.velocityY = 0; // No gravity while climbing
        
        if (keys['ArrowUp'] && canClimbUp()) {
            player.y -= player.climbSpeed;
            // Center player on ladder
            const ladderCenterX = Math.floor((player.x + player.width/2) / TILE_SIZE) * TILE_SIZE + TILE_SIZE/2;
            player.x = ladderCenterX - player.width/2;
        } else if (keys['ArrowDown'] && canClimbDown()) {
            player.y += player.climbSpeed;
            // Center player on ladder
            const ladderCenterX = Math.floor((player.x + player.width/2) / TILE_SIZE) * TILE_SIZE + TILE_SIZE/2;
            player.x = ladderCenterX - player.width/2;
        } else if (keys['ArrowLeft'] || keys['ArrowRight']) {
            // Try to move off ladder
            const direction = keys['ArrowLeft'] ? -1 : 1;
            const newX = player.x + direction * player.speed;
            
            // Check if we can move horizontally off the ladder
            if (!isSolid(newX, player.y) && !isSolid(newX + player.width, player.y) &&
                !isSolid(newX, player.y + player.height) && !isSolid(newX + player.width, player.y + player.height)) {
                player.x = newX;
                player.isClimbing = false;
            }
        }
        
        // Check if still on ladder
        if (!canClimbHere()) {
            player.isClimbing = false;
        }
    } else {
        // Normal platformer movement
        if (keys['ArrowLeft']) {
            player.velocityX = -player.speed;
        } else if (keys['ArrowRight']) {
            player.velocityX = player.speed;
        } else {
            player.velocityX = 0;
        }
        
        // Check for ladder entry
        if ((keys['ArrowUp'] || keys['ArrowDown']) && canClimbHere()) {
            player.isClimbing = true;
            return; // Skip normal physics this frame
        }
        
        // Apply gravity
        player.velocityY += GRAVITY;
        
        // Update position
        player.x += player.velocityX;
        player.y += player.velocityY;
        
        // Ground collision
        const groundCheck = isSolid(player.x + player.width/2, player.y + player.height + 1);
        if (groundCheck && player.velocityY > 0) {
            player.y = Math.floor((player.y + player.height) / TILE_SIZE) * TILE_SIZE - player.height;
            player.velocityY = 0;
            player.onGround = true;
        } else {
            player.onGround = false;
        }
        
        // Ceiling collision
        if (isSolid(player.x + player.width/2, player.y) && player.velocityY < 0) {
            player.y = Math.ceil(player.y / TILE_SIZE) * TILE_SIZE;
            player.velocityY = 0;
        }
    }
    
    // Keep player in bounds
    player.x = Math.max(0, Math.min(player.x, 300 - player.width));
    player.y = Math.max(0, player.y);
    
    // Update sprite position
    player.sprite.x = player.x;
    player.sprite.y = player.y;
    
    // Visual feedback for climbing
    if (player.isClimbing) {
        player.sprite.tint = 0xFFFF99; // Slight yellow tint while climbing
    } else {
        player.sprite.tint = 0xFFFFFF; // Normal color
    }
}

// Game loop
app.ticker.add(updatePlayer);
{{< /pixidemo >}}

## Ladder Types

There are four common ladder variants, and the choice affects level design possibilities:

**Type A — Wall Ladders**: The ladder tile is inside a solid column. The player can climb but cannot move left/right. Used in Castlevania-style games with tight vertical shafts.

**Type B — Walkable Ladders**: The ladder tile is passable from the sides. The player can climb or walk through it. Common in Mega Man-style open stages.

**{{< icon name="arrow-up" >}} Type C — Top-only Ladders**: The ladder extends upward only, with no tile below. The player can ascend but not descend past the bottom rung.

**Type D — Floating Ladders**: The ladder ends in open air. Whether the player can stand on top is a design decision — consistency with other surfaces matters here.

![Different ladder types and their behaviors](/p12_2.gif)


## Ladder Rules

The rules governing this tutorial's implementation:

- The player climbs with the up/down arrow keys
- The player can climb up if there is a ladder tile at the current position or above
- The player can climb down if there is a ladder tile below the destination
- The player can move left/right off the ladder if no wall blocks the path
- The player cannot jump while in climbing mode

## Tile Setup

```javascript
// Tile type constants
const TILE_TYPES = {
    EMPTY: 0,
    SOLID: 1,
    LADDER: 2,
    LADDER_SOLID: 3  // Ladder you can also walk on
};

// Tile properties
const tileProperties = {
    [TILE_TYPES.EMPTY]: {
        solid: false,
        climbable: false,
        walkable: true
    },
    [TILE_TYPES.SOLID]: {
        solid: true,
        climbable: false, 
        walkable: false
    },
    [TILE_TYPES.LADDER]: {
        solid: false,
        climbable: true,
        walkable: false  // Can't walk through, only climb
    },
    [TILE_TYPES.LADDER_SOLID]: {
        solid: false,
        climbable: true,
        walkable: true   // Can walk AND climb
    }
};

// Helper functions
function getTileProperties(tileType) {
    return tileProperties[tileType] || tileProperties[TILE_TYPES.EMPTY];
}

function isClimbable(x, y) {
    const tileType = getTileAt(x, y);
    return getTileProperties(tileType).climbable;
}

function isSolid(x, y) {
    const tileType = getTileAt(x, y);
    return getTileProperties(tileType).solid;
}
```

The `LADDER_SOLID` type handles the case where a ladder sits on top of a floor tile — the player can both stand on and climb from that position.

## Climbing Controls

```javascript
function handleClimbingInput(player, keys) {
    if (player.isClimbing) {
        // Climbing mode - up/down movement
        if (keys['ArrowUp'] && canClimbUp(player)) {
            player.y -= player.climbSpeed;
            centerPlayerOnLadder(player);
        } else if (keys['ArrowDown'] && canClimbDown(player)) {
            player.y += player.climbSpeed;
            centerPlayerOnLadder(player);
        } else if (keys['ArrowLeft'] || keys['ArrowRight']) {
            // Try to exit ladder horizontally
            tryExitLadder(player, keys['ArrowLeft'] ? -1 : 1);
        }
    } else {
        // Normal mode - check for ladder entry
        if ((keys['ArrowUp'] || keys['ArrowDown']) && canStartClimbing(player)) {
            player.isClimbing = true;
            player.velocityY = 0; // Stop falling
            centerPlayerOnLadder(player);
        }
    }
}

function centerPlayerOnLadder(player) {
    // Snap player to center of ladder for clean movement
    const ladderCol = Math.floor((player.x + player.width/2) / TILE_SIZE);
    const ladderCenterX = ladderCol * TILE_SIZE + TILE_SIZE/2;
    player.x = ladderCenterX - player.width/2;
}

function tryExitLadder(player, direction) {
    const newX = player.x + direction * player.speed;
    
    // Check all four corners for wall collision
    const corners = [
        {x: newX, y: player.y},                           // Top-left
        {x: newX + player.width, y: player.y},            // Top-right  
        {x: newX, y: player.y + player.height},           // Bottom-left
        {x: newX + player.width, y: player.y + player.height} // Bottom-right
    ];
    
    // Only exit if no corners hit walls
    const canExit = corners.every(corner => !isSolid(corner.x, corner.y));
    
    if (canExit) {
        player.x = newX;
        player.isClimbing = false;
    }
}
```

`centerPlayerOnLadder` snaps the player to the horizontal centre of the ladder column each frame, preventing drift. `tryExitLadder` checks all four corners before allowing a horizontal exit, preventing the player from stepping into a wall.


## Climb Detection

```javascript
// Check if player can start climbing at current position
function canStartClimbing(player) {
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    
    return isClimbable(centerX, centerY);
}

// Check if player can climb upward
function canClimbUp(player) {
    const centerX = player.x + player.width / 2;
    
    // Check current position and above
    const currentClimbable = isClimbable(centerX, player.y + player.height/2);
    const aboveClimbable = isClimbable(centerX, player.y - player.climbSpeed);
    
    return currentClimbable && (aboveClimbable || isClimbable(centerX, player.y));
}

// Check if player can climb downward  
function canClimbDown(player) {
    const centerX = player.x + player.width / 2;
    const futureY = player.y + player.height + player.climbSpeed;
    
    // Must have ladder where we're going
    return isClimbable(centerX, futureY);
}

// Main climbing physics update
function updateClimbing(player) {
    if (player.isClimbing) {
        // Disable gravity while climbing
        player.velocityY = 0;
        player.velocityX = 0;
        
        // Check if still on a ladder
        if (!canStartClimbing(player)) {
            player.isClimbing = false;
            // Resume normal physics
        }
    }
}
```

### Visual Feedback

```javascript
function updatePlayerVisuals(player) {
    // Change appearance based on state
    if (player.isClimbing) {
        player.sprite.tint = 0xFFFF99;  // Slight yellow tint
        // Could add climbing animation here
    } else {
        player.sprite.tint = 0xFFFFFF;  // Normal color
    }
    
    // Update sprite position
    player.sprite.x = player.x;
    player.sprite.y = player.y;
}
```

The sequence when the player enters a ladder: `canStartClimbing()` detects the ladder tile at the player's centre, up/down input sets `isClimbing = true`, `velocityY` is zeroed (disabling gravity), and `centerPlayerOnLadder` aligns the player to the column. On exit, a left/right key with no wall collision sets `isClimbing = false` and normal physics resume.

Next: [Moving Tiles](/tutorial/a-side-scrolling-world/moving-tiles/)