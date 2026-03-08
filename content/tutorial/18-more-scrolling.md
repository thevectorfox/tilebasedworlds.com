+++
title = "More Scrolling"
date = 2026-03-09T14:00:00+11:00
weight = 18
draft = false
tags = ["advanced", "optimization", "tutorial"]
next = "/tutorial/19-depth/"
prev = "/tutorial/17-scrolling/"
+++

# MORE SCROLLING

Keeping the hero in the center is all fine until we move at the border of map, then we start to see some ugly background outside of the map. You can make this problem disappear, if you build wall tiles inside your map, preventing heros approaches to the edge. But that will need additional planning in the maps, and it adds unnecessary empty area around them. Much better idea is to scroll the background only when hero is not near the edge. Like this:

```
EXAMPLE HERE
```


## HOW FAR IS TOO FAR?

Hero will always move, only difference is, that when he reaches the edge of map, we wont scroll the background tiles anymore, making it not scroll. In the left picture hero is from the left edge "halfvisx" number of tiles away. If hero would move more left and the map would scroll, it would reveal an area not covered by the map and the tiles:

![](p19_2.gif)

In the right ricture hero is from the bottom edge "halfvisy" number of tiles away. No more scrolling should happen when hero moves down.

We have to consider the new positions of hero also when we first build the map. If hero starts near the map edge, he cant be placed in the center. What actually happens, is that we will shift all the tiles, included hero by certain amount when placing them with buildMap function.

After placing tiles clip and calculating values for halfvisx/halfvisy in the buildMap function add code:

```
game.mapwidth = map[0].length;
game.mapheight = map.length;
```

game.mapwidth will have be the number of horisontal tiles on current map and game.mapheight is number of vertical tiles. We will use those to determine, if hero is near the right or bottom edge of map. Now lets calculate how much we have to move tiles when hero starts near the edge:

```
if(char.xtile < game.halfvisx)
{
	var fixx = char.xtile - game.halfvisx;
}
else if(char.xtile > game.mapwidth - game.halfvisx)
{
	var fixx = game.mapwidth - char.xtile;
}
if(char.ytile < game.halfvisy)
{
	var fixy = char.ytile - game.halfvisy;
}
else if(char.ytile > game.mapheight - game.halfvisy - 1)
{
	var fixy = game.mapheight - char.ytile - 1;
}
```

fixx and fixy will have value of number of tiles needed to shift everything to make hero appear in the correct poistion. First line checks if hero is near the left edge, it happens only when xtile is less then halfvisx and then we move tiles by the amount of xtile-halfvisx. In the right edge hero stands only if xtile is more then mapwidth-halfvisx.

Now we add fixx/fixy to the position of tile:

```
game.clip._x = game.centerx - ((char.xtile - fixx) * game.tileW) - game.tileW / 2;
game.clip._y = game.centery - ((char.ytile - fixy) * game.tileH) - game.tileH / 2;
```

and we also have to change the loops for creating visible tiles:

```
for (var y = char.ytile - game.halfvisy - fixy; y <= char.ytile
                                                  + game.halfvisy + 1 - fixy; ++y)
{
	for (var x = char.xtile - game.halfvisx - fixx; x <= char.xtile
                                                  + game.halfvisx + 1 - fixx; ++x)
	{
		...
```
Thats about building the map. Now lets move on to move the hero.


## MOVING ON THE EDGE

In the moveChar function put the scrolling part into if statements:

```
if(ob.x > game.halfvisx * game.tileW + game.tileW / 2)
{
   if(ob.x < (game.mapwidth - game.halfvisx) * game.tileW - game.tileW / 2)
   {
      game.clip._x = game.centerx - ob.x;
      if(ob.xstep < ob.x - game.tileW)
      {
         var xnew = ob.xtile + game.halfvisx + 1;
         var xold = ob.xtile - game.halfvisx - 1;
         var fixy = Math.round(((game.centery - ob.y) - game.clip._y) / game.tileH);
         for (var i = ob.ytile - game.halfvisy - 1 + fixy; i <= ob.ytile + game.halfvisy
		                                                         + 1 + fixy; ++i)
         {
            changeTile (xold, i, xnew, i, _root["myMap" + game.currentMap]);
         }
         ob.xstep = ob.xstep + game.tileW;
      }
      else if(ob.xstep > ob.x)
      {
         var xold = ob.xtile + game.halfvisx + 1;
         var xnew = ob.xtile - game.halfvisx - 1;
         var fixy = Math.round(((game.centery - ob.y) - game.clip._y) / game.tileH);
         for (var i = ob.ytile - game.halfvisy - 1 + fixy; i <= ob.ytile + game.halfvisy
		                                                         + 1 + fixy; ++i)
         {
            changeTile (xold, i, xnew, i, _root["myMap" + game.currentMap]);
         }
         ob.xstep = ob.xstep - game.tileW;
      }
   }
}
```

Its the same thing as before, only we first check if hero has moved near the edge. Also for the loop moving tiles from one side to the other work correctly, we have to use our friends fixy/fixx again. Notice that unlike in the buildmap function, we use actual pixel coordinates here because our hero can move not only by whole tile, but also by fraction of tile.

Same way we modify vertical movement too:

```
if(ob.y > game.halfvisy * game.tileH + game.tileH / 2)
{
   if(ob.y < (game.mapheight - game.halfvisy) * game.tileH - game.tileH / 2)
   {
      game.clip._y = game.centery - ob.y;
      if(ob.ystep < ob.y - game.tileH)
      {
         var ynew = ob.ytile + game.halfvisy + 1; var yold = ob.ytile - game.halfvisy - 1;
         var fixx = Math.round(((game.centerx - ob.x) - game.clip._x) / game.tileW);
         for (var i = ob.xtile - game.halfvisx - 1 + fixx; i <= ob.xtile + game.halfvisx
		                                                         + 1 + fixx; ++i)
         {
            changeTile (i, yold, i, ynew, _root["myMap" + game.currentMap]);
         }
         ob.ystep = ob.ystep + game.tileH;
      }
      else if(ob.ystep > ob.y)
      {
         var yold = ob.ytile + game.halfvisy + 1;
         var ynew = ob.ytile - game.halfvisy - 1;
         var fixx = Math.round(((game.centerx - ob.x) - game.clip._x) / game.tileW);
         for (var i = ob.xtile - game.halfvisx - 1 + fixx; i <= ob.xtile + game.halfvisx
		                                                         + 1 + fixx; ++i)
         {
            changeTile (i, yold, i, ynew, _root["myMap" + game.currentMap]);
         }
         ob.ystep = ob.ystep - game.tileH;
      }
   }
}
```

Thats all from the scrolling department, next we will look at the depth of movie clips and something very scary called "z-sorting".

You can download the source fla with all the code and movie set up here.

