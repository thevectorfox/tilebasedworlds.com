+++
title = "Clouds"
date = 2026-03-09T06:00:00+11:00
weight = 2
draft = true
slug = "clouds"
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/the-keep/ladders/"
prev = "/tutorial/the-keep/jumping/"
+++

Time to add one of the most satisfying platform mechanics in gaming - **cloud platforms**! These one-way surfaces let you jump up through them and move through them from the sides, but when you're falling down, you land on top. Think Mario's cloud platforms or Mega Man's jump-through floors - they make platforming feel incredibly smooth and natural!

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
                .fill(0x87CEEB)
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
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
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

## Understanding Cloud Platforms: The Magic of One-Way Surfaces

See the difference? Let's break down what makes cloud platforms so special:

**🧱 Solid walls** = Completely impassable from ALL directions
- Hero bounces off from left, right, above, below
- Perfect for boundaries and obstacles
- Creates hard stops in movement

**☁️ Cloud platforms** = Selectively solid based on direction
- ✅ Jump UP through them (from below)
- ✅ Walk THROUGH them (from left/right)  
- ❌ Fall DOWN through them (land on top!)
- Creates smooth, flowing platformer movement

**Why cloud platforms rock:**
- Players can access platforms from below without complex level design
- Creates natural "layers" in your level
- Feels incredibly satisfying when movement flows smoothly
- Used in classics like Super Mario World, Sonic, Mega Man

![Normal solid wall blocks hero from all directions](/p11_2.gif)

**VS.**

![Cloud platform allows entry from sides/below, stops from above](/p11_3.gif)

## Setting Up Cloud Tiles: Modern Tile Types

Let's create our cloud platform tile type using modern JavaScript patterns:

```javascript
// Define tile types as constants
const TILE_TYPES = {
    EMPTY: 0,
    SOLID: 1, 
    CLOUD: 2
};

// Tile properties - much cleaner than ActionScript prototypes!
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

**Why this approach rocks:**
- **Clear constants** instead of magic numbers
- **Property objects** instead of confusing prototypes
- **Helper functions** make collision code super readable
- **Easy to extend** - just add new tile types!

## Cloud Platform Collision Logic: The Smart Part!

Here's where the magic happens - making platforms solid only when falling onto them from above:

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

**The key insight**: Cloud platforms are only "solid" when:
1. Player is moving **downward** (`velocityY > 0`)
2. Player's feet are **touching** the platform
3. Player is **above** the platform (not inside it)

**Why check both feet?** This handles edge cases where your hero is partially over the platform. Much more reliable than single-point collision!

### Integrating Cloud Collision

Now we modify our main collision system:

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
    
    // Ceiling collision (clouds don't block upward movement!)
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

**Critical detail**: When checking if we're still on a platform (for edge detection), we check **both** solid tiles AND cloud platforms. This prevents the hero from floating in mid-air after walking off any platform type.

**The flow works like this:**
1. Player walks left/right → `checkStillOnGround()` sees they're over empty space
2. `player.onGround = false` → gravity starts pulling them down
3. While falling → cloud platforms are checked for landing
4. When landing on cloud → `player.onGround = true` → can jump again!

**{{< icon name="confetti" >}} Congratulations!** You now have silky-smooth cloud platforms just like the pros use! Players can flow through your levels naturally, jumping up through platforms and landing on them from above.

**Try different feels**: Experiment with the `+5` inset values for feet detection, or add different cloud types with different behaviors. The foundation you've built makes these variations super easy to implement!

**Next up**: Ladders that let players climb up and down at will - another classic platformer mechanic that combines perfectly with your jumping and cloud platform systems!