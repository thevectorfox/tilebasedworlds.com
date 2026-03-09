+++
title = "Rendering a Map"
date = 2026-03-09T00:00:00+11:00
weight = 4
draft = false
tags = ["beginner", "tiles", "tutorial"]
next = "/tutorial/05-the-hero/"
prev = "/tutorial/03-more-maps/"
+++

As you saw in the chapter "Map format", we will have our map in a two-dimensional array. Now we will make the tiles appear on the screen by rendering the structure to view.

The result should look like this:

<iframe width="400" height="442" src="https://editor.p5js.org/ofhope/full/ERY7ZwtFGh"></iframe>

First, we declare some objects and variables:

```
myMap = [
[1, 1, 1, 1, 1, 1, 1, 1],
[1, 0, 0, 0, 0, 0, 0, 1],
[1, 0, 1, 0, 0, 0, 0, 1],
[1, 0, 0, 0, 0, 1, 0, 1],
[1, 0, 0, 0, 0, 0, 0, 1],
[1, 1, 1, 1, 1, 1, 1, 1]
];
 
game={tileW:30, tileH:30};
 
//walkable tile
game.Tile0 = function () {};
game.Tile0.prototype.walkable = true;
game.Tile0.prototype.frame = 1;
 
//wall tile
game.Tile1 = function () {};
game.Tile1.prototype.walkable = false;
game.Tile1.prototype.frame = 2;
```

So, we have our map in the variable myMap. Next line after the map declares object called "game". We will use this object to hold all the stuff needed, we could hold all the stuff in the _root or anywhere, but it's cleaner to put stuff in one certain place so we always know where it is.

Notice how we also give that game object two properties tileW=30 and tileH=30. That's how wide and how tall all our tiles will be. Tiles don't have to be squares, you could also use wide or tall rectangles. Whenever we want to know width or height of any tile, we can write:

```
game.tileW;
game.tileH;
```

And when we want to change size of tiles, we only have to change numbers in one line.

Next we set the tile prototypes inside our game object:

```
game.Tile0 = function () {};
game.Tile0.prototype.walkable = true;
game.Tile0.prototype.frame = 1;
```

First line "game.Tile0= function () {}" declares new object prototype. When we get 0 from map array, we will use Tile0 as template to make new tile object on that position.

Next 2 lines give that Tile0 object and every object created with Tile0 prototype some properties. We will set every such object having property walkable=true (that meaning we can walk over it) and frame=1 (it will show frame 1 from the attached tiles movie clip).


## MAKE MY MAP SHOW

Are you ready to make some tiles? We will make function buildMap that will handle all the tiles placement. If you want to create more levels, you can use same function with different map array. buildMap function will do following:

- attach container movie clip
- loop through map array
- create new object for each tile
- attach all the tiles clips
- place the tiles in correct position
- show correct frame in each tile

Here is the code for it:

```
function buildMap (map)
{
	_root.attachMovie("empty", "tiles", ++d);
	game.clip = _root.tiles;
	var mapWidth = map[0].length;
	var mapHeight = map.length;
	for (var i = 0; i < mapHeight; ++i)
	{
		for (var j = 0; j < mapWidth; ++j)
		{
			var name = "t_" + i + "_" + j;
			game[name] = new game["Tile" + map[i][j]];
			game.clip.attachMovie("tile", name, i * 100 + j * 2);
			game.clip[name]._x = (j * game.tileW);
			game.clip[name]._y = (i * game.tileH);
			game.clip[name].gotoAndStop(game[name].frame);
		}
	}
}
```

First line declares the function and also we set the argument of the function to be variable map. When we call the function, we will pass the map array to it, so variable map will be two-dimensional array.

Next line does attach container movie clip on the stage:

```
_root.attachMovie("empty", "tiles", ++d);
```

You will need empty movie clip (no graphics inside it) in the library. Right click on that movie clip in the library, choose "Linkage..." check "Export this symbol" and write "empty" in the Identifier box. Now the attachMovie command will look for movie clip with linkage name "empty" in the library. It will then make new instance of this movie clip on the stage and give this new mc name "tiles". That movie clip will hold all the tiles we place on stage. Nice thing about using container movie, is that when we want to remove our tiles (like when game ends), we only have to remove "tiles" movie clip and all the tiles will disappear. If you attach all the tiles directly into _root level, and you go to next frame (like game end frame) then the attached tiles won't disappear, you have to delete all of them with actionscript.

Once we have movie clip for all the tiles, we also link it to our game object game.clip = _root.tiles. Now when we need to access tiles movie clip, we can use game.clip. That's handy, if we ever need to place tiles somewhere else, we only have to rename this line and not go through all the code.

Then we make two new variables mapWidth and mapHeight. Those we will use in the loop to step through map array. mapWidth has value of length of first element in the map array map[0].length. Look back in the "Map format" chapter if you forgot how the map array looks like. First element of map array is another array [1, 1, 1, 1, 1, 1, 1, 1] and mapWidth will have the value of its length or number of elements. We now know how wide will our map be.

Same way mapHeight will have value of map.length, that's number of rows in the map array. And that's how many rows we will need to make.

We will loop through the map array using lines:

```
for (var i = 0; i < mapHeight; ++i)
{
	for (var j = 0; j < mapWidth; ++j)
	{
		...
	}
}
```

We start variable i from 0 and will add +1 to it until it is less than height of our map. Variable j loops from 0 to width of our map.

Variable "name" from the line var name = "t_"+i+"_"+j gives us name of our new tile object. Let's suppose i=0 and j=1, then name = "t_0_1". If i=34 and j=78, then name has value "t_34_78".

Now we create new tile object:

```
game[name] = new game["Tile"+map[i][j]]
```
In the left side game[name] will show that new tile object is placed inside game object, like all our stuff. Value of map[i][j] gives us number from map array depending what are i and j values. We then use keyword "new" to create new tile object from the prototypes we declared earlier. Now we have new object in the game object representing current tile.

In next lines we attach new movie clip on stage and use game.clip[name] to access it. Movie clip will be placed on correct x/y position using j and i variables multiplied by width or height of tiles. As our new tile object inherited "frame" property from its prototype, we use it to go to correct frame with gotoAndStop command.

When we want to create tiles from map, we call our buildMap function like this:

```
buildMap(myMap);
```
You can download the source fla with all the code and movie set up here.