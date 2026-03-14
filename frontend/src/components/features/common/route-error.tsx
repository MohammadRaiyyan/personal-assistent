import { Button } from '@/components/ui/button'
import { useRouter } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'

interface RouteErrorProps {
  error: Error
}

export function RouteError({ error }: RouteErrorProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center p-6">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <div>
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {error?.message ?? 'An unexpected error occurred.'}
        </p>
      </div>
      <Button variant="outline" onClick={() => router.invalidate()}>
        Try again
      </Button>
    </div>
  )
}
