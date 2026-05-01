import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from '@codesandbox/sandpack-react'
import type { SandpackThemeProp } from '@codesandbox/sandpack-react'
import { useState, useEffect, useRef, useMemo } from 'react'

interface Props {
  code: string
  title?: string
}

// Green-on-black theme for the retro site mode
const retroTheme: SandpackThemeProp = {
  colors: {
    surface1: '#0a0a0a',
    surface2: '#0d1117',
    surface3: '#141414',
    clickable: '#00ff41',
    base: '#cccccc',
    disabled: '#444444',
    hover: '#39ff14',
    accent: '#00ff41',
    error: '#ff4444',
    errorSurface: '#1a0000',
  },
  syntax: {
    plain: '#00ff41',
    comment: { color: '#4a9e54', fontStyle: 'italic' },
    keyword: '#39ff14',
    tag: '#00ff41',
    punctuation: '#00cc33',
    definition: '#5efb6e',
    property: '#5efb6e',
    static: '#00ff41',
    string: '#00cc33',
  },
  font: {
    body: '"puffin-display-soft", sans-serif',
    mono: '"space-mono", "Monaco", "Consolas", monospace',
    size: '13px',
    lineHeight: '1.6',
  },
}

function getSandpackTheme(siteTheme: string): SandpackThemeProp {
  if (siteTheme === 'retro') return retroTheme
  if (siteTheme === 'dark') return 'dark'
  return 'light'
}

export function SandpackIsland({ code, title }: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showStatus, setShowStatus] = useState(false)
  const [siteTheme, setSiteTheme] = useState(() =>
    typeof document !== 'undefined'
      ? (document.documentElement.dataset.theme ?? 'light')
      : 'light'
  )

  // Status is written directly to the DOM — no React state, no re-render.
  // The game posts at 60fps; going through setState would reset Sandpack every frame.
  const statusRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'pixidemo-status' && statusRef.current) {
        statusRef.current.textContent = e.data.text
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Keep Sandpack theme in sync with the site's theme switcher
  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => {
      setSiteTheme(root.dataset.theme ?? 'light')
    })
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  const layoutHeight = isFullscreen ? 'calc(100vh - 5rem)' : '300px'

  // Stable references so Sandpack never sees new prop objects from unrelated
  // state changes (fullscreen toggle, theme switch, etc.)
  const sandpackFiles   = useMemo(() => ({ '/index.js': code }), [code])
  const sandpackOptions = useMemo(() => ({
    externalResources: ['https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.min.js'],
    recompileMode: 'delayed' as const,
    recompileDelay: 500,
  }), [])
  const sandpackTheme = useMemo(() => getSandpackTheme(siteTheme), [siteTheme])

  return (
    <div className={`sandpack-island${isFullscreen ? ' sandpack-island--fullscreen' : ''}`}>
      <div className="sandpack-island__header">
        {title && <h3 className="sandpack-island__title">{title}</h3>}
        <div className="sandpack-island__controls">
          <button
            className="kbd btn"
            onClick={() => setShowStatus(s => !s)}
          >
            {showStatus ? '◉ hide status' : '◎ status'}
          </button>
          <button
            className="kbd btn"
            onClick={() => setIsFullscreen(f => !f)}
          >
            {isFullscreen ? '⚏ exit' : '⛶ fullscreen'}
          </button>
        </div>
      </div>

      <SandpackProvider
        template="vanilla"
        files={sandpackFiles}
        options={sandpackOptions}
        theme={sandpackTheme}
      >
        <SandpackLayout style={{ height: layoutHeight }}>
          <SandpackCodeEditor />
          <SandpackPreview showOpenInCodeSandbox={false} />
        </SandpackLayout>
      </SandpackProvider>

      {showStatus && (
        <div className="sandpack-island__status" ref={statusRef}>
          — no status —
        </div>
      )}
    </div>
  )
}
