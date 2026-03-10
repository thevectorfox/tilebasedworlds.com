+++
title = "Clouds"
date = 2026-03-09T06:00:00+11:00
weight = 10
draft = false
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/11-ladders/"
prev = "/tutorial/09-jumping/"
+++

So far we have hit our hero against the wall. And that was fun. But the brick wall is not the only type of wall we could make. Many games have "cloud" type of walls, they allow hero to move through them from left or right and also jump up, but when hero is falling down, he will stand on it. Look at the example:

```
EXAMPLE HERE
```

So, did you notice the difference? Let's look at the pictures just in case. Here we have normal brick wall type of tile. Hero cant enter that tile from any direction.

![](/p11_2.gif)

But this is cloud. Hero can enter the tile from any other direction, except from above. If hero is dumb enough to try entering from above, we place him just above to the cloud:

![](/p11_3.gif)

We will first set up some tiles with the property "cloud". If the tile has "cloud" set to true, it is obviously cloud type. Declare some prototypes:

```
game.Tile4 = function () {};
game.Tile4.prototype.walkable = true;
game.Tile4.prototype.cloud = true;
game.Tile4.prototype.frame = 4;
```
The tile has "walkable" property set to true, so yes, hero can walk into it. In order to make hero stand on it, when falling, we create new function.

```
function checkIfOnCloud (ob)
{
	var leftcloud = game["t_" + ob.downY + "_" + ob.leftX].cloud;
	var rightcloud = game["t_" + ob.downY + "_" + ob.rightX].cloud;
	if (leftcloud or rightcloud)
	{
		return(true);
	}
	else
	{
		return(false);
	}
}
```
We use the bottom right and left corner points to check if one of those is placed on the tile, which cloud property is true. If one of them actually is on cloud, we return true. If no cloud is found, return value is false.

Now we need to call this function from two places: from moveChar function when checking for going down and from fall function when checking if hero still stands on solid tiles or should he start to fall.

Locate this line in the moveChar function right after if (diry == 1):

```
if (ob.downleft and ob.downright)
{
	...
```
Add check for cloud:

```
if (ob.downleft and ob.downright and !checkIfOnCloud (ob))
{
	...
```
Same way in the fall function replace line:

```
if (ob.downleft and ob.downright)
{
	...
```
with

```
if (ob.downleft and ob.downright and !checkIfOnCloud (ob))
{
	...
```
So, before we used to check only if both left/right bottom points are on tile which has walkable property set to true (we calculated values for ob.downleft and ob.downright in the getMyCorners function). Now we only add check if those points are not inside cloud tile.

Enjoy the clouds. And sun. And stars :)

You can download the source fla with all the code and movie set up here.