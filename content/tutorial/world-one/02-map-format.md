+++
title = "Map Format"
date = 2026-03-08T22:00:00+11:00
weight = 2
draft = false
slug = "map-format"
tags = ["beginner", "tiles", "tutorial"]
next = "/tutorial/world-one/more-maps/"
prev = "/tutorial/world-one/why-tiles/"
+++

Let's build our first game world! Maps in tile-based games are stored as **2D arrays** - think of them as blueprints that tell your game exactly where to place walls, floors, enemies, and treasure. You're about to learn how to store entire game levels in just a few lines of code!

## TWO DIMENSIONAL ARRAYS: YOUR GAME WORLD IN CODE

Don't worry - 2D arrays aren't from another dimension! They're just arrays containing other arrays. Think of it like this: each row in your game world is an array, and your map is an array of those rows. Let's start simple!

A basic array might store your player's inventory:
```js
const playerInventory = ["sword", "shield", "potion", "key"];
```

Easy! You get the first item with `playerInventory[0]` ("sword"), second with `playerInventory[1]` ("shield"), and so on.

Now here's where it gets EXCITING! What if instead of storing simple strings, we store arrays that represent rows of our game world? Check this out:

```js
// Each array represents one row of tiles in our game world
const topRow = [1, 1, 1, 1, 1];    // All walls across the top
const midRow = [1, 0, 0, 0, 1];    // Walls on sides, empty space inside  
const botRow = [1, 1, 1, 1, 1];    // All walls across the bottom
const gameMap = [topRow, midRow, botRow];
```

Now `gameMap` contains three arrays, each representing a row! The first element `gameMap[0]` is our top row `[1, 1, 1, 1, 1]`, the second is our middle row with the empty space.

**But here's the magic part!** You can access any specific tile in your world using two coordinates:

```js
const topLeftTile = gameMap[0][0];     // Gets 1 (wall)
const centerTile = gameMap[1][2];      // Gets 0 (empty space)
const bottomRightTile = gameMap[2][4]; // Gets 1 (wall)
```

Think of it like this: `gameMap[row][column]` - just like battleship coordinates! The first number picks which row (going down), the second picks which column (going across).

**Visual Connection:**
```
gameMap[0] = [1, 1, 1, 1, 1]  →  [🧱][🧱][🧱][🧱][🧱]
gameMap[1] = [1, 0, 0, 0, 1]  →  [🧱][  ][  ][  ][🧱]  
gameMap[2] = [1, 1, 1, 1, 1]  →  [🧱][🧱][🧱][🧱][🧱]
```

Cool, right? Each number in your array becomes a tile in your game world!


## BUILDING YOUR FIRST GAME LEVEL

Now let's create a real game level! Here's how we'll store our map data:

```js
const myMap = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1], 
  [1, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1]
];
```

**What you just created:** A complete game level that's 8 tiles wide and 6 tiles tall! Picture your hero starting at the top-left corner - they could explore 8 steps right and 6 steps down before reaching the edge of your world.

**Visualize your level:**
```
🧱🧱🧱🧱🧱🧱🧱🧱
🧱  🌟      🌟  🧱
🧱  🧱        🧱
🧱      🧱    🧱
🧱            🧱
🧱🧱🧱🧱🧱🧱🧱🧱
```
*(Where 🧱 = walls, 🌟 = walkable floors)*

## WHAT DO THESE NUMBERS MEAN?

Great question! Each number represents a different type of tile with its own properties and behavior. We'll use modern JavaScript objects to define what each number means:

```js
// Modern tile type definitions
const TileTypes = {
  0: {
    name: 'floor',
    walkable: true,
    color: 0x228B22,  // Forest green
    sprite: 'floor.png'
  },
  1: {
    name: 'wall', 
    walkable: false,
    color: 0x8B4513,  // Brown
    sprite: 'wall.png'
  },
  2: {
    name: 'enemy',
    walkable: false, 
    color: 0xFF4500,  // Red
    sprite: 'goomba.png',
    harmful: true
  }
};
```

**Here's how it works:**
- When your game sees a `0` in the map, it creates a floor tile that players can walk on
- When it sees a `1`, it creates a wall that blocks movement  
- A `2` might spawn an enemy that can hurt your player!

**Key Properties:**
- **walkable**: Can your player move through this tile? 
- **sprite**: What image should be displayed?
- **harmful**: Does touching this tile damage the player?
- **color**: What color to use for simple graphics (like our demos)

This system lets you design complex levels by just changing numbers in your array. Want to add a treasure chest? Just define tile type `3` and place some `3`s in your map!

