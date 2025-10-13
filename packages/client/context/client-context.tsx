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

type Message =
  | { type: 'connected' | 'disconnected' }
  | { type: 'registered'; id: string }

type ClientContextType = {
  status: Status
  socketId: string | null
  connect: (peerId: string) => void
}

const ClientContext = createContext<ClientContextType>({
  status: 'idle',
  socketId: null,
  connect: () => {},
})

export const useClientContext = () => useContext(ClientContext)

export function ClientContextProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('idle')
  const [socketId, setSocketId] = useState<string | null>(null)

  const socketRef = useRef<WebSocket | null>(null)
  const peerIdRef = useRef<string | null>(null)
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

  return (
    <ClientContext.Provider value={{ status, socketId, connect }}>
      {children}
    </ClientContext.Provider>
  )
}
