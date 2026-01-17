import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth')({
  beforeLoad: ({
    context: {
      auth: { isAuthenticated },
    },
  }) => {
    if (isAuthenticated) {
      throw redirect({
        to: '/app',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="flex h-screen w-screen items-center justify-center">
      <Outlet />
    </main>
  )
}
