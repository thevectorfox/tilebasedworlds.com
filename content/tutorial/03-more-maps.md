+++
title = "More Maps"
date = 2026-03-08T23:00:00+11:00
weight = 3
draft = false
tags = ["beginner", "tiles", "tutorial"]
next = "/tutorial/04-rendering-a-map/"
prev = "/tutorial/02-map-format/"
+++

You might wonder, why exactly have I chosen this kind of map format. I can't say this is absolutely best way to go, I can't say this map format creates maps fastest or creates smallest file size. I can only say that after couple years of messing with tile-based games, I have found this format to suit best my needs. But let's look at other possible ways to hold your map data.


## JAILBITCH METHOD

The original OutsideOfSociety tutorials use very simple map format. It's saved same way in two dimensional array and every number gives us frame number to show in that spot. Every time you would need to check if next tile is wall (or something to pick up, or door or almost anything), you would look up the number from map array.

When looking for collision, you determine the section of frames that count as walls (or pick-ups, or doors). For example, you can make up your mind and say, that all the tiles from frame 0 to 100 are walkable tiles, all tiles from 101 to 200 are walls and tiles >200 are special tiles.

When you have few different tile types and tiles won't change much, this is good and easy way.


## TREE IN THE DESERT

Some maps have many different tiles, some have very few. For example, imagine the desert, where for miles and miles there is nothing but sand, if you are lucky, you can see few oases. Or the sea, there is water and water and more water and finally a small island.

If your map is made up of mostly the same kind of tiles (sand) and you have only some small variation (trees), then a two-dimensional array is not a good choice. It will hold too much dead information, and rows of zeros before some other frame shows up. In this case, it might be better to declare all the non-sand objects separately and let everything else be sand.

Let's suppose you have a 100x100 map and you have 3 trees there. You can write:

```
trees = [[23,6], [37,21], [55,345]]
```

When creating the map, you step through the trees array, place the trees and let every other tile show a sand image. That is much simpler than writing down a 100x100 two-dimensional array.

Of course, when you make more objects (trees, bushes, grass, stones, water), this method loses much of its speed and it might become hard to remember what tiles are placed where.

## S, M, XXXL

You may have also heard of XML, a format similar to HTML that allows declaration of many things. You can use XML to hold your map data.

Following XML map explanation is based on the Jobe Makar's book "Macromedia Flash MX Game Design Demystified".

Let's look at the sample map in XML:

```
<map>
	<row>
		<cell type="1">
		<cell type="1">
		<cell type="1">
	</row>
	<row>
		<cell type="1">
		<cell type="4">
		<cell type="1">
	</row>
	<row>
		<cell type="1">
		<cell type="1">
		<cell type="1">
	</row>
</map>
```

Here we have set a 3x3 map. First, there is the header "map". Then 3 "row" nodes are set. Each of them has 3 "cell" nodes.

To load maps from external files, XML might be a good solution as most of XML parsing can be done with Flash MX built-in functions. Loading two-dimensional arrays from text files is not that easy, you always get a string from loading variables and you have to split the string into arrays, which again, is very slow.

You can also see the disadvantages of XML: it leads to much bigger file size and you need Flash 6 player for it.

All the following examples use a two-dimensional array to hold map data and use objects when creating tiles on the screen as explained in the chapter "Map format".

