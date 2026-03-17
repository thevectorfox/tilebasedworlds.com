+++
title = "Crash Course in PixiJS"
date = 2026-03-17T00:00:00+11:00
weight = 1
draft = false
tags = ["beginner", "pixijs", "javascript", "graphics"]
+++

Beginner

If you've been through the JavaScript crash course, you've got the language basics down. Now we need a way to actually draw things on screen. That's where PixiJS comes in. Let's look at what it is, why it's a great fit for tile-based games, and how to get something on screen with just a few lines of code.

## Why PixiJS?

Browsers have a built-in way to draw 2D graphics called the **Canvas API**. You can draw rectangles, images, and paths with it. It works fine for simple stuff, but it runs on the CPU — your computer's main processor — and for games with lots of tiles updating every frame, that becomes slow pretty quickly.

PixiJS sits on top of something called **WebGL**, which hands the drawing work to the GPU (the graphics card). GPUs are purpose-built for this kind of thing — drawing thousands of images and shapes every second. The result is dramatically better performance with much less effort on your part.

There are other 2D WebGL libraries out there, but PixiJS hits a sweet spot:

- **Fast** — GPU-accelerated rendering, built for games and interactive apps
- **Approachable** — a clean, simple API that doesn't require graphics programming knowledge
- **Well maintained** — large community, good documentation, actively developed
- **Browser native** — no install, no build step required to get started

For tile-based games specifically, being able to draw hundreds of tiles per frame without dropping below 60fps is pretty much a requirement. PixiJS makes that easy.

## Creating an Application

The first thing you do with PixiJS is create an `Application`. This sets up the canvas element that gets added to your page, initialises the WebGL renderer, and starts the game loop for you.

```js
const app = new PIXI.Application();

await app.init({
    width: 640,
    height: 480,
    background: '#1a1a2e',
});

document.body.appendChild(app.canvas);
```

A few things to note here:

- `app.init()` is **async** — it returns a promise, so you `await` it before doing anything else. PixiJS v8 initialises asynchronously to handle WebGL setup.
- `width` and `height` set the size of the canvas in pixels.
- `background` is the colour shown when nothing is drawn on top of it. You can use hex colour strings just like in CSS.
- `app.canvas` is the actual `<canvas>` HTML element. You append it to the page yourself, which gives you control over where it sits in your layout.

Once this runs, you'll have a dark blue-ish rectangle on your page. Not very exciting yet, but the renderer is up and running.

## The Stage

Every PixiJS application has a **stage** — `app.stage`. Think of it as the root container that holds everything you want to draw. Anything you add to the stage gets rendered every frame.

Objects you add to the stage are called **display objects**. PixiJS has several types, but the two you'll use most often are:

- `Graphics` — for drawing shapes, lines, and fills with code
- `Sprite` — for displaying images loaded from files

## Drawing with Graphics

`PIXI.Graphics` is your drawing tool for shapes. You describe what you want to draw using a series of method calls — set a fill colour, draw a rectangle, that sort of thing — and PixiJS handles turning that into something the GPU can render.

```js
const box = new PIXI.Graphics();

box.rect(0, 0, 64, 64);
box.fill(0xff6b35);

app.stage.addChild(box);
```

Let's break that down:

- `new PIXI.Graphics()` creates a new, empty graphics object.
- `.rect(x, y, width, height)` describes a rectangle shape starting at position `(0, 0)` with a size of `64x64` pixels.
- `.fill(colour)` fills the shape with a colour. Here `0xff6b35` is a hex colour — the `0x` prefix is JavaScript's way of writing hexadecimal numbers, and `ff6b35` is the colour (an orange).
- `app.stage.addChild(box)` adds the graphics object to the stage so it gets drawn.

Run this and you'll see an orange square in the top-left corner of your canvas.

## Positioning Things

Every display object has `x` and `y` properties that control where it appears on the canvas. The origin `(0, 0)` is the **top-left corner**, with `x` increasing to the right and `y` increasing downward.

```js
box.x = 100;
box.y = 80;
```

You can also set position when building the graphics object by chaining it into the constructor, but setting `x` and `y` directly is the clearest approach when you're starting out.

## A Complete Example

Putting it all together — an application with a couple of coloured boxes:

```js
const app = new PIXI.Application();

await app.init({
    width: 640,
    height: 480,
    background: '#1a1a2e',
});

document.body.appendChild(app.canvas);

// A filled orange square
const box = new PIXI.Graphics();
box.rect(0, 0, 64, 64);
box.fill(0xff6b35);
box.x = 100;
box.y = 100;
app.stage.addChild(box);

// A filled teal square alongside it
const box2 = new PIXI.Graphics();
box2.rect(0, 0, 64, 64);
box2.fill(0x2ec4b6);
box2.x = 200;
box2.y = 100;
app.stage.addChild(box2);
```

Two boxes, sitting side by side on a dark background. This is the foundation — an app, a stage, and display objects added to it. Everything else in tile-based game development builds on exactly this pattern.

## What's Next

From here, the next step is loading images (sprites) and using them instead of drawn shapes — which is what you'll do for tiles. But `Graphics` remains useful for debug visualisation, UI elements, hitboxes, and anything you want to draw procedurally.

The key ideas to take away:

- `PIXI.Application` sets up the renderer and game loop
- `app.stage` is the root container — add things here to draw them
- `PIXI.Graphics` describes shapes with method calls
- Position with `.x` and `.y`, with `(0, 0)` at the top-left
