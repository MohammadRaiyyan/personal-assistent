import Header from '@/components/features/common/header'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/app')({
  beforeLoad: ({
    context: {
      auth: { isAuthenticated, session },
    },
    location,
  }) => {
    if (!isAuthenticated) {
      throw redirect({
        to: '/auth/login',
        search: {
          redirectTo: location.pathname,
        },
      })
    }
  },
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
