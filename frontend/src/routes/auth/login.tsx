import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuthContext } from '@/context/auth-context'
import { useAppForm } from '@/hooks/demo.form'
import { loginSchema } from '@/schema/auth'
import { createFileRoute, Link } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/auth/login')({
  head: () => ({
    meta: [
      { title: 'Login — TrajectAI' },
      { name: 'description', content: 'Sign in to your TrajectAI account to access your career dashboard.' },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { login } = useAuthContext()

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await login(value)
        // Hard redirect so the page starts fresh with the session cookie already
        // set — avoids the flicker caused by router.invalidate() re-running
        // beforeLoad with stale isAuthenticated:false context.
        window.location.href = '/app'
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Login failed')
      }
    },
  })

  return (
    <Card className="max-w-sm w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-medium">Login</CardTitle>
        <CardDescription>Login to access your career dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-3"
        >
          <form.AppField name="email">
            {({ TextField }) => {
              return (
                <TextField label="Email" type="email" placeholder="Enter email" />
              )
            }}
          </form.AppField>
          <form.AppField name="password">
            {({ TextField }) => {
              return (
                <TextField
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                />
              )
            }}
          </form.AppField>
          <form.AppForm>
            <form.SubscribeButton label="Login" />
          </form.AppForm>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 items-start text-muted-foreground">
        <p className="text-sm">
          Don&apos;t have an account?{' '}
          <Link to="/auth/register" className="text-primary">
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
