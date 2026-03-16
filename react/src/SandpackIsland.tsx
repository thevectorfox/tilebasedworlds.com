import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from '@codesandbox/sandpack-react'
import { useState } from 'react'

interface Props {
  code: string
  title?: string
}

export function SandpackIsland({ code, title }: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
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
        <button
          onClick={toggleFullscreen}
          style={{
            background: '#2c3e50',
            color: '#fff',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: '0.8rem'
          }}
        >
          {isFullscreen ? '⚏ Exit Fullscreen' : '⛶ Fullscreen'}
        </button>
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
    </div>
  )
}
