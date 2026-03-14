import { useEffect, useState } from 'react'
import {
  KBarProvider, KBarPortal, KBarPositioner,
  KBarAnimator, KBarSearch, KBarResults, useMatches,
  type Action,
} from 'kbar'

interface NavItem {
  id: string
  title: string
  url: string
  section: string
  tags: string[] | null
}

function Results() {
  const { results } = useMatches()
  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === 'string' ? (
          <div style={{ padding: '8px 16px', fontSize: 12, opacity: 0.5 }}>
            {item}
          </div>
        ) : (
          <div style={{
            padding: '12px 16px',
            background: active ? '#1a1a2e' : 'transparent',
            cursor: 'pointer',
          }}>
            {item.name}
          </div>
        )
      }
    />
  )
}

export function CommandPalette() {
  const [navActions, setNavActions] = useState<Action[]>([])

  useEffect(() => {
    fetch('/search-index.json')
      .then(r => r.json())
      .then((pages: NavItem[]) => {
        const actions: Action[] = pages.map(p => ({
          id: p.id,
          name: p.title,
          subtitle: p.section,
          keywords: (p.tags ?? []).join(' '),
          perform: () => { window.location.href = p.url },
          section: p.section || 'Pages',
        }))
        setNavActions(actions)
      })
  }, [])

  const staticActions: Action[] = [
    {
      id: 'home',
      name: 'Home',
      shortcut: ['g', 'h'],
      keywords: 'home start',
      perform: () => { window.location.href = '/' },
      section: 'Navigation',
    },
    {
      id: 'theme-dark',
      name: 'Dark Mode',
      keywords: 'theme dark',
      perform: () => document.documentElement.classList.add('dark'),
      section: 'Preferences',
    },
  ]

  return (
    <KBarProvider actions={[...staticActions, ...navActions]}>
      <KBarPortal>
        <KBarPositioner style={{ zIndex: 9999, background: 'rgba(0,0,0,0.6)' }}>
          <KBarAnimator style={{
            width: 600,
            background: '#0d0d1a',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 16px 60px rgba(0,0,0,0.5)',
          }}>
            <KBarSearch style={{
              width: '100%', padding: '16px 20px',
              fontSize: 16, background: 'transparent',
              border: 'none', outline: 'none', color: '#fff',
            }} />
            <Results />
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
    </KBarProvider>
  )
}
