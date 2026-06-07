---
title: Motion
slug: motion
source: Fundamentals of Physics
chapter: 2
summary: How do we describe exactly where something is, how fast it's moving, and how that's changing?
status: draft
figures:
  fig-1:
    caption: "A zooming-out sequence: person on a chair → building → Earth spinning → Solar System orbiting → Galaxy moving. Everything is in motion."
    alt: "Zoom out from a person on a chair to the entire galaxy, showing everything is in motion."
    image: null
  fig-2:
    caption: "Chaotic 3D motion and spinning objects collapse into a single dot sliding along a horizontal line — the particle model."
    alt: "Complex 3D motion reduced to a point particle on a straight line."
    image: null
  fig-3:
    caption: "A number line with a dot sitting at x = +5 m. The dot slides left to x = −5 m. The sign changes; an arrow shows direction."
    alt: "A dot moving from positive to negative position on a number line, with direction shown by sign."
    image: null
  fig-4:
    caption: "A dot starts at x = 5 m, shoots right to x = 200 m, then returns to x = 5 m. A distance counter ticks up to 390 m. Displacement shown: 5 − 5 = 0."
    alt: "A particle travels 390 meters but ends where it started, making displacement zero."
    image: null
  fig-5:
    caption: "Side-by-side: the full winding path labeled 'distance' on the left; a straight arrow from start to finish labeled 'displacement' on the right. Formulas below each."
    alt: "Comparison of distance as total path versus displacement as straight-line start to finish."
    image: null
  fig-6:
    caption: "An x-vs-t graph with two points connected by a straight line. Slope labeled: rise/run = Δx/Δt = average velocity. Animate the line tilting steeper (faster) and flatter (slower)."
    alt: "Position-time graph showing average velocity as the slope of a secant line."
    image: null
  fig-7:
    caption: "On an x-vs-t graph, two points inch closer together. The secant line between them becomes the tangent at one point — instantaneous velocity."
    alt: "The limit definition of instantaneous velocity as the tangent to a position-time curve."
    image: null
  fig-8:
    caption: "An elevator moving up: x-vs-t curve on top, v-vs-t graph below. Where the position curve flattens, the velocity graph crosses zero."
    alt: "Position and velocity graphs for an elevator, showing how the slope of position gives velocity."
    image: null
  fig-9:
    caption: "A car on a road. A top arrow shows velocity direction; a bottom arrow shows acceleration direction. Two cases: arrows same way (speeding up) and opposite ways (slowing down)."
    alt: "Car diagram with velocity and acceleration arrows, showing same-sign versus opposite-sign cases."
    image: null
  fig-10:
    caption: "Three stacked graphs: position on top, velocity in the middle, acceleration at the bottom. Arrows between each layer: 'slope of this → value here.'"
    alt: "The kinematic chain: position, velocity, and acceleration graphs, each the derivative of the one above."
    image: null
  fig-11:
    caption: "Five kinematic equations appearing one at a time, each labeled with the variable it omits: 'no displacement,' 'no final velocity,' etc."
    alt: "The five constant-acceleration kinematic equations, each labeled by the quantity it leaves out."
    image: null
  fig-12:
    caption: "A toolkit with five slots: x, v₀, v, a, t. Three slots are filled in. Two show question marks. Arrow: 'pick the right equation → solve.'"
    alt: "Kinematic toolkit showing three knowns and two unknowns, ready to be solved."
    image: null
  fig-13:
    caption: "A feather and an apple falling together in a vacuum, shown stroboscopic-style at equal time intervals. The growing gaps between frames show acceleration. Both fall at the same rate."
    alt: "Feather and apple in free fall shown at equal time intervals, falling together despite different masses."
    image: null
  fig-14:
    caption: "A ball thrown upward: velocity arrow shrinks to zero at the peak, then grows downward on the way down. The acceleration arrow always points down, unchanged the whole time."
    alt: "Ball thrown upward with velocity decreasing to zero at peak and reversing, while acceleration remains constant downward."
    image: null
  fig-15:
    caption: "Three stacked graphs for a ball thrown up and caught: parabolic position curve, straight velocity line crossing zero at the peak, flat horizontal acceleration at −9.8 m/s²."
    alt: "Position, velocity, and acceleration graphs for a ball thrown upward and caught."
    image: null
  fig-16:
    caption: "The chain x → v → a with derivative arrows pointing right and integral arrows pointing left."
    alt: "The mathematical chain connecting position, velocity, and acceleration through differentiation and integration."
    image: null
---

Everything moves.

You're on a chair right now, but that chair is on a planet spinning at 1,600 km/h, orbiting a star at 107,000 km/h, which is itself flying around a galaxy. There's no such thing as truly sitting still.

So if motion is everywhere, how do we actually *describe* it? Not just say "it's moving," but pin it down precisely enough that we can predict where something will be, and when?

That's what this chapter is about. We're going to build the language of motion from scratch, one concept at a time.

[VISUAL: fig-1]

## One axis, one object

Here's the thing about the universe: it's complicated. Objects tumble, spin, move in curves, bounce in three dimensions.

So we start with the simplest possible case: motion along a **straight line**. One direction. Like a car on a highway, or a ball thrown straight up.

And we treat the moving object as a **particle** — a mathematical point. We don't care if it's spinning or wobbling. We just care where it is.

[VISUAL: fig-2]

Now, to say where our particle is, we need a reference. We draw an axis — call it the x-axis — pick a point called the origin (zero), and use positive and negative numbers to say which side of that origin the particle is on.

If the particle is at x = +5 meters, it's 5 meters to the right of the origin. At x = −5 meters, it's the same distance but to the left. The sign tells us direction.

[VISUAL: fig-3]

Simple. But that's position. Now let's talk about *change*.

## Displacement vs. distance

Here's a trap. Most people think "how far did it move?" and "what's its displacement?" are the same question. They're not.

**Distance** is the total ground covered: every meter you actually travel, regardless of direction.

**Displacement** is the difference between where you ended up and where you started. Mathematically: final position minus initial position.

[VISUAL: fig-4]

The particle traveled 390 meters, but its displacement was zero, because it ended exactly where it began.

This isn't a trick. Displacement genuinely doesn't care about the path. It only cares about start and finish. And that's actually *useful* — because in physics, where you end up relative to where you started is often what matters most.

[PAUSE]

## Average velocity vs. average speed

Okay, so now we're moving. How fast?

Here are two answers to "how fast," and they mean different things.

**Average speed** is total distance divided by total time. It's always positive, and it doesn't care about direction.

**Average velocity** is displacement divided by time. And because displacement has a direction built into it — positive or negative — velocity does too.

[VISUAL: fig-5]

The textbook uses a great example: imagine you drive 8.4 km to a gas station, then walk 2 km further when your truck breaks down. Your average speed counts every kilometer walked and driven. But your average velocity only cares that you ended up 10.4 km from where you started, divided by the total time. Those two numbers can be very different — especially if you backtrack.

Here's the really elegant part: if you draw a graph of position on the y-axis and time on the x-axis, **average velocity is just the slope of the straight line connecting two points on that graph**.

[VISUAL: fig-6]

Steeper slope means higher velocity. Negative slope means moving in the negative direction. A flat line means not moving at all.

## Instantaneous velocity

Average velocity tells you about a whole interval. But what about speed at a *single instant*?

Your car's speedometer doesn't show your average speed from home. It shows what you're doing right now, at this exact moment.

That's **instantaneous velocity**. And to get it mathematically, you take the average velocity over an interval and then shrink that interval down to zero.

[VISUAL: fig-7]

In calculus, this is the derivative — the rate of change of position with respect to time. If you know position as a function of time, you differentiate it to get velocity.

The key intuition, no calculus required: **instantaneous velocity is the slope of the curve at a single point**. It's the steepness of the graph right at that moment.

And **speed** is just the magnitude of that — velocity without the direction. Your speedometer shows speed. It can't tell you if you're going north or south.

[VISUAL: fig-8]

## Acceleration

So velocity is how fast position is changing. What about how fast *velocity* is changing?

That's **acceleration**.

When you press the gas pedal, your velocity increases. That's positive acceleration. When you brake, your velocity decreases. But here's where people get confused: the sign of acceleration depends on direction, not just whether you're speeding up or slowing down.

[VISUAL: fig-9]

Here's the rule:

- If velocity and acceleration have the **same sign**, the object is speeding up.
- If they have **opposite signs**, the object is slowing down.

So a car going in the negative direction that's also decelerating actually has a *positive* acceleration — because the acceleration opposes its negative velocity. Sign equals direction. Always.

And just like velocity was the slope of the position graph, **acceleration is the slope of the velocity graph**.

[VISUAL: fig-10]

Three graphs, stacked. Each one is the derivative of the one above it. This is the whole kinematic chain.

[PAUSE]

## Constant acceleration

In a lot of real-world situations, acceleration is roughly *constant* — a car pulling away from a light, a ball in flight, anything under gravity. And for constant acceleration, we can write down exact equations that connect position, velocity, acceleration, and time.

[VISUAL: fig-11]

There are five of them, but here's the secret: you only really need two. The rest are combinations of those two. The textbook says this directly: learn the first two, and you can always derive the others by solving simultaneously.

Think of them as a toolkit. Given any three of the five quantities — position, initial velocity, final velocity, acceleration, time — you can always find the other two.

[VISUAL: fig-12]

## Free fall

The most famous example of constant acceleration? Gravity.

Drop a feather and an apple in a vacuum — no air resistance — and they fall at exactly the same rate. Not because they're the same size or weight, but because gravity accelerates every object identically: 9.8 meters per second squared, downward.

[VISUAL: fig-13]

This surprised people for centuries. Heavier things *feel* like they should fall faster. But that's air resistance doing the work, not gravity.

Near Earth's surface, every freely falling object — thrown up, thrown down, or just dropped — has the same downward acceleration of 9.8 m/s².

Here's the subtle part: even when you throw something *upward*, gravity is still pulling it *downward* the entire time. So as it rises, it slows down. At the very top, its velocity hits zero — just for an instant. Then it comes back down, speeding up again.

[VISUAL: fig-14]

At the highest point, velocity is zero but acceleration is not. The ball isn't resting — it's in mid-transition, still being pulled toward Earth.

[PAUSE]

## Reading the graphs

Before we wrap up, let's tie it together visually. These three graphs — position vs. time, velocity vs. time, acceleration vs. time — are the full picture of any motion.

[VISUAL: fig-15]

On the **position graph**: the curve rises then falls. The slope starts steep and positive, flattens to zero at the peak, then becomes steep and negative.

On the **velocity graph**: a straight line falling from positive to negative, because acceleration is constant. It crosses zero exactly at the peak.

On the **acceleration graph**: a flat horizontal line below zero — constant at −9.8 m/s² the whole time, even at the top.

Three graphs. One story. If you can read these, you can understand any one-dimensional motion problem.

## The chain

So here's what we built today, from scratch.

Position tells you *where*. Displacement tells you *how far from start to finish*. Velocity tells you *how fast and in what direction*. Acceleration tells you *how that velocity is changing*.

And every one of these is connected: velocity is how position changes over time; acceleration is how velocity changes over time. They're a chain. Differentiate down, integrate up.

[VISUAL: fig-16]

Next chapter, we break out of one dimension and start moving in two. Things get a lot more interesting, and vectors become your best friend.
