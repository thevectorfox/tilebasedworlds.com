+++
title = "Hit the Wall"
date = 2026-03-09T03:00:00+11:00
weight = 7
draft = false
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/08-open-the-door/"
prev = "/tutorial/06-keys-to-move/"
+++

Its no fun having hero that can walk, but cant hit the wall. We will make our hero to feel the power of solid brick wall. Or any other tile we decide to be not walkable:

```
EXAMPLE HERE
```

In the first chapter we did set our tiles to have property "walkable". When object representing tile in current position has property walkable set to "false", hero cant go there. But then again, if the walkable property is "true", then hero can walk there (thats called "logic", people learn it in the school, some even in the university, poor, poor devils).

In order this magic to work, we will do following: after arrow key has been pressed, we check if the tile, where char will walk, is walkable. If it is, we will move the hero. If the tile is not walkable (the hard brick wall type), then we will ignore the arrow keys pressed.

This is perfect collision with wall:

![](p08_2.gif)

Hero stands next to wall and in next step he would be inside the wall. We cant let it happen, so we wont. No moving, man! But world is not perfect, what if only part of hero would be colliding:

![](p08_3.gif)

That requires us to check for collision between hero and wall with all 4 characters corner points. If any of hero's corners (lower left corner in this example), would be inside the wall, we will stop the hero.

Or if hero is not next to wall yet, but would still go inside the wall if you allow him to step there:

![](p08_4.gif)

We will have to place hero by the wall:

![](p08_5.gif)

"Oh, no!" you might cry, "All this is impossible to do!" Not to worry, its not actually very hard.


## GIVE ME MY CORNERS

We don't want parts of our character go inside wall so we have to check collision between hero and the unwalkable object using not one, but four points. We will use corner points, expecting most of heroes look like rectangles (they DO!).

For the purpose lets make new function called getMyCorners:

```
function getMyCorners (x, y, ob)
{
	ob.downY = Math.floor((y + ob.height - 1) / game.tileH);
	ob.upY = Math.floor((y - ob.height) / game.tileH);
	ob.leftX = Math.floor((x - ob.width) / game.tileW);
	ob.rightX = Math.floor((x + ob.width - 1) / game.tileW);

	//check if they are walls 

	ob.upleft = game["t_" + ob.upY + "_" + ob.leftX].walkable;
	ob.downleft = game["t_" + ob.downY + "_" + ob.leftX].walkable;
	ob.upright = game["t_" + ob.upY + "_" + ob.rightX].walkable;
	ob.downright = game["t_" + ob.downY + "_" + ob.rightX].walkable;
}
```
This function accepts 3 arguments: x/y position of the center point of object on stage (pixels) and name of the object. Wait, we already know x/y position of the object, we have it saved inside the char object, you may wonder. Thats true, but we have saved the CURRENT position of the char, here we are dealing with the position char WOULD BE if it would move.

First we calculate the tiles where character extends. Its center might be on one tile, but its left side might be on other tile, its highest point might be on third tile. Adding variable y with the height of hero and dividing it with height of tile, we will get the number of tile where objects lowest point (downY) will stand.

Last 4 lines use points we calculated to get the value of walkable property in each tile on the corners. For example upleft corner uses upY and leftX variables. As you can see all the points are also saved in the ob object and we can access them later when moving the char. I would again like to point out, how getMyCorners function will work with any moving object, not only the hero.


## MOVE

When we know the types of tile each corner of character will be on, we can easily write movement for the char: if all the corners are walkable, then move, else dont move. More work is needed to place the hero right next to wall if the collision would happen. Our modified moveChar function to handle all 4 possible directions might look a bit confusing, but most of it is written 4 times over for each direction. Lets look at the function:

```
function moveChar(ob, dirx, diry)
{
	getMyCorners (ob.x, ob.y + ob.speed * diry, ob);
	if (diry == -1)
	{
		if (ob.upleft and ob.upright)
		{
			ob.y += ob.speed * diry;
		}
		else
		{
			ob.y = ob.ytile * game.tileH + ob.height;
		}
	}
	if (diry == 1)
	{
		if (ob.downleft and ob.downright)
		{
			ob.y += ob.speed * diry;
		}
		else
		{
			ob.y = (ob.ytile + 1) * game.tileH - ob.height;
		}
	}
	getMyCorners (ob.x + ob.speed * dirx, ob.y, ob);
	if (dirx == -1)
	{
		if (ob.downleft and ob.upleft)
		{
			ob.x += ob.speed * dirx;
		}
		else
		{
			ob.x = ob.xtile * game.tileW + ob.width;
		}
	}
	if (dirx == 1)
	{
		if (ob.upright and ob.downright)
		{
			ob.x += ob.speed * dirx;
		}
		else
		{
			ob.x = (ob.xtile + 1) * game.tileW - ob.width;
		}
	}
	ob.clip._x = ob.x;
	ob.clip._y = ob.y;
	ob.clip.gotoAndStop(dirx + diry * 2 + 3);
	ob.xtile = Math.floor(ob.clip._x / game.tileW);
	ob.ytile = Math.floor(ob.clip._y / game.tileH);
	return (true);
}
```
Like before, moveChar function gets object and directions from the detected keys. The line:

```
getMyCorners (ob.x, ob.y + ob.speed * diry, ob);
```
calculates the corner points for vertical movement (when diry is not equal to 0). After we have calculated the corners, we can use the values from each tiles walkable property to check if hero can step there:

```
if (diry == -1)
{
	if (ob.upleft and ob.upright)
	{
		ob.y += ob.speed * diry;
	}
	else
	{
		ob.y = ob.ytile * game.tileH + ob.height;
	}
}
```
This block of code works for up movement. When up arrow key was pressed, value for diry = -1. We use values of ob.upleft and ob.upright calculated in the getMyCorners function, if they are both "true" meaning both tiles are walkabale, we let char move like we did before adding speed*diry to char's y property.

But if one of corners happens to be inside the wall and so value of ob.upleft or ob.upright is "false", we place object near the wall. For char to be next to wall above it, its center point must be placed below the current tiles upper border by char.height.

![](p08_6.gif)

ob.ytile*game.tileH would place character's center on the line between two tiles, we add height property of object to move it further down. Same way moveChar function goes through movements for down (diry == 1), left (dirx == -1) and right (dirx == 1).

Last lines place actual clip of character on the position calculated, make character show correct frame with animation and calculate new values for characters center point (xtile, ytile). Just like before, function returns "true".

You can download the source fla with all the code and movie set up here.