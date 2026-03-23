+++
title = "Prologue"
draft = true
slug = "prologue"
weight = 0
+++

## Where this all began

Sometime around [year], I was a [younger developer / student / hobbyist] who stumbled across a set of tutorials on a site called [gotoandplay link]. They were written by a developer named [Tonypa's full name], and they did something I hadn't seen done cleanly before — they explained, step by step, how tile-based games actually worked. Not the theory. The actual code. The actual pixels.

I followed them as far as I could. I got something working. I remember the specific satisfaction of watching a character move around a grid for the first time, collide with a wall, open a door. And then, the way these things go, life moved on. The project sat unfinished. The browser changed, the language changed, and ActionScript 3 quietly became a historical curiosity.

The tutorials stayed with me though.

---

## Twenty years later

I'm a principal engineer now, focused on frontend development and data visualisation. I spend a lot of time thinking about how to render complex things on a screen efficiently and beautifully — which, it turns out, is exactly what tile-based game development teaches you. The rendering pipeline, spatial reasoning, camera systems, performance under pressure. The mental models transfer more directly than you might expect.

A while back I found myself back at [gotoandplay link], reading through those same tutorials. They hold up remarkably well. The teaching instincts are excellent — Tonypa had a gift for building concepts incrementally, each article leaving you with something that ran and felt satisfying before asking you to go further.

But ActionScript 3 is gone. The web has moved on. And I kept thinking: someone should modernise these properly. Port them to JavaScript, to PixiJS, make them accessible to the developers who are stumbling across tile-based game development today the way I did back then.

Eventually I accepted that someone was going to have to be me.

---

## What this series is

This is a full modernisation of Tonypa's tile-based game tutorials, rewritten from the ground up for JavaScript and [PixiJS link]. The teaching structure follows the spirit of the originals — incremental, runnable, satisfying at each step — but the code, the language, and the explanations are entirely new.

The series builds toward a single playable demo called **The Tomb**. You play an archaeologist trapped inside a crumbling dungeon. You collect relics, dodge guards, unlock doors, and try to escape before the tomb collapses. It's not a polished commercial game — it's never meant to be. It's a proof of what you can build by following this series from start to finish, and it uses every technique we cover along the way.

By the end you won't just have a game. You'll have a working understanding of how tile-based worlds are constructed — knowledge that applies well beyond game development into any domain where you need to render, navigate, and reason about a structured two-dimensional space.

---

## A note on the originals

These tutorials were inspired by and built directly upon the work of [Tonypa's full name], originally published on [gotoandplay link] in the early 2000s. I've done my best to track him down to say this in person and haven't been able to — if you know him, please pass it on.

The original tutorials are still available at [gotoandplay link] and I'd encourage you to read them. Seeing where this all came from puts the modernisation in context, and there's something quietly remarkable about code pedagogy that remains worth reading two decades after it was written.

If these tutorials spark something in you the way his sparked something in me, go and read the originals.

---

## Who this is for

You don't need game development experience to follow this series. You need a working knowledge of JavaScript — if you're comfortable with functions, arrays, and objects you have enough to begin. We start with a crash course in the fundamentals before we touch a single tile.

If you're a younger developer just getting into creative coding, welcome. If you're an experienced engineer who wants to understand how this kind of rendering works under the hood, welcome too. The series is written to be useful to both.

---

*Let's build something.*