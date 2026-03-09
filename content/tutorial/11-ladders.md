+++
title = "Ladders"
date = 2026-03-09T07:00:00+11:00
weight = 11
draft = false
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/12-stupid-enemy/"
prev = "/tutorial/10-clouds/"
+++

Ladders are common form of movement in platform games. Hero can use ladders to climb up or down (I bet you didnt know that). We will make character climb when up or down arrow key is pressed and character stands near the ladder:

```
EXAMPLE HERE
```

While ladders seam to be easy enough, there are some things to consider. First, what kind of ladders are there?

![](p12_2.gif)

In the picture, there are 4 different types of ladders. In tile A ladder is inside wall tile, which normally is not walkable. What can hero do in tile A? He can climb up and down, but he shouldnt be able to walk left or right or he will be stuck in the wall. Ask anyone, who has been stuck in the wall and they all say it doesnt feel good.

In tile B ladder tile itself is walkable and tile above it also have ladder, so hero should be able to climb up and down. Hero can also move left or right, but when he does, he should fall down after leaving the ladder.

In tile C there isnt ladder below and hero shouldnt climb down, he can only climb up or walk left/right.

Tile D is not available in all games. Some think thats just a bad level design, ladder doesnt lead anywhere, it ends in the air. Should hero be able to climb above it and stand on the ladder? Can he walk then to the right on the solid tile next to ladder?

Those are just couple of examples, there are many more possible types of ladders, but I hope you can see how important it is to have strict definition before attempting to write code. As games are not all similar, then something fitting perfectly in one game, is waste of time, energy and world peace in other game.


## THE RULES

Lets write down our rules for ladders and movement for hero:

1. Hero can climb on the ladder using up and down arrow keys
2. Hero can climb up if there is ladder at his current up or down center points
3. Hero can climb down if the tile his down center point ends up, has ladder
4. Hero can move left/right from the ladder if none of his corner points will end up in the wall
5. Hero cant jump from the ladder

That should do it.

## ONE LADDER, PLEASE

We will use separate movie clip with ladder graphics that will be attached in the tile when tile has ladder. That way we dont have to draw different graphics for every ladder on different backgrounds. Make sure your ladder movie clip has "Export this movie" checked and it is linked as "ladder".

![](p12_3.gif)

In the ladder movie clip draw ladder graphics same height as tile and place them in the center of tile horisontally.

As with every other tile, we will declare new type of tile for ladders:

```
game.Tile4 = function () {};
game.Tile4.prototype.walkable = false;
game.Tile4.prototype.frame = 2;
game.Tile4.prototype.ladder = true;
game.Tile4.prototype.item = "ladder";

game.Tile5 = function () {};
game.Tile5.prototype.walkable = true;
game.Tile5.prototype.frame = 1;
game.Tile5.prototype.ladder = true;
game.Tile5.prototype.item = "ladder";
```

Those two types of ladder have different frame number to show, but they both have property "ladder" set to true (we will use it to check if hero is anywhere near the ladder) and they both have property "item" equal to "ladder" (we will use this to attach ladder graphics to the tile).

Attach the ladder movie to the tile in the buildMap function after sending tile to correct frame:

```
game.clip[name].gotoAndStop(game[name].frame);
if (game[name].item != "")
{
	game.clip[name].attachMovie(game[name].item, "item", 1);
}
```

This code checks if property "item" in the current tile has non-empty value. If "item" has value, then we attach movie clip linked with the name as value of "item" property to the current tile and it will have instance name "item". You can attach any other items same way, just dont try to put many items in the same tile.

For not typing same code twice, lets move end of moveChar function and make separate function of it naming this new function updateChar. moveChar function will end with:

```
updateChar (ob, dirx, diry);
return (true);
```

and updateChar function will have:

```
function updateChar (ob, dirx, diry)
{
	ob.clip._x = ob.x;
	ob.clip._y = ob.y;
	ob.clip.gotoAndStop(dirx + diry * 2 + 3);
	ob.xtile = Math.floor(ob.clip._x / game.tileW);
	ob.ytile = Math.floor(ob.clip._y / game.tileH);
	if (game["t_" + ob.ytile + "_" + ob.xtile].door and ob == _root.char)
	{
		changeMap (ob);
	}
}
```

At the fall function add

```
ob.climb = false;
```

Modify detectKeys function for the arrow keys:

```
if (Key.isDown(Key.RIGHT))
{
	getMyCorners (ob.x - ob.speed, ob.y, ob);
	if (!ob.climb or ob.downleft and ob.upleft and ob.upright and ob.downright)
	{
		keyPressed = _root.moveChar(ob, 1, 0);
	}
}
else if (Key.isDown(Key.LEFT))
{
	getMyCorners (ob.x - ob.speed, ob.y, ob);
	if (!ob.climb or ob.downleft and ob.upleft and ob.upright and ob.downright)
	{
		keyPressed = _root.moveChar(ob, -1, 0);
	}
}
else if (Key.isDown(Key.UP))
{
	if (!ob.jump and checkUpLadder (ob))
	{
		keyPressed = _root.climb(ob, -1);
	}
}
else if (Key.isDown(Key.DOWN))
{
	if (!ob.jump and checkDownLadder (ob))
	{
		keyPressed = _root.climb(ob, 1);
	}
}
```

After we have detected left or right arrow key, we will check if hero is not climbing (!ob.climb) or in case he is climbing, we will check that none of his corner points will be in the wall.

For up and down arrow keys we first check if hero is not jumping (!ob.jump) and the conditions for climbing are met using two new functions: checkUpLadder and checkDownLadder. If everything is fine, we call new function "climb" to move our hero.


## CLIMBING FUNCTIONS

We will make 3 new functions for climbing, 1 to check if it is fine to climb up, 1 to check if we can climb down and last function to move character.

```
function checkUpLadder (ob)
{
	var downY = Math.floor((ob.y + ob.height - 1) / game.tileH);
	var upY = Math.floor((ob.y - ob.height) / game.tileH);
	var upLadder = game["t_" + upY + "_" + ob.xtile].ladder;
	var downLadder = game["t_" + downY + "_" + ob.xtile].ladder;
	if (upLadder or downLadder)
	{
		return (true);
	}
	else
	{
		fall (ob);
	}
}
```

This code calculates first up and down center points of our hero. If one of the tiles in those points has ladder property set to true, we can climb up. If there isnt ladder up or down, we check if hero should fall.

```
function checkDownLadder (ob)
{
	var downY = Math.floor((ob.speed + ob.y + ob.height) / game.tileH);
	var downLadder = game["t_" + downY + "_" + ob.xtile].ladder;
	if (downLadder)
	{
		return (true);
	}
	else
	{
		fall (ob);
	}
}
```

To check for climbing down, we need "ladder" property of the tile below hero. But unlike climbing up, we have to look for the tile, where hero will be standing after he moves (ob.speed+ob.y+ob.height).

```
function climb (ob, diry)
{
	ob.climb = true;
	ob.jump = false;
	ob.y += ob.speed * diry;
	ob.x = (ob.xtile * game.tileW) + game.tileW / 2;
	updateChar (ob, 0, diry);
	return (true);
}
```

In the climb function we first set the flags climb to true and jump to false. Then we calculate new y position for the hero. Next we will position the hero horisontally in the center of ladder:

ob.x = (ob.xtile * game.tileW) + game.tileW / 2;
Hero can start climbing as long his center is in the tile with ladder, but it would look weird if he would climb in the left or right side of the ladder.

Last we update the actual position of character using same updateChar function.

You can download the source fla with all the code and movie set up here.