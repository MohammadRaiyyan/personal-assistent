import { Button } from '@/components/ui/button'
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
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const { login, loginWithProvider } = useAuthContext()
  const router = useRouter()

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
        await router.invalidate()
        router.navigate({ to: '/app' })
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
        <div className="flex items-center justify-center gap-2 w-full">
          <span className="h-[0.1px] flex w-full bg-border"></span>
          <p className="text-xs flex-1 text-nowrap">OR CONTINUE WITH</p>
          <span className="h-[0.1px] flex w-full bg-border"></span>
        </div>
        <div className="flex items-center gap-4 w-full">
          <Button
            className="flex-1 w-full"
            variant={'outline'}
            type="button"
            onClick={() => loginWithProvider('google')}
          >
            <img src="/icons/google.svg" alt="Google" />
            Google
          </Button>
          <Button
            className="flex-1 w-full"
            variant={'outline'}
            type="button"
            onClick={() => loginWithProvider('github')}
          >
            <img src="/icons/github.svg" alt="GitHub" />
            Github
          </Button>
        </div>
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
