import { Spinner } from '@/components/ui/spinner'

export function RoutePending() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Spinner />
    </div>
  )
}
