+++
title = "Keys to Move"
date = 2026-03-09T02:00:00+11:00
weight = 6
draft = false
slug = "keys-to-move"
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/world-one/hit-the-wall/"
prev = "/tutorial/world-one/the-hero/"
+++

Keyboard input in the browser works via two events: `keydown` fires when a key is pressed, `keyup` fires when it's released. Store the current state of each key in an object, then read that state each frame in the game loop.

{{< pixidemo title="Keys to Move" >}}
    // Create PixiJS application for movement demo
    const app = new PIXI.Application();
    await app.init({
        width: 240,
        height: 180,
        backgroundColor: 0x2c3e50,
        antialias: true
    });
    
    document.body.appendChild(app.canvas);
    
    const gameMap = [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]
    ];
    
    const TILE_SIZE = 30;
    
    function createTileGraphics(tileType) {
        const graphics = new PIXI.Graphics();
        graphics.beginFill(tileType === 1 ? 0x00ff41 : 0x003311);
        graphics.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        graphics.lineStyle(1, 0x00ff41, 0.5);
        graphics.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        graphics.endFill();
        return graphics;
    }
    
    for (let row = 0; row < gameMap.length; row++) {
        for (let col = 0; col < gameMap[row].length; col++) {
            const tile = createTileGraphics(gameMap[row][col]);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            app.stage.addChild(tile);
        }
    }
    
    const hero = {
        tileX: 3,
        tileY: 2,
        x: 0,
        y: 0,
        speed: 2,
        sprite: null,
        isMoving: false,
        direction: 'down'
    };
    
    const heroSprite = new PIXI.Graphics();
    heroSprite.beginFill(0xff4444);
    heroSprite.drawRect(-8, -8, 16, 16);
    heroSprite.endFill();
    heroSprite.lineStyle(2, 0xffffff);
    heroSprite.drawRect(-8, -8, 16, 16);
    
    hero.sprite = heroSprite;
    app.stage.addChild(heroSprite);
    
    function updateHeroPosition() {
        hero.x = (hero.tileX * TILE_SIZE) + (TILE_SIZE / 2);
        hero.y = (hero.tileY * TILE_SIZE) + (TILE_SIZE / 2);
        hero.sprite.x = hero.x;
        hero.sprite.y = hero.y;
    }
    updateHeroPosition();
    
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
        let moved = false;
        
        if (keys.ArrowUp && hero.tileY > 1) {
            hero.tileY--;
            hero.direction = 'up';
            moved = true;
        } else if (keys.ArrowDown && hero.tileY < gameMap.length - 2) {
            hero.tileY++;
            hero.direction = 'down';
            moved = true;
        } else if (keys.ArrowLeft && hero.tileX > 1) {
            hero.tileX--;
            hero.direction = 'left';
            moved = true;
        } else if (keys.ArrowRight && hero.tileX < gameMap[0].length - 2) {
            hero.tileX++;
            hero.direction = 'right';
            moved = true;
        }
        
        if (moved) {
            updateHeroPosition();
            hero.isMoving = true;
        } else {
            hero.isMoving = false;
        }
        
        hero.sprite.tint = hero.isMoving ? 0xffff00 : 0xffffff;
    }
    
    app.ticker.add(updateMovement);
{{< /pixidemo >}}

## Character setup

The hero object from the previous tutorial, with direction and movement state added:

```js
const hero = {
    tileX: 3,
    tileY: 2,
    x: 0,
    y: 0,
    speed: 2,
    direction: 'down',
    isMoving: false,
    sprite: null
};
```

`direction` and `isMoving` aren't used by the movement logic itself — they exist so that animation code (which runs separately) can read the hero's state without needing to know how movement works.

## Keyboard input

Track which keys are currently held with an event listener pair:

```js
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false   // add any keys you need
};

window.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.code)) {
        keys[event.code] = true;
        event.preventDefault();  // Prevent browser scroll on arrow keys
    }
});

window.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.code)) {
        keys[event.code] = false;
        event.preventDefault();
    }
});
```

`hasOwnProperty` means the handler only processes keys that are explicitly listed — any unrelated key press is ignored. `event.preventDefault()` stops the browser from scrolling the page when arrow keys are pressed.

## Movement logic

Read the key state once per frame and update tile position accordingly:

```js
function updateMovement() {
    let moved = false;
    let newDirection = hero.direction;

    if (keys.ArrowUp)    { hero.tileY--; newDirection = 'up';    moved = true; }
    else if (keys.ArrowDown)  { hero.tileY++; newDirection = 'down';  moved = true; }
    else if (keys.ArrowLeft)  { hero.tileX--; newDirection = 'left';  moved = true; }
    else if (keys.ArrowRight) { hero.tileX++; newDirection = 'right'; moved = true; }

    if (moved) {
        hero.direction = newDirection;
        hero.isMoving = true;
        updateHeroPosition();
    } else {
        hero.isMoving = false;
    }
}

function updateHeroPosition() {
    hero.x = (hero.tileX * TILE_SIZE) + (TILE_SIZE / 2);
    hero.y = (hero.tileY * TILE_SIZE) + (TILE_SIZE / 2);
    hero.sprite.x = hero.x;
    hero.sprite.y = hero.y;
}

app.ticker.add(updateMovement);
```

This version has no boundary or collision checks — the hero can walk off the edge of the map. The next tutorial adds collision detection to fix that.

## Visual direction

For a simple directional indicator, flip or rotate the sprite based on `hero.direction`:

```js
function updateHeroAppearance() {
    const sprite = hero.sprite;

    sprite.scale.x = 1;
    sprite.rotation = 0;

    switch (hero.direction) {
        case 'left':  sprite.scale.x = -1;             break;
        case 'up':    sprite.rotation = -Math.PI / 2;  break;
        case 'down':  sprite.rotation =  Math.PI / 2;  break;
    }
}
```

## Smooth movement

Tile-by-tile movement jumps instantly from one grid position to the next. For smooth sliding, interpolate toward the target pixel position each frame instead:

```js
function updateSmoothMovement() {
    const targetX = (hero.tileX * TILE_SIZE) + (TILE_SIZE / 2);
    const targetY = (hero.tileY * TILE_SIZE) + (TILE_SIZE / 2);

    const lerpSpeed = 0.2;
    hero.x += (targetX - hero.x) * lerpSpeed;
    hero.y += (targetY - hero.y) * lerpSpeed;

    hero.sprite.x = hero.x;
    hero.sprite.y = hero.y;
}
```

The tile coordinates are still updated immediately on keypress — the smooth movement is only visual. Collision checks still run against `tileX`/`tileY`.

**What you built:**

- A key-state object updated by `keydown`/`keyup` event listeners
- A movement function that reads that state each frame and updates tile coordinates
- A `updateHeroPosition` function that translates tile coordinates to pixel position

[Next: Hit the Wall](/tutorial/world-one/hit-the-wall/)
