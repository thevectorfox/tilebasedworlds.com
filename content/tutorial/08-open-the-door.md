+++
title = "Open the Door"
date = 2026-03-09T04:00:00+11:00
weight = 8
draft = false
tags = ["intermediate", "gameplay", "tutorial"]
next = "/tutorial/09-jumping/"
prev = "/tutorial/07-hit-the-wall/"
+++

How long can you stay in one room? How long will you look at same picture? Yep, we need more rooms to explore. That means a way to change the map, create new room from tiles and place the hero in correct position.

```
EXAMPLE HERE
```

To make two rooms, we declare two maps:

```
myMap1 = [
[1, 1, 1, 1, 1, 1, 1, 1],
[1, 0, 0, 0, 0, 0, 0, 1],
[1, 0, 1, 0, 0, 0, 0, 1],
[1, 0, 0, 0, 0, 1, 0, 1],
[1, 0, 0, 0, 0, 0, 0, 2],
[1, 1, 1, 1, 1, 1, 1, 1]
];


myMap2 = [
[1, 1, 1, 1, 1, 1, 1, 1],
[1, 0, 0, 0, 0, 0, 0, 1],
[1, 0, 1, 0, 0, 0, 0, 1],
[1, 0, 0, 0, 0, 1, 0, 1],
[3, 0, 0, 0, 0, 0, 0, 1],
[1, 1, 1, 1, 1, 1, 1, 1]
];
```
In the game object we also set the number of currently used map:

```
game={tileW:30, tileH:30, currentMap:1}
```
So, we start exploring in the myMap1. To call buildMap function, we calculate the map needed with _root["myMap"+game.currentMap] when currentMap is 1, we will get myMap1:

```
buildMap(_root["myMap" + game.currentMap])
```
Next we need new object to represent the doors:

```
game.Doors = function (newmap, newcharx, newchary)
{
	this.newmap = newmap;
	this.newcharx = newcharx;
	this.newchary = newchary;
};

game.Doors.prototype.walkable = true;
game.Doors.prototype.frame = 3;
game.Doors.prototype.door = true;
game.Tile2 = function () { };
game.Tile2.prototype = new game.Doors(2, 1, 4);
game.Tile3 = function () { };
game.Tile3.prototype = new game.Doors(1, 6, 4);
```
As you probably already guessed, door tile can be stepped on, it shows frame 3 and it has new property "door" set to "true". We will use this property to determine if hero is standing on the door.

The doors use something called "inheritance", which may sound terrible, but is actually a good thing. The "doors" objects are all created using "Doors" template and all the tiles containing doors inherit all the properties of "door" object, for example they all are walkable and show frame 3.

Every door we crate must have following information: what number of map to show next, what is the new x and y position of our character. If you dont move the character to new position, then tiles will be changed, but hero stays at the same spot and this doesnt look correct. Word of caution about new coordinates for the hero. You should avoid placing hero in the next map also on the door tile as if he just stepped in from the wall. If new x/y position is also door, then as soon player moves, this next door in new map is detected and hero is sent back. Remember, place your hero next to door tile in new map!

When new door object is made, we pass 3 variables to it: newmap, newcharx, newchary. And new door object will have those values attached to its properties. So, when number 2 is set in the map array, we know its going to be made from Tile2 template and since Tile2 objects are created from Doors templates, it will have all the properties of Doors object. Tile2 object passes newmap=2 to the Doors template, so all the Tile2 objects will send hero to the map2. You can have more then 1 similar door in the game. You may want to put Tile2 type doors in several maps, and they all send hero to the map2.

## MORE ACTIONS

In the moveChar function add this code to the end, just before returning true:

```
if (game["t_" + ob.ytile + "_" + ob.xtile].door and ob == _root.char)
{
	changeMap(ob);
}
```
Here after we have moved the char (or some other moving object) we will check if the tile char is standing now, is door. As we dont want map to change when bullet or enemy steps on the door tile, we will also check if current object is the hero. We will use changeMap function for the map change:

```
function changeMap(ob)
{
	var name = "t_" + ob.ytile + "_" + ob.xtile;
	game.currentMap = game[name].newMap;
	ob.ytile = game[name].newchary;
	ob.xtile = game[name].newcharx;
	ob.frame = ob.clip._currentframe;
	buildMap(_root["myMap" + game.currentMap]);
}
```
This code should be pretty obvious, get the values from the door tile and update variables of currentMap, ytile and xtile. The new property ob.frame will save current direction of the hero. Without this trick, our hero would start in frame1 every time he enters new map. You would also need to add line in the buildMap function after you have placed the char clip:

```
char.clip.gotoAndStop(char.frame);
```
Thats it, make some maps and play with doors.
