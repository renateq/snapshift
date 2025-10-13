'use client'

import { useClientContext } from '@/context/client-context'
import { useEffect } from 'react'

export default function Phone() {
  const { socketId, status, connect } = useClientContext()

  useEffect(() => {
    if (socketId) {
      const params = new URLSearchParams(window.location.search)
      const id = params.get('id')
      if (id) {
        connect(id)
      }
    }
  }, [socketId, connect])

  return <div>phone - {status}</div>
}
