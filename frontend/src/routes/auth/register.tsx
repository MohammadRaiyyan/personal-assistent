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
import { createFileRoute, Link } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/auth/register')({
  head: () => ({
    meta: [
      { title: 'Create Account — TrajectAI' },
      { name: 'description', content: 'Create your free TrajectAI account and start building your career with AI.' },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { signup } = useAuthContext()

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
        window.location.href = '/app/onboarding'
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
