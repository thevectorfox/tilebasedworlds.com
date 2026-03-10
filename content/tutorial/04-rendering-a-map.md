+++
title = "Rendering a Map"
date = 2026-03-09T00:00:00+11:00
weight = 4
draft = false
tags = ["beginner", "tiles", "tutorial"]
next = "/tutorial/05-the-hero/"
prev = "/tutorial/03-more-maps/"
+++

As you saw in the chapter "Map format", we will have our map in a two-dimensional array. Now we will make the tiles appear on the screen by rendering the structure to view using PixiJS!

The result should look like this:

<div id="map-demo" style="border: 2px solid #00ff41; border-radius: 8px; margin: 20px 0; background: #000;"></div>

<script>
// Wait for page to load
window.addEventListener('load', async function() {
    // Create PixiJS application (v8 requires async initialization)
    const app = new PIXI.Application();
    await app.init({
        width: 240,
        height: 180,
        backgroundColor: 0x2c3e50,
        antialias: true
    });
    
    // Add the canvas to our demo div
    document.getElementById('map-demo').appendChild(app.canvas);
    
    // Our map data
    const myMap = [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]
    ];
    
    const TILE_SIZE = 30;
    
    // Create simple colored rectangles for tiles
    function createTileGraphics(tileType) {
        const graphics = new PIXI.Graphics();
        if (tileType === 1) {
            // Wall tile - green
            graphics.beginFill(0x00ff41);
        } else {
            // Floor tile - dark green
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
});
</script>

First, let's set up our map data and tile definitions using modern JavaScript:

```js
// Our map as a 2D array - same concept, cleaner syntax!
const myMap = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
];

// Game configuration object
const game = {
    tileW: 30,
    tileH: 30
};

// Tile type definitions - modern approach
const TileTypes = {
    FLOOR: {
        id: 0,
        walkable: true,
        color: 0x003311,  // Dark green for floors
        name: 'floor'
    },
    WALL: {
        id: 1, 
        walkable: false,
        color: 0x00ff41,  // Bright green for walls
        name: 'wall'
    }
};
```

Perfect! So we have our map stored in `myMap`. The `game` object holds all our configuration - keeping everything organized in one place makes our code much cleaner and easier to manage.

Notice how we set `tileW: 30` and `tileH: 30` in our game object. This defines how big each tile will be in pixels. You can make tiles any size you want - they don't have to be squares! Want massive 64x64 tiles or thin 32x8 platform strips? Just change these numbers.

Whenever you need to know a tile's size:

```js
game.tileW;  // Gets tile width
game.tileH;  // Gets tile height
```

In modern JavaScript, we use objects to define our tile types instead of prototypes. Our `TileTypes` object contains all the information about each tile:

- **id**: The number we use in our map array (0 for floor, 1 for wall)
- **walkable**: Can the player move through this tile?
- **color**: What color should this tile be in PixiJS?
- **name**: A readable name for debugging

This approach is much cleaner than the old Flash prototype system and makes it easy to add new tile types later!


## LET'S RENDER OUR MAP!

Time to make those tiles appear on screen! We'll create a `buildMap` function that handles all the tile rendering. You can use this same function to build different levels by passing in different map arrays. Our buildMap function will:

- Create a PixiJS application and canvas
- Loop through our map array
- Create visual graphics for each tile
- Position tiles in the correct spots
- Add everything to the stage

Here's the modern PixiJS version:

```js
async function buildMap(map, containerId) {
    // Create PixiJS application (v8 requires async initialization)
    const app = new PIXI.Application();
    await app.init({
        width: map[0].length * game.tileW,
        height: map.length * game.tileH,
        backgroundColor: 0x2c3e50,
        antialias: true
    });
    
    // Add canvas to our HTML container
    document.getElementById(containerId).appendChild(app.canvas);
    
    // Get map dimensions
    const mapWidth = map[0].length;
    const mapHeight = map.length;
    
    // Create a container for all tiles
    const tileContainer = new PIXI.Container();
    app.stage.addChild(tileContainer);
    
    // Loop through each position in the map
    for (let row = 0; row < mapHeight; row++) {
        for (let col = 0; col < mapWidth; col++) {
            const tileId = map[row][col];
            const tileType = Object.values(TileTypes).find(type => type.id === tileId);
            
            // Create tile graphics
            const tileGraphics = new PIXI.Graphics();
            tileGraphics.beginFill(tileType.color);
            tileGraphics.drawRect(0, 0, game.tileW, game.tileH);
            tileGraphics.lineStyle(1, 0x00ff41, 0.3);
            tileGraphics.drawRect(0, 0, game.tileW, game.tileH);
            tileGraphics.endFill();
            
            // Position the tile
            tileGraphics.x = col * game.tileW;
            tileGraphics.y = row * game.tileH;
            
            // Add to container
            tileContainer.addChild(tileGraphics);
        }
    }
    
    return app; // Return the app so we can control it later
}
```

Let's break down what's happening in our modern PixiJS version:

**Setting up the stage:** Instead of Flash's attachMovie, we create a PIXI.Application which gives us a canvas and manages the rendering for us. No more worrying about movie clips in the library!

**Container system:** We create a `PIXI.Container` called `tileContainer` to hold all our tiles. This works just like Flash's container movie clips - when you want to remove all tiles (like when the level ends), just remove the container and *poof* - all tiles disappear!

**Map dimensions:** We calculate `mapWidth` and `mapHeight` the same way. `map[0].length` gives us the number of columns (how many tiles across), and `map.length` gives us the number of rows (how many tiles down).

**The nested loops:** Still using the same double-loop pattern!

```js
for (let row = 0; row < mapHeight; row++) {      // Loop through rows
    for (let col = 0; col < mapWidth; col++) {   // Loop through columns
        // Create tile at position [row][col]
    }
}
```

**Creating tiles:** Instead of attaching movie clips, we use `PIXI.Graphics` to draw colored rectangles. We look up the tile type from our `TileTypes` object and use its color.

**Positioning:** Same math as before! `col * game.tileW` for x position, `row * game.tileH` for y position.

**Using it:** Call the function like this:

```js
const mapApp = buildMap(myMap, 'my-canvas-container');
```

Much cleaner than the Flash version, and it runs in any modern browser! 🎮