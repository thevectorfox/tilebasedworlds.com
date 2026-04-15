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

Maps in tile-based games are stored as **2D arrays** — grids of numbers where each value identifies a tile type. The position of each number in the array corresponds directly to its position in the world.

## 2D arrays

A 2D array is an array whose elements are themselves arrays. Each inner array is a row, and the outer array holds all the rows. Starting simple:

A basic array might store your player's inventory:
```js
const playerInventory = ["sword", "shield", "potion", "key"];
```

Easy! You get the first item with `playerInventory[0]` ("sword"), second with `playerInventory[1]` ("shield"), and so on.

If the elements are themselves arrays, you get a grid:

```js
// Each array represents one row of tiles in our game world
const topRow = [1, 1, 1, 1, 1];    // All walls across the top
const midRow = [1, 0, 0, 0, 1];    // Walls on sides, empty space inside  
const botRow = [1, 1, 1, 1, 1];    // All walls across the bottom
const gameMap = [topRow, midRow, botRow];
```

`gameMap[0]` is the top row `[1, 1, 1, 1, 1]`, `gameMap[1]` is the middle row with the empty space. Any specific tile is reachable with two indices:

```js
const topLeftTile = gameMap[0][0];     // Gets 1 (wall)
const centerTile = gameMap[1][2];      // Gets 0 (empty space)
const bottomRightTile = gameMap[2][4]; // Gets 1 (wall)
```

`gameMap[row][column]` — the first index picks the row (vertical), the second picks the column (horizontal).

**Visual connection:**
```
gameMap[0] = [1, 1, 1, 1, 1]  →  [🧱][🧱][🧱][🧱][🧱]
gameMap[1] = [1, 0, 0, 0, 1]  →  [🧱][  ][  ][  ][🧱]  
gameMap[2] = [1, 1, 1, 1, 1]  →  [🧱][🧱][🧱][🧱][🧱]
```

Each number in the array corresponds to one tile position in the world.


## A simple level

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

An 8×6 level. Visualised:
```
🧱🧱🧱🧱🧱🧱🧱🧱
🧱  🌟      🌟  🧱
🧱  🧱        🧱
🧱      🧱    🧱
🧱            🧱
🧱🧱🧱🧱🧱🧱🧱🧱
```
*(Where 🧱 = walls, 🌟 = walkable floors)*

## Tile values

Each number represents a tile type. A JavaScript object maps those numbers to their properties:

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

A `0` in the map renders a walkable floor, a `1` renders a solid wall, a `2` could spawn an enemy. The `walkable`, `sprite`, `harmful`, and `color` properties define what the renderer and game logic do with each tile type.

To add a new tile — a treasure chest, a hazard, a door — define it in `TileTypes` and place its number in the array.

