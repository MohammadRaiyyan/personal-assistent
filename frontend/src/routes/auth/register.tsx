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
import { signUpSchema } from '@/schema/auth'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/auth/register')({
  component: RouteComponent,
})

function RouteComponent() {
  const { signup, loginWithProvider } = useAuthContext()
  const router = useRouter()

  const form = useAppForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await signup(value)
        await router.invalidate()
        router.navigate({ to: '/app/onboarding' })
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Registration failed')
      }
    },
  })

  return (
    <Card className="max-w-sm w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-medium">Register</CardTitle>
        <CardDescription>
          Provide details to get better career decisions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-3"
        >
          <form.AppField name="name">
            {({ TextField }) => {
              return (
                <TextField
                  label="Full Name"
                  type="text"
                  placeholder="Enter full name"
                />
              )
            }}
          </form.AppField>
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
            <form.SubscribeButton label="Register" />
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
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
