+++
title = "Isometric Mouse"
date = 2026-03-09T18:00:00+11:00
weight = 22
draft = false
tags = ["advanced", "optimization", "tutorial"]
next = "/tutorial/23-isometric-scroll/"
prev = "/tutorial/21-isometric-view/"
+++

Now that we know how to make isometric view and how to control the hero with mouse, we should go to sleep and forget all about those... Wait, no, I wanted to say we should now combine isometrics and mouse. Hey, wake up!

```
EXAMPLE HERE
```

Nothing really new here, we take [isometric](21-isometric-view.md) tutorial and change keyboard control to the [mouse](20-mouse-to-move.md) control.


## CONVERTING FROM ISOMETRIC

The only interesting question in this chapter is how to convert mouse coordinates from the screen to the tiles so we know which tile player has clicked. As you might remember from the previous chapter, we used:

```
game.xmouse = Math.round((_root._xmouse - game.tileW / 2) / game.tileW);
game.ymouse = Math.round((_root._ymouse - game.tileH / 2) / game.tileH);
```

If you ever wondered why we used those lines, then no, it's not because the code looks good and is long enough to impress your girlfriend. The reason we used that code was mainly because we had placed the hero on correct place using lines:

```
char.x = (char.xtile * game.tileW) + game.tileW / 2;
char.y = (char.ytile * game.tileW) + game.tileW / 2;
```

Don't be shy, look at the two pairs. I can even rewrite the lines for clarity. Lets take the code with char.x, if we replace strange names with simple letters, it says:

a = b * c + d

now for us to find mouse coordinates, we need to get letter "b" from that equation:

b = (a - d) / c

and this is exactly, what we have used for mouse. OK, but we were here to talk about isometric. In isometric view we cant get the tile clicked with mouse using same code because we have placed tiles in different way. All the tiles are placed in isometric using code:

xiso = x - y
yiso = (x + y) / 2

In order to find out, what tile has been clicked, we need to find variables "x" and "y" from those equations. Lets rewrite first line:

x = xiso + y

now replace the equation for x into second line:

yiso = (xiso + y + y) / 2

which can be rewritten couple of times:

yiso = (xiso + 2 * y) / 2
2 * yiso = xiso + 2*y
2 * y = 2 * yiso - xiso
y = (2 * yiso - xiso) / 2

And we have created two lines to calculate tile in isometric space from the screen coordinates:

y = (2 * yiso - xiso) / 2
x = xiso + y

## ACTUAL CODE

In the work function use this code to find out the isometric tile under the mouse:

```
var ymouse = ((2 * game.clip._ymouse - game.clip._xmouse) / 2);
var xmouse = (game.clip._xmouse + ymouse);
game.ymouse = Math.round(ymouse / game.tileW);
game.xmouse = Math.round(xmouse / game.tileW) - 1;
```

I'm sure you can see the similarities with 2 lines we created before. Variables xmouse and ymouse have values where mouse would have been, if we wouldn't be silly enough to start with all this isometric stuff.

Remember, don't use _root._xmouse because our "tiles" movie clip was moved (game.clip._x=150) and we want to get mouse inside "tiles" movie clip. If you use _root._xmouse, then the tile with x=0 would be placed in the left side of the stage, but isometric view places that tile about in the center of stage.

You can download the source fla with all the code and movie set up here.