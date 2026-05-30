'use client'
import dynamic from 'next/dynamic'

const DiveMap = dynamic(() => import('./DiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-200 animate-pulse rounded-lg flex items-center justify-center text-gray-500">
      Loading map...
    </div>
  ),
})

export default DiveMap
