import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from '@codesandbox/sandpack-react'

interface Props {
  code: string
  title?: string
}

export function SandpackIsland({ code, title }: Props) {
  return (
    <div style={{ margin: '2rem 0' }}>
      {title && <p style={{ fontFamily: 'monospace', opacity: 0.6 }}>{title}</p>}
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
        <SandpackLayout>
          <SandpackCodeEditor style={{ height: 400 }} />
          <SandpackPreview showOpenInCodeSandbox={false} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}
