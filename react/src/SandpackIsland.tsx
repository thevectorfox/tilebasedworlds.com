import { Sandpack } from '@codesandbox/sandpack-react'

interface Props {
  code: string
  title?: string
}

const htmlEntry = `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.min.js"><\/script>
</head>
<body style="margin:0;background:#1a1a2e;">
  <script src="/index.js"><\/script>
</body>
</html>`

export function SandpackIsland({ code, title }: Props) {
  return (
    <div style={{ margin: '2rem 0' }}>
      {title && <p style={{ fontFamily: 'monospace', opacity: 0.6 }}>{title}</p>}
      <Sandpack
        template="vanilla"
        files={{
          '/index.js': code,
          '/index.html': { code: htmlEntry, hidden: true },
        }}
        options={{
          showNavigator: false,
          showTabs: true,
          editorHeight: 400,
          recompileMode: 'delayed',
          recompileDelay: 500,
        }}
        theme="dark"
      />
    </div>
  )
}
