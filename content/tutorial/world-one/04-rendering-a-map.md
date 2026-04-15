+++
title = "Rendering a Map"
date = 2026-03-09T00:00:00+11:00
weight = 4
draft = false
slug = "rendering-a-map"
tags = ["beginner", "tiles", "tutorial"]
next = "/tutorial/world-one/the-hero/"
prev = "/tutorial/world-one/more-maps/"
+++

Rendering converts a 2D array into a visual grid. For each value in the map, draw a coloured rectangle at the corresponding pixel position.

```
Array:           Visual result:
[1, 1, 1, 1] →  🧱🧱🧱🧱
[1, 0, 0, 1] →  🧱  🌟🌟🧱  
[1, 1, 1, 1] →  🧱🧱🧱🧱

Each 1 becomes a solid wall, each 0 becomes walkable space.
```

{{< pixidemo title="Rendering a Map" >}}
    const app = new PIXI.Application();
    await app.init({
        width: 240,
        height: 180,
        backgroundColor: 0x2c3e50,
        antialias: true
    });

    document.body.appendChild(app.canvas);

    const myMap = [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]
    ];

    const TILE_SIZE = 30;

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

    for (let row = 0; row < myMap.length; row++) {
        for (let col = 0; col < myMap[row].length; col++) {
            const tile = createTileGraphics(myMap[row][col]);
            tile.x = col * TILE_SIZE;
            tile.y = row * TILE_SIZE;
            app.stage.addChild(tile);
        }
    }
{{< /pixidemo >}}

## Map data and tile definitions

The map and tile type definitions from the previous tutorial, ready to use:

```js
const myMap = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
];

const game = {
    tileW: 30,
    tileH: 30
};

const TileTypes = {
    FLOOR: { id: 0, walkable: true,  color: 0x003311, name: 'floor' },
    WALL:  { id: 1, walkable: false, color: 0x00ff41, name: 'wall'  }
};
```

`game.tileW` and `game.tileH` define the pixel size of each tile. Tiles don't have to be square — a 64×64 tile gives a chunky retro look, a 32×8 strip works for precision platforming. Changing these numbers changes the scale of the entire world.

## Rendering the map

The `buildMap` function loops over every position in the array, creates a graphic for the tile type at that position, and places it at the correct pixel coordinates:

```js
async function buildMap(map, containerId) {
    const app = new PIXI.Application();
    await app.init({
        width: map[0].length * game.tileW,
        height: map.length * game.tileH,
        backgroundColor: 0x2c3e50,
        antialias: true
    });

    document.getElementById(containerId).appendChild(app.canvas);

    const tileContainer = new PIXI.Container();
    app.stage.addChild(tileContainer);

    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            const tileId = map[row][col];
            const tileType = TileTypes[tileId === 0 ? 'FLOOR' : 'WALL'];

            const tileGraphics = new PIXI.Graphics()
                .rect(0, 0, game.tileW, game.tileH)
                .fill(tileType.color)
                .rect(0, 0, game.tileW, game.tileH)
                .stroke({ width: 1, color: 0x00ff41, alpha: 0.3 });

            tileGraphics.x = col * game.tileW;
            tileGraphics.y = row * game.tileH;

            tileContainer.addChild(tileGraphics);
        }
    }

    return app;
}
```

The position formula is `col * tileW` for x and `row * tileH` for y. Tile at column 3, row 2 appears at pixel 90, 60 (with 30px tiles). Every tile in the grid knows exactly where it belongs.

The `PIXI.Container` for tiles isn't strictly necessary at this scale, but grouping all tile graphics into one container makes it easy to clear or move the entire tile layer later — useful when implementing room transitions.

Call it like this:

```js
const mapApp = await buildMap(myMap, 'my-canvas-container');
```

**What you built:**

- A `buildMap` function that translates a 2D array into a PixiJS canvas
- Tile type definitions that map array values to colours and properties
- The nested-loop pattern that powers tile rendering in any tile-based game

[Next: The Hero](/tutorial/world-one/the-hero/)
