+++
title = "Why Tiles?"
date = 2026-03-08T21:00:00+11:00
weight = 1
draft = false
slug = "why-tiles"
tags = ["beginner", "tiles", "tutorial"]
next = "/tutorial/world-one/map-format/"
prev = ""
+++

Games like Super Mario Bros, The Legend of Zelda, and Stardew Valley build their worlds from tiles — small, reusable images arranged on a grid. The technique has been around since the early arcade era, and it's still standard practice because it solves a real problem efficiently.

So if you want to put a nice background into your game, but the picture would be too large and make the game very slow. What to do? Slice the picture into tiles!

![Example Tile](/p02_1.gif)

In the picture you can see that parts of picture are exactly same. 1 is same as 4, 2 is the same as 3 and parts 5-9 are all same thing. If you slice up the picture and reuse same parts in different areas, you have created the tiles. The big picture has much bigger filesize than tiles. You would actually need only 4 different tiles to draw that picture.

Another nice feature about tiles is, when you might want to replace part of your background, then you don't have to redraw everything, you can only replace 1 tile. You can reuse the tiles with different objects too. For example you might have tile with grass and another tile with flower on the grass, then you can take same grass background and only draw the flower.

## Tiles as game logic

Tiles aren't just graphics. Each tile in the map array is a number, and that number can mean anything: walkable floor, solid wall, damage zone, collectible, switch. The same rendering loop that draws the world can drive all of your collision detection, interaction, and game logic — because the map array *is* the game state.

That's why tile-based design scales so well. A platform game where each tile knows whether it's solid or deadly. An RPG where tiles trigger encounters or open passages. A puzzle game where tiles can be pushed or destroyed. In every case, the underlying system is the same: a grid of numbers with defined meanings.

[Next: Map Format](/tutorial/world-one/map-format/)