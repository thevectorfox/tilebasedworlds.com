+++
title = "Hit the Wall"
date = 2026-03-09T03:00:00+11:00
weight = 7
draft = false
slug = "hit-the-wall"
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/world-one/open-the-door/"
prev = "/tutorial/world-one/keys-to-move/"
+++

Collision detection prevents the hero from entering solid tiles. Before applying a movement, check whether the destination tile is walkable — if it isn't, cancel the move.

{{< pixidemo title="Hit the Wall" >}}
    // Create PixiJS application for collision demo
    const app = new PIXI.Application();
    await app.init({
        width: 300,
        height: 240,
        backgroundColor: 0x2c3e50,
        antialias: true
    });
    
    document.body.appendChild(app.canvas);
    
    const gameMap = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 1, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];
    
    const TILE_SIZE = 30;
    
    for (let row = 0; row < gameMap.length; row++) {
        for (let col = 0; col < gameMap[row].length; col++) {
            const tile = new PIXI.Graphics();
            tile.beginFill(gameMap[row][col] === 1 ? 0x00ff41 : 0x003311);
            tile.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
            tile.lineStyle(1, 0x00ff41, 0.3);
            tile.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
            tile.endFill();
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            app.stage.addChild(tile);
        }
    }
    
    const hero = {
        tileX: 2,
        tileY: 2,
        x: 0,
        y: 0,
        width: 12,
        height: 12,
        speed: 2,
        sprite: null
    };
    
    const heroSprite = new PIXI.Graphics();
    heroSprite.beginFill(0xff4444);
    heroSprite.drawRect(-6, -6, 12, 12);
    heroSprite.endFill();
    heroSprite.lineStyle(2, 0xffffff);
    heroSprite.drawRect(-6, -6, 12, 12);
    hero.sprite = heroSprite;
    app.stage.addChild(heroSprite);
    
    function updateHeroPosition() {
        hero.x = (hero.tileX * TILE_SIZE) + (TILE_SIZE / 2);
        hero.y = (hero.tileY * TILE_SIZE) + (TILE_SIZE / 2);
        hero.sprite.x = hero.x;
        hero.sprite.y = hero.y;
    }
    updateHeroPosition();
    
    function canMoveTo(tileX, tileY) {
        if (tileX < 0 || tileX >= gameMap[0].length || 
            tileY < 0 || tileY >= gameMap.length) {
            return false;
        }
        return gameMap[tileY][tileX] === 0;
    }
    
    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false
    };
    
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
    
    function updateMovement() {
        let newTileX = hero.tileX;
        let newTileY = hero.tileY;
        
        if (keys.ArrowUp)    newTileY = hero.tileY - 1;
        else if (keys.ArrowDown)  newTileY = hero.tileY + 1;
        else if (keys.ArrowLeft)  newTileX = hero.tileX - 1;
        else if (keys.ArrowRight) newTileX = hero.tileX + 1;
        
        if (canMoveTo(newTileX, newTileY)) {
            hero.tileX = newTileX;
            hero.tileY = newTileY;
            updateHeroPosition();
            hero.sprite.tint = 0xffffff;
        } else if (newTileX !== hero.tileX || newTileY !== hero.tileY) {
            hero.sprite.tint = 0xff8888;
        }
    }
    
    app.ticker.add(updateMovement);
{{< /pixidemo >}}

The hero turns light red when a move is blocked and white when it moves freely.

## Tile-based collision

The `canMoveTo` function checks whether a tile coordinate is both within bounds and walkable:

```js
function canMoveTo(tileX, tileY, gameMap) {
    // Out of bounds — treat as solid
    if (tileX < 0 || tileX >= gameMap[0].length ||
        tileY < 0 || tileY >= gameMap.length) {
        return false;
    }

    // 0 = floor (walkable), 1 = wall (solid)
    return gameMap[tileY][tileX] === 0;
}
```

The movement function calls this before applying any change to `tileX`/`tileY`:

```js
function tryMoveTo(hero, newTileX, newTileY, gameMap) {
    if (canMoveTo(newTileX, newTileY, gameMap)) {
        hero.tileX = newTileX;
        hero.tileY = newTileY;
        updateHeroPosition(hero);
        return true;
    }
    return false;  // Blocked — position unchanged
}
```

One array lookup per attempted move. For tile-based movement this is all the collision detection you need.

## Bounding box collision

For pixel-based movement — where the hero moves a few pixels per frame rather than one tile at a time — tile-based collision needs to account for the hero's size. A 12px hero can partially overlap a tile before its centre crosses the boundary.

Check all four corners of the hero's bounding box:

```js
function checkBoundingBoxCollision(x, y, width, height, gameMap, tileSize) {
    const leftTile   = Math.floor(x / tileSize);
    const rightTile  = Math.floor((x + width - 1) / tileSize);
    const topTile    = Math.floor(y / tileSize);
    const bottomTile = Math.floor((y + height - 1) / tileSize);

    for (let tileY = topTile; tileY <= bottomTile; tileY++) {
        for (let tileX = leftTile; tileX <= rightTile; tileX++) {
            if (tileX < 0 || tileX >= gameMap[0].length ||
                tileY < 0 || tileY >= gameMap.length) {
                return true;  // Map boundary
            }
            if (gameMap[tileY][tileX] === 1) return true;
        }
    }

    return false;
}
```

Apply X and Y movement separately so the hero can slide along walls when moving diagonally:

```js
function updateSmoothMovement(hero, keys, gameMap, tileSize) {
    let newX = hero.x;
    let newY = hero.y;

    if (keys.ArrowLeft)  newX -= hero.speed;
    if (keys.ArrowRight) newX += hero.speed;
    if (keys.ArrowUp)    newY -= hero.speed;
    if (keys.ArrowDown)  newY += hero.speed;

    // Check X and Y independently — allows wall sliding
    if (!checkBoundingBoxCollision(newX, hero.y, hero.width, hero.height, gameMap, tileSize)) {
        hero.x = newX;
    }
    if (!checkBoundingBoxCollision(hero.x, newY, hero.width, hero.height, gameMap, tileSize)) {
        hero.y = newY;
    }

    hero.sprite.x = hero.x;
    hero.sprite.y = hero.y;
}
```

Checking X and Y separately means a diagonal collision into a corner doesn't stop both axes — the hero slides along the wall face it's parallel to.

## Enhancements

**Different tile behaviours:**

```js
const TileTypes = {
    FLOOR:  0,
    WALL:   1,
    WATER:  2,  // Slows movement
    SPIKES: 3,  // Damages player
    ICE:    4   // Slippery movement
};

function getTileEffect(tileType) {
    switch (tileType) {
        case TileTypes.WATER:  return { walkable: true, speedMultiplier: 0.5 };
        case TileTypes.SPIKES: return { walkable: true, damage: 10 };
        case TileTypes.ICE:    return { walkable: true, friction: 0.1 };
        default:               return { walkable: tileType === TileTypes.FLOOR };
    }
}
```

**Wall-hit feedback:**

```js
function updateCollisionFeedback(hero, hitWall) {
    hero.sprite.tint = hitWall ? 0xff8888 : 0xffffff;
}
```

**What you built:**

- A `canMoveTo` function that checks bounds and tile walkability
- Separate X and Y collision checks for smooth wall-sliding movement
- The pattern for per-tile effects (damage, friction, speed change)

[Next: Open the Door](/tutorial/world-one/open-the-door/)
