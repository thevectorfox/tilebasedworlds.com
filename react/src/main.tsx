import { createRoot } from 'react-dom/client'
import { CommandPalette } from './CommandPalette'
import { SandpackIsland } from './SandpackIsland'

// --- Mount kbar (always present) ---
const kbarRoot = document.getElementById('kbar-root')
if (kbarRoot) {
  createRoot(kbarRoot).render(<CommandPalette />)
}

// --- Mount Sandpack islands (lazy, IntersectionObserver) ---
// Hugo shortcode drops <div data-sandpack> markers into the page.
// React picks them up here and hydrates them only when near viewport.

const mountSandpack = (el: Element) => {
  // getAttribute already HTML-decodes entity references from the Hugo template
  const code = el.getAttribute('data-code') ?? ''
  const title = el.getAttribute('data-title') ?? undefined
  createRoot(el).render(<SandpackIsland code={code} title={title} />)
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      mountSandpack(entry.target)
      observer.unobserve(entry.target)
    }
  })
}, { rootMargin: '200px' })

document.querySelectorAll('[data-sandpack]')
  .forEach(el => observer.observe(el))
