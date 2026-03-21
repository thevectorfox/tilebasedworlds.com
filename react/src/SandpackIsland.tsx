import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from '@codesandbox/sandpack-react'
import { useState, useEffect } from 'react'

interface Props {
  code: string
  title?: string
}

export function SandpackIsland({ code, title }: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showStatus, setShowStatus] = useState(false)
  const [statusText, setStatusText] = useState('')

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'pixidemo-status') {
        setStatusText(e.data.text)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const buttonStyle = {
    background: '#2c3e50',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: '0.8rem'
  }

  return (
    <div
      style={{
        margin: '2rem 0',
        ...(isFullscreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: '#1e1e1e',
          margin: 0,
          padding: '1rem'
        })
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.5rem'
      }}>
        {title && <p style={{ fontFamily: 'monospace', opacity: 0.6, margin: 0 }}>{title}</p>}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setShowStatus(s => !s)} style={buttonStyle}>
            {showStatus ? '◉ Hide Status' : '◎ Show Status'}
          </button>
          <button onClick={() => setIsFullscreen(f => !f)} style={buttonStyle}>
            {isFullscreen ? '⚏ Exit Fullscreen' : '⛶ Fullscreen'}
          </button>
        </div>
      </div>
      <SandpackProvider
        template="vanilla"
        files={{ '/index.js': code }}
        options={{
          externalResources: ['https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.min.js'],
          recompileMode: 'delayed',
          recompileDelay: 500,
        }}
        theme="dark"
      >
        <SandpackLayout style={{ height: isFullscreen ? 'calc(100vh - 4rem)' : '400px' }}>
          <SandpackCodeEditor />
          <SandpackPreview showOpenInCodeSandbox={false} />
        </SandpackLayout>
      </SandpackProvider>
      {showStatus && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.5rem 1rem',
          background: '#0d1117',
          border: '1px solid #2c3e50',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          color: '#00ff41',
          minHeight: '2rem',
        }}>
          {statusText || '— no status —'}
        </div>
      )}
    </div>
  )
}
