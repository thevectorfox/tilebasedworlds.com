+++
title = "The Hero"
date = 2026-03-09T01:00:00+11:00
weight = 5
draft = false
slug = "the-hero"
tags = ["beginner", "tiles", "tutorial"]
next = "/tutorial/world-one/keys-to-move/"
prev = "/tutorial/world-one/rendering-a-map/"
+++

The hero is a data object that stores position, size, and a reference to its sprite. Separating data from visuals keeps the game logic independent of how things are drawn.

{{< pixidemo title="The Hero" >}}

    // Create PixiJS application for hero demo
    const app = new PIXI.Application();
    await app.init({
        width: 240,
        height: 180,
        backgroundColor: 0x2c3e50,
        antialias: true
    });

    document.body.appendChild(app.canvas);
    
    // Our trusty map
    const myMap = [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]
    ];
    
    const TILE_SIZE = 30;
    
    // First, render our map tiles
    function createTileGraphics(tileType) {
        const graphics = new PIXI.Graphics();
        if (tileType === 1) {
            graphics.beginFill(0x00ff41);
        } else {
            graphics.beginFill(0x003311);
        }
        graphics.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        graphics.lineStyle(1, 0x00ff41, 0.5);
        graphics.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        graphics.endFill();
        return graphics;
    }
    
    // Render the map
    for (let row = 0; row < myMap.length; row++) {
        for (let col = 0; col < myMap[row].length; col++) {
            const tile = createTileGraphics(myMap[row][col]);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            app.stage.addChild(tile);
        }
    }
    
    // Hero sprite
    const hero = new PIXI.Graphics();
    hero.beginFill(0xff4444);
    hero.drawRect(-10, -10, 20, 20);
    hero.endFill();
    
    // Position hero at tile (2, 1) — column 2, row 1
    const heroTileX = 2;
    const heroTileY = 1;
    
    // Convert tile position to pixel position (center of tile)
    hero.x = (heroTileX * TILE_SIZE) + (TILE_SIZE / 2);
    hero.y = (heroTileY * TILE_SIZE) + (TILE_SIZE / 2);
    
    app.stage.addChild(hero);
{{< /pixidemo >}}

## The hero object

The hero stores two coordinate systems alongside its sprite reference:

```js
const hero = {
    // Which tile the hero occupies
    tileX: 2,
    tileY: 1,

    // Exact pixel coordinates (calculated from tile position)
    x: 0,
    y: 0,

    // Collision box size in pixels
    width: 20,
    height: 20,

    // PixiJS sprite (assigned when created)
    sprite: null,

    speed: 2
};
```

`tileX`/`tileY` are used for collision checks — "is the tile at (3, 2) a wall?" — because that requires an array index, not a pixel value. `x`/`y` are used for rendering, because PixiJS works in pixels. Both are needed; they serve different parts of the system.

## Placing the hero on screen

The sprite is a separate object from the data. Create it, attach it to the hero, then position it:

```js
function createHero(heroData, tileSize) {
    const heroSprite = new PIXI.Graphics()
        .rect(-heroData.width / 2, -heroData.height / 2, heroData.width, heroData.height)
        .fill(0xff4444);

    heroData.sprite = heroSprite;

    // Calculate pixel position from tile position
    updateHeroPosition(heroData, tileSize);

    return heroSprite;
}

function updateHeroPosition(heroData, tileSize) {
    heroData.x = (heroData.tileX * tileSize) + (tileSize / 2);
    heroData.y = (heroData.tileY * tileSize) + (tileSize / 2);

    if (heroData.sprite) {
        heroData.sprite.x = heroData.x;
        heroData.sprite.y = heroData.y;
    }
}
```

The pixel calculation: `tileX * tileSize` reaches the left edge of the tile, `+ tileSize / 2` centres it. A hero at tile (2, 1) with 30px tiles appears at pixel (75, 45).

After rendering the map, add the hero sprite to the stage:

```js
const heroSprite = createHero(hero, game.tileW);
app.stage.addChild(heroSprite);
```

## Customising the sprite

The sprite can be any shape. Change the `.fill()` colour, use `.circle()` for a round hero, or load a texture:

```js
// Circle
new PIXI.Graphics().circle(0, 0, 10).fill(0xff4444);

// Loaded sprite
const heroTexture = await PIXI.Assets.load('hero.png');
const heroSprite = new PIXI.Sprite(heroTexture);
heroSprite.anchor.set(0.5);  // Centre the sprite on its position
```

The rest of the hero system — movement, collision, state — doesn't care which approach you use.

**What you built:**

- A hero data object with both tile and pixel coordinates
- A `createHero` function that builds the sprite and positions it
- A `updateHeroPosition` function that converts tile coordinates to pixels for rendering

[Next: Keys to Move](/tutorial/world-one/keys-to-move/)
