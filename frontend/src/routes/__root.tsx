import { Toaster } from '@/components/ui/sonner'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { HeadContent, Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import type { AuthContextType } from '@/context/auth-context'
import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
  auth: AuthContextType
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { title: 'TrajectAI' },
      { name: 'description', content: 'AI-powered career assistant for resumes, cover letters, and interview prep.' },
      { property: 'og:site_name', content: 'TrajectAI' },
    ],
  }),
  component: () => (
    <>
      <HeadContent />
      <Outlet />
      <Toaster />
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
          TanStackQueryDevtools,
        ]}
      />
    </>
  ),
})
