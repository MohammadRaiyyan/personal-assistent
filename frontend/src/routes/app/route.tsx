import Header from '@/components/features/common/header'
import { Spinner } from '@/components/ui/spinner'
import { api } from '@/lib/api'
import type { UserProfile } from '../../../../shared/types/api'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/app')({
  beforeLoad: ({
    context: {
      auth: { isAuthenticated },
    },
    location,
  }) => {
    if (!isAuthenticated) {
      throw redirect({
        to: '/auth/login',
        search: { redirectTo: location.pathname },
      })
    }
  },
  loaderDeps: () => ({}),
  staleTime: Infinity,
  loader: async ({ location }): Promise<UserProfile | null> => {
    try {
      const res = await api.get<UserProfile>('/api/user/profile')
      const profile = res.data ?? null
      if (!profile?.onboarded && location.pathname !== '/app/onboarding') {
        throw redirect({ to: '/app/onboarding' })
      }
      return profile
    } catch (e) {
      if ((e as { isRedirect?: boolean })?.isRedirect) throw e
      return null
    }
  },
  pendingComponent: () => (
    <div className="flex h-screen w-screen items-center justify-center">
      <Spinner />
    </div>
  ),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="flex h-screen w-screen flex-col">
      <Header />
      <div className=" h-[calc(100vh-3.5rem)] mt-14 overflow-y-auto">
        <div className="container mx-auto p-4">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
