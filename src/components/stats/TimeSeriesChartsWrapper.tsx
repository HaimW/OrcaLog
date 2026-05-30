import dynamic from 'next/dynamic'

export default dynamic(() => import('./TimeSeriesCharts'), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-200 animate-pulse rounded-lg" />,
})
