+++
title = "Mouse to Move"
date = 2026-03-09T16:00:00+11:00
weight = 20
draft = false
tags = ["advanced", "optimization", "tutorial"]
next = "/tutorial/21-isometric-view/"
prev = "/tutorial/19-depth/"
+++

It's time to let go of the keyboard and grab that little furry thing on your desk. Not that, the computer mouse. While moving hero around with the keys is fine and has been happening for a long time, we should also understand why mouse is so popular. Mouse is so convenient, click here, click there:

```
EXAMPLE HERE
```

Before we jump on the mouse, one thing should be made clear. So far our hero was able to move pixel perfect, but that is not the case with the mouse. Mouse control also means hero will be stepping from center of one tile to the center of next and he can't stop somewhere between two tiles, look around, whistle nice tune. Moving from one tile to another is much simpler than pixel perfect positioning. We don't need collision detection for example, when we want to walk on next tile, we only check if its walkable and then its all happy walking until we reach the center.


## MAKING THE MOUSE

Draw rectangle, which will represent the mouse, make it movie clip and set its linkage name to "mouse". Make sure you have aligned mouse graphics same way as tiles - left upper corner.

![](/p22_2.gif)

Now attach mouse to the stage, above all the tiles. In the buildMap function write.

```
_root.attachMovie("mouse", "mouse", 2);
```

Everything else in the buildMap function remains the same, so I'm not going to go over it again. For mouse cursor to update its position correctly, let's create new function, called work:

```
function work()
{
	game.xmouse = Math.round((_root._xmouse - game.tileW / 2) / game.tileW);
	game.ymouse = Math.round((_root._ymouse - game.tileH / 2) / game.tileH);
	_root.mouse._x = game.xmouse * game.tileW;
	_root.mouse._y = game.ymouse * game.tileH;
}
```

We calculate properties xmouse and ymouse in the game object, which will know where mouse is. To be exact, the tile number its over. In the char object we had similar properties called xtile and ytile. Last two lines place the mouse over that tile.

This function will be called on every frame from the controller movie clip on stage:

```
onClipEvent (enterFrame)
{
	_root.work();
}
```

As we don't use keys, you can delete detectKeys function in case you have it left over from earlier chapter.

Now that we have mouse moving like it should, we add a way to click on stage. Write this to the controller mc:

```
onClipEvent (mouseUp)
{
	_root.getTarget();
}
```

When left mouse button is released, we call function getTarget. By using clip event "mouseUp", we call the function only, when mouse button is released, not when its pressed down. If you prefer it other way, replace it with mouseDown event. Write the getTarget function:

```
function getTarget()
{
	if(game["t_" + game.ymouse + "_" + game.xmouse].walkable)
	{
		game.targetx = game.xmouse;
		game.targety = game.ymouse;
		char.moving = true;
	}
}
```

Here we make sure player actually clicks on walkable tile. You know how players are, they click everywhere and when you ask them politely "Why in the name of God did you have to click there?", they only say "I dunno, looked like nice spot". Anyway, we ensure they can still click anywhere they want to, but our function ignores all the clicks on non-walkable tiles. If, however, by some miracle, the player manages to click on walkable tile, we set properties "targetx" and "targety" to the tiles below the mouse. And we set variable "char.moving" to true.


## MOVING THE HERO TO RIGHT TILE

In the getTarget function we did set variable "moving" to true and as long that variable is true, our hero tries to move. Since we don't want the hero to move when game starts, set the moving variable to false in char object:

```
char = {xtile:2, ytile:1, speed:2, moving:false};
```

Add some code in the end of work function:

```
var ob = char;
if (!ob.moving)
{
	ob.clip.char.gotoAndStop(1);
}
else
{
	moveChar(ob);
	ob.clip.char.play();
}
```

Until moving variable is false, hero stands still and doesn't play any animations. But when moving is true, we play the walking animation and call function to move the char. Don't worry, for the movement from tile-to-tile our moveChar function is much simpler:

```
function moveChar(ob)
{
   if((ob.x - game.tileW / 2) % game.tileW == 0 and (ob.y - game.tileH / 2)
                                                         % game.tileH == 0)
   {
      ob.xtile = Math.floor(ob.x / game.tileW);
      ob.ytile = Math.floor(ob.y / game.tileH);
      if(game["t_" + ob.ytile + "_" + (ob.xtile+1)].walkable and game.targetx > ob.xtile)
      {
         ob.dirx = 1;
         ob.diry = 0;
      }
      else if(game["t_" + ob.ytile + "_" + (ob.xtile-1)].walkable
	                               and game.targetx < ob.xtile)
      {
         ob.dirx = -1;
         ob.diry = 0;
      }
      else if(game["t_" + (ob.ytile + 1) + "_" + ob.xtile].walkable
	                                 and game.targety > ob.ytile)
      {
         ob.dirx = 0;
         ob.diry = 1;
      }
      else if(game["t_" + (ob.ytile - 1) + "_" + ob.xtile].walkable
	                                 and game.targety < ob.ytile)
      {
         ob.dirx = 0;
         ob.diry = -1;
      }
      else
      {
         ob.moving = false;
         return;
      }
   }
   ob.y += ob.speed * ob.diry;
   ob.x += ob.speed * ob.dirx;
   ob.clip._x = ob.x;
   ob.clip._y = ob.y;
   ob.clip.gotoAndStop(ob.dirx + ob.diry * 2 + 3);
}
```

First line in the function checks if hero is currently standing in the center of tile and that would mean he is ready to move, if he only knew where to go and why to go there. The x position and y position are checked using modulo "%". This basically checks the remainder of dividing chars position by tile size. When x and y are in the center of tile, then dividing them with tileW gives remainder 0 and we start to pick new direction.

Advanced pathfinding algorithms are available for Flash too, mainly A*. Most of them are going to take a lot of time to calculate path from point A to point B. Our method here is very basic and doesn't find any paths, hero moves in one direction until it reaches the target coordinate or wall. Then he moves vertically same way.

To know which way to turn, let's look at the going right decision:

```
if(game["t_" + ob.ytile + "_" + (ob.xtile+1)].walkable and game.targetx > ob.xtile)
{
	...
```

We check if the tile 1 step right from the hero's current tile, has walkable property set to true. And we also check if the mouse was clicked right from the hero.

That's all for today about controlling the hero with mouse.

You can download the source fla with all the code and movie set up here.

