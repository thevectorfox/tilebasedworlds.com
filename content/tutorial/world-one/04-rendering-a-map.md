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

Time to witness some MAGIC! {{< icon name="game-controller" >}} You're about to transform those boring arrays of numbers into a living, breathing game world. By the end of this chapter, you'll watch your map data come alive on screen - just like the pros do it! This is the moment where your game starts feeling real.

Look at our map array again, but this time imagine it as your game world:

```
Array:           Visual Result:
[1, 1, 1, 1] →  🧱🧱🧱🧱
[1, 0, 0, 1] →  🧱🌟🌟🧱  
[1, 1, 1, 1] →  🧱🧱🧱🧱

Each 1 becomes a solid wall, each 0 becomes walkable space!
```

The result should look like this:

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

Boom! Look what we've built - a complete tile system! {{< icon name="fire" >}} The `game` object holds all our configuration - keeping everything organized in one place makes our code much cleaner and easier to manage. You're already thinking like a game developer!

Notice how we set `tileW: 30` and `tileH: 30` in our game object. This defines how big each tile will be in pixels. Here's something cool - tiles don't have to be squares! Want massive 64x64 tiles for that chunky retro feel? Thin 32x8 platform strips for precise platforming? Just change these numbers and watch the magic happen!

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


## Let's' Render Our Map!

Time to make those tiles appear on screen! This is where the real magic happens. We'll create a `buildMap` function that transforms your data into a playable world. You can use this same function to build different levels by passing in different map arrays. 

**Our rendering strategy:**
- **Step 1**: Create a PixiJS canvas (your game's window to the world)
- **Step 2**: Loop through every tile position (we're building this systematically!)
- **Step 3**: Create graphics for each tile (watch the magic happen!)
- **Step 4**: Position everything perfectly
- **Step 5**: Add it all to the stage (and celebrate! {{< icon name="confetti" >}})

Here's our modern PixiJS powerhouse:

```js
async function buildMap(map, containerId) {
    // Step 1: Create your canvas (your game's window to the world)
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
    
    // Step 2 & 3: Loop through every position and create tiles
    for (let row = 0; row < mapHeight; row++) {
        for (let col = 0; col < mapWidth; col++) {
            const tileId = map[row][col];
            const tileType = Object.values(TileTypes).find(type => type.id === tileId);
            
            // Create tile graphics (the magic happens here!)
            const tileGraphics = new PIXI.Graphics();
            tileGraphics.beginFill(tileType.color);
            tileGraphics.drawRect(0, 0, game.tileW, game.tileH);
            tileGraphics.lineStyle(1, 0x00ff41, 0.3);
            tileGraphics.drawRect(0, 0, game.tileW, game.tileH);
            tileGraphics.endFill();
            
            // Step 4: Position the tile perfectly
            tileGraphics.x = col * game.tileW;
            tileGraphics.y = row * game.tileH;
            
            // Add to container
            tileContainer.addChild(tileGraphics);
        }
    }
    
    return app; // Return the app so we can control it later
}
```

### Try This Right Now! {{< icon name="fire" >}}
Want to see some instant magic? Try changing the colors in `TileTypes` and refresh the page:
- Want red walls? Change `0x00ff41` to `0xff0000`
- Want blue floors? Change `0x003311` to `0x0066cc`
- Want purple walls? Try `0x9932cc`

Go ahead, experiment! This is how you learn to make games that are uniquely yours.

Let's break down what's happening in our modern PixiJS powerhouse:

**Setting up the stage:** Instead of Flash's old attachMovie system, we create a PIXI.Application which gives us a canvas and handles all the rendering magic for us. No more worrying about movie clips in the library - this is the modern way!

**Container system:** We create a `PIXI.Container` called `tileContainer` to hold all our tiles. This is like a magic folder that organizes everything. When you want to remove all tiles (like when transitioning to a new level), just remove the container and *POOF* - all tiles disappear instantly!

**Map dimensions:** We calculate `mapWidth` and `mapHeight` the same way. `map[0].length` gives us the number of columns (how many tiles across), and `map.length` gives us the number of rows (how many tiles down). Simple but powerful!

**The nested loops:** This is the heart of tile rendering! We're using the classic double-loop pattern that powers countless games:

```js
for (let row = 0; row < mapHeight; row++) {      // Loop through rows (top to bottom)
    for (let col = 0; col < mapWidth; col++) {   // Loop through columns (left to right)
        // Create tile at position [row][col] - building your world piece by piece!
    }
}
```

**Creating tiles:** Instead of attaching movie clips, we use `PIXI.Graphics` to draw colored rectangles. We look up the tile type from our `TileTypes` object and use its color. Each tile gets its own unique graphics object!

**Positioning magic:** Same math as the pros use! `col * game.tileW` for x position, `row * game.tileH` for y position. This creates a perfect grid where every tile knows exactly where it belongs.

**Using it:** Call the function like this:

```js
const mapApp = await buildMap(myMap, 'my-canvas-container');
```

{{< icon name="trophy" >}} **VICTORY!** You just built a complete tile rendering system that would make professional game developers proud! This is the same technique used in countless indie hits and AAA games. Your arrays of numbers have transformed into a visual game world!

**What you've accomplished:**
- ✅ Mastered the fundamentals of game rendering
- ✅ Built a reusable map system
- ✅ Created your first interactive game world
- ✅ Learned the same techniques used by the pros

Ready to add some life to this world? Next up: creating a hero character who can explore your newly created level! Time to make your world truly interactive! {{< icon name="rocket-launch" >}}

[Next: The Hero](/tutorial/world-one/05-the-hero/)