import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAppForm } from '@/hooks/demo.form'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/register')({
  component: RouteComponent,
})

function RouteComponent() {
  const { handleSubmit, AppField, SubscribeButton, AppForm } = useAppForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    onSubmit: () => {},
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
        <form onSubmit={handleSubmit} className="space-y-3">
          <AppField name="name">
            {({ TextField }) => {
              return (
                <TextField label="Full Name" placeholder="Enter full name" />
              )
            }}
          </AppField>
          <AppField name="email">
            {({ TextField }) => {
              return <TextField label="Email" placeholder="Enter email" />
            }}
          </AppField>
          <AppField name="password">
            {({ TextField }) => {
              return <TextField label="Password" placeholder="Enter password" />
            }}
          </AppField>
          <AppForm>
            <SubscribeButton label="Register" />
          </AppForm>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 items-start text-muted-foreground">
        <div className="flex items-center justify-center gap-2 w-full">
          <span className="h-[0.1px] flex w-full bg-border"></span>
          <p className="text-xs flex-1 text-nowrap">OR CONTINUE WITH</p>
          <span className="h-[0.1px] flex w-full bg-border"></span>
        </div>
        <div className="flex items-center gap-4 w-full">
          <Button className="flex-1 w-full" variant={'outline'}>
            <img src="/icons/google.svg" alt="Google" />
            Google
          </Button>
          <Button className="flex-1 w-full" variant={'outline'}>
            <img src="/icons/github.svg" alt="GitHub" />
            Github
          </Button>
        </div>
        <p className="text-sm">
          Already have account{' '}
          <Link to="/auth/login" className="text-primary">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
