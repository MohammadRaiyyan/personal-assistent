import Header from '@/components/features/common/header'
import { Spinner } from '@/components/ui/spinner'
import { api } from '@/lib/api'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import type { UserProfile } from '../../../../shared/types/api'

export const Route = createFileRoute('/app')({
  beforeLoad: async ({
    context: { auth: { isAuthenticated } },
    location,
  }) => {
    if (!isAuthenticated) {
      throw redirect({
        to: '/auth/login',
        search: { redirectTo: location.pathname },
      })
    }
    // Profile check runs here — before any child loaders fire —
    // so the insight/resume/etc loaders never run for un-onboarded users.
    try {
      const res = await api.get<UserProfile>('/api/user/profile')
      const profile = res.data ?? null
      if (!profile?.onboarded && location.pathname !== '/app/onboarding') {
        throw redirect({ to: '/app/onboarding' })
      }
      return { profile }
    } catch (e) {
      if ((e as { isRedirect?: boolean })?.isRedirect) throw e
      if ((e as { status?: number })?.status === 401) {
        throw redirect({ to: '/auth/login' })
      }
      // Any other error (500, network) — redirect to onboarding as safe default
      if (location.pathname !== '/app/onboarding') {
        throw redirect({ to: '/app/onboarding' })
      }
      return { profile: null as UserProfile | null }
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
        <div className=" p-4">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
