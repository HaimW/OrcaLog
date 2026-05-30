'use client'
import { useState, useEffect } from 'react'

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="bg-yellow-500 text-yellow-900 text-sm font-medium px-4 py-2 rounded-full shadow-lg">
        You are offline — some features may be unavailable
      </div>
    </div>
  )
}
