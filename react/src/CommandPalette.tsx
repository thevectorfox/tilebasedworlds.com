import { useEffect, useState } from 'react'
import {
  KBarProvider, KBarPortal, KBarPositioner,
  KBarAnimator, KBarSearch, KBarResults, useMatches, useRegisterActions,
  useKBar, type Action,
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
            {item.shortcut && (
              <>
                &nbsp; <span className='kbd'>{item.shortcut}</span>
              </>
            )}
          </div>
        )
      }
    />
  )
}

// Exposes query.toggle() on window so native JS can open/close kbar
function KBarBridge() {
  const { query } = useKBar()
  useEffect(() => {
    (window as any).__kbarToggle = () => query.toggle()
    return () => { delete (window as any).__kbarToggle }
  }, [query])
  return null
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

function applyTheme(t: string) {
  document.documentElement.setAttribute('data-theme', t)
  localStorage.setItem('theme', t)
}

function applyPrimary(p: string) {
  document.documentElement.setAttribute('data-primary', p)
  localStorage.setItem('primary', p)
}

const staticActions: Action[] = [
  // ── Navigation ──────────────────────────────────────────────
  {
    id: 'home',
    name: 'Home',
    shortcut: ['h'],
    keywords: 'home start',
    perform: () => { window.location.href = '/' },
    section: 'Navigation',
  },
  {
    id: 'tutorials',
    name: 'Tutorials',
    shortcut: ['t'],
    keywords: 'tutorials guides',
    perform: () => { window.location.href = '/tutorial' },
    section: 'Navigation',
  },

  // ── Theme ────────────────────────────────────────────────────
  {
    id: 'theme-light',
    name: 'Light Mode',
    shortcut: ['l'],
    keywords: 'theme light bright day',
    perform: () => applyTheme('light'),
    section: 'Theme',
  },
  {
    id: 'theme-dark',
    name: 'Dark Mode',
    shortcut: ['d'],
    keywords: 'theme dark night dim',
    perform: () => applyTheme('dark'),
    section: 'Theme',
  },
  {
    id: 'theme-retro',
    name: '🕹️ Unlock Arcade Mode',
    keywords: 'theme retro arcade green neon terminal pixel',
    perform: () => applyTheme('retro'),
    section: 'Theme',
  },

  // ── Colour ───────────────────────────────────────────────────
  {
    id: 'primary-purple',
    name: 'Purple',
    shortcut: ['p'],
    keywords: 'colour color purple violet indigo',
    perform: () => applyPrimary('purple'),
    section: 'Colour',
  },
  {
    id: 'primary-orange',
    name: 'Orange',
    shortcut: ['o'],
    keywords: 'colour color orange warm amber',
    perform: () => applyPrimary('orange'),
    section: 'Colour',
  },
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
      <KBarBridge />
    </KBarProvider>
  )
}
