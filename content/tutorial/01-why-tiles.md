+++
title = "Why Tiles?"
date = 2026-03-08T21:00:00+11:00
weight = 1
draft = false
tags = ["beginner", "tiles", "tutorial"]
next = "/tutorial/02-map-format/"
prev = "/tutorial/00-crash-course-js/"
+++

Ever wondered how games like Super Mario Bros, The Legend of Zelda, or even modern hits like Stardew Valley create their massive worlds? The secret sauce is TILES! You're about to discover one of game development's most powerful techniques - and by the time we're done, you'll be building your own game worlds faster than you can say "1-Up!"

Tiles aren't just a retro throwback - they're still the backbone of modern game development! While we don't worry about kilobytes anymore, tiles give us something even better: the power to create massive, interactive worlds with lightning-fast performance and surprisingly little code.

So if you want to put a nice background into your game, but the picture would be too large and make the game very slow. What to do? Slice the picture into tiles!

![Example Tile](/p02_1.gif)

In the picture you can see that parts of picture are exactly same. 1 is same as 4, 2 is the same as 3 and parts 5-9 are all same thing. If you slice up the picture and reuse same parts in different areas, you have created the tiles. The big picture has much bigger filesize than tiles. You would actually need only 4 different tiles to draw that picture.

Another nice feature about tiles is, when you might want to replace part of your background, then you don't have to redraw everything, you can only replace 1 tile. You can reuse the tiles with different objects too. For example you might have tile with grass and another tile with flower on the grass, then you can take same grass background and only draw the flower.

## But Here's Where Tiles Get REALLY Exciting!

Tiles aren't just about graphics - they're about GAMEPLAY! Each tile can have properties: "Can the player walk on this? Does it kill enemies? Can you break it with your sword?" Suddenly you're not just drawing pretty pictures - you're building interactive worlds where every square has meaning!

Imagine creating:
- **Platform games** where each tile knows if it's solid, bouncy, or deadly
- **RPG worlds** where tiles trigger battles, treasure, or secret passages  
- **Puzzle games** where tiles can be pushed, destroyed, or transformed
- **Infinite runners** that generate new challenges on the fly

Ready to start building? Let's dive into how we store and organize these magical tile-based worlds! [Next: Map Format](/tutorial/02-map-format)