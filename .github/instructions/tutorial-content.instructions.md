---
description: "Use when writing game development tutorials, creating JS/TS/PixiJS educational content, designing learning experiences for young adults, structuring programming lessons, improving tutorial engagement"
applyTo: "content/tutorial/**/*.md"
---

# Game Development Tutorial Guidelines

## Target Audience: Young Adults (18-25) Learning Game Programming

### Tone & Voice
- **Enthusiastic and encouraging**: "You're about to create something amazing!"
- **Conversational**: Use "you" and "we", avoid academic language
- **Confident**: Assume they can succeed, provide support when needed
- **Game-focused**: Connect everything back to actual game features

### Content Structure
- **Hook first**: Start with what they'll build, not theory
- **Progressive complexity**: Each section builds on previous knowledge
- **Immediate feedback**: Code examples they can test right away
- **Clear wins**: Celebrate small achievements along the way

### Code Examples
- **Game-relevant**: Use game entities (Player, Enemy, PowerUp) not abstract data
- **Modern syntax**: ES6+, prefer `const`/`let` over `var`
- **Copy-paste ready**: Complete, runnable examples
- **Commented wisely**: Explain the "why", not just the "what"

```js
// Good: Game-focused example
const player = {
  x: 100,
  y: 200,
  health: 100,
  sprite: "hero.png"
}

// Avoid: Abstract examples
const person = {
  name: "John",
  age: 25
}
```

### Technical Standards
- **JavaScript/TypeScript**: Use modern features, explain browser compatibility when relevant
- **PixiJS**: Follow current version best practices
- **Performance**: Mention optimization when introducing expensive operations
- **Error handling**: Show graceful failure patterns

### Learning Design
- **Prerequisites**: State what they need to know upfront
- **Learning objectives**: What will they accomplish?
- **Practice opportunities**: Challenges that reinforce concepts
- **Troubleshooting**: Common issues and solutions

### Formatting
- **Scannable**: Use headers, bullet points, code blocks generously
- **Interactive**: Include console examples they can try
- **Visual breaks**: Don't overwhelm with text walls
- **Navigation**: Clear next/previous connections

### Game Development Focus Areas
- **Tile-based systems**: Grid logic, map representation, collision detection
- **PixiJS rendering**: Sprites, containers, efficient drawing
- **Game physics**: Movement, collision, gravity, platforms
- **Performance**: Memory management, object pooling, efficient updates
- **Particle effects**: Visual polish and feedback

### Engagement Techniques
- Start sections with "Let's build..." or "Time to add..."
- Use gaming terminology naturally (spawn, respawn, powerup, boss fight)
- Reference popular games when explaining concepts
- Show before/after code improvements
- Celebrate working features: "Boom! Your character can now jump!"

### Common Improvements Needed
- Replace abstract examples with game examples
- Add more "you" statements and direct address
- Break up long paragraphs with subheadings
- Include runnable code snippets
- Add encouraging transitions between sections
- Connect each concept to actual game features