import { useEffect, useState } from 'react'
import {
  KBarProvider, KBarPortal, KBarPositioner,
  KBarAnimator, KBarSearch, KBarResults, useMatches, useRegisterActions,
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
          <div style={{ padding: '8px 16px', fontSize: 12, opacity: 0.5, color: 'var(--muted)' }}>
            {item}
          </div>
        ) : (
          <div style={{
            padding: '12px 16px',
            background: active ? 'var(--surface-2)' : 'transparent',
            color: 'var(--text)',
            cursor: 'pointer',
          }}>
            {item.name}
          </div>
        )
      }
    />
  )
}

function DynamicActions() {
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
          section: 'Tutorials',
        }))
        setNavActions(actions)
      })
  }, [])

  useRegisterActions(navActions, [navActions])
  return null
}

const staticActions: Action[] = [
  {
    id: 'home',
    name: 'Home',
    shortcut: ['g', 'h'],
    keywords: 'home start',
    perform: () => { window.location.href = '/' },
    section: 'Navigation',
  },
  // {
  //   id: 'theme-dark',
  //   name: 'Dark Mode',
  //   keywords: 'theme dark',
  //   perform: () => document.documentElement.classList.add('dark'),
  //   section: 'Preferences',
  // },
]

export function CommandPalette() {
  return (
    <KBarProvider actions={staticActions}>
      <KBarPortal>
        <KBarPositioner style={{ zIndex: 9999, background: 'rgba(0,0,0,0.6)' }}>
          <KBarAnimator style={{
            width: 600,
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-content)',
          }}>
            <KBarSearch style={{
              width: '100%', padding: '16px 20px',
              fontSize: 16, background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border)',
              outline: 'none', color: 'var(--text)',
              boxShadow: 'none',
              WebkitAppearance: 'none',
              appearance: 'none',
            }} />
            <Results />
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      <DynamicActions />
    </KBarProvider>
  )
}
