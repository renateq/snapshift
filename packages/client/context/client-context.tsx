'use client'

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

declare global {
  interface Console {
    dev: (msg: string) => void
  }
}

console.dev = function (msg: string) {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_CI_TEST === 'true'
  ) {
    console.log('[DEV]', msg)
  }
}

type Status = 'idle' | 'connected' | 'disconnected'

type FileMeta = {
  mime: string
}

type Message =
  | { type: 'connected' | 'disconnected' }
  | { type: 'registered'; id: string }
  | { type: 'fileMeta'; fileMeta: FileMeta }

type ClientContextType = {
  status: Status
  socketId: string | null
  sharedFiles: File[]
  connect: (peerId: string) => void
  sendFiles: (files: File[]) => void
}

const ClientContext = createContext<ClientContextType>({
  status: 'idle',
  socketId: null,
  sharedFiles: [],
  connect: () => {},
  sendFiles: () => {},
})

export const useClientContext = () => useContext(ClientContext)

export function ClientContextProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('idle')
  const [socketId, setSocketId] = useState<string | null>(null)
  const [sharedFiles, setSharedFiles] = useState<File[]>([])

  const socketRef = useRef<WebSocket | null>(null)
  const peerIdRef = useRef<string | null>(null)
  const nextFileMeta = useRef<FileMeta | null>(null)
  const isInitiatorRef = useRef(false)

  useEffect(() => {
    const socket = new WebSocket(
      process.env.NEXT_PUBLIC_WEB_SOCKET_SERVER || 'ws://localhost:3001/ws',
    )
    socketRef.current = socket

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'register' }))
    }

    const handleMessage = async (event: MessageEvent) => {
      if (typeof event.data === 'string') {
        const msg: Message = JSON.parse(event.data)

        switch (msg.type) {
          case 'registered':
            console.dev('registered')
            setSocketId(msg.id)
            break
          case 'connected':
            console.dev('connected')
            setStatus('connected')
            break
          case 'disconnected':
            console.dev('disconnected')
            setStatus('disconnected')
            break

          default:
            break
        }
      } else if (event.data instanceof Blob) {
        const buffer = await event.data.arrayBuffer()
        const view = new DataView(buffer)

        // Read first 4 bytes = JSON header length
        const metaLength = view.getUint32(0, true)
        const metaBytes = new Uint8Array(buffer, 4, metaLength)
        const metaStr = new TextDecoder().decode(metaBytes)
        const meta = JSON.parse(metaStr)

        // Remaining bytes = file content
        const fileBytes = buffer.slice(4 + metaLength)
        const blob = new Blob([fileBytes], { type: meta.mime })

        const file = new File([blob], `snapshift-${sharedFiles.length + 1}`, {
          type: meta.mime,
          lastModified: Date.now(),
        })

        console.dev('new file: ' + file.type)

        setSharedFiles((prev) => [...prev, file])
      }
    }

    socket.addEventListener('message', handleMessage)

    return () => {
      socket.removeEventListener('message', handleMessage)
      socket.close()
    }
  }, [])

  function connect(peerId: string) {
    peerIdRef.current = peerId
    isInitiatorRef.current = true
    socketRef.current?.send(
      JSON.stringify({ type: 'connect', id: peerIdRef.current }),
    )
  }

  function sendFiles(files: File[]) {
    console.dev(`sending ${files.length} image(s)`)
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn('Socket not open')
      return
    }

    files.forEach(async (file) => {
      const meta = { mime: file.type }
      const metaStr = JSON.stringify(meta)
      const metaBytes = new TextEncoder().encode(metaStr)
      const metaLength = new Uint32Array([metaBytes.length]) // 4 bytes for length

      const fileBuffer = await file.arrayBuffer()

      // combine: [metaLength (4 bytes)] + [metaBytes] + [fileBuffer]
      const payload = new Uint8Array(
        4 + metaBytes.length + fileBuffer.byteLength,
      )
      payload.set(new Uint8Array(metaLength.buffer), 0)
      payload.set(metaBytes, 4)
      payload.set(new Uint8Array(fileBuffer), 4 + metaBytes.length)

      socketRef.current?.send(payload)
    })
  }

  return (
    <ClientContext.Provider
      value={{ status, socketId, sharedFiles, connect, sendFiles }}
    >
      {children}
    </ClientContext.Provider>
  )
}
