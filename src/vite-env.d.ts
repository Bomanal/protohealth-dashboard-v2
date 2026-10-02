/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Daily room URL opened for "call now" outbound calls. Unset = queue only. */
  /** WebSocket URL of the FlowManager state monitor (default ws://localhost:8765). */
  readonly VITE_MONITOR_WS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
