import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthContext } from '@/context/auth-context'
import { industries } from '@/constants/onboarding'
import { useAppForm } from '@/hooks/demo.form'
import { api } from '@/lib/api'
import { onboardingSchema } from '@/schema/onboarding'
import type { UserProfile } from '../../../../../shared/types/api'
import { revalidateLogic } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { LogOut, User } from 'lucide-react'
import { toast } from 'sonner'
import type z from 'zod'

const appRoute = getRouteApi('/app')

export default function Settings() {
  const { session, logout } = useAuthContext()
  const { profile } = appRoute.useRouteContext() as { profile: UserProfile | null }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  const { mutateAsync: saveProfile, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof onboardingSchema>) =>
      api.post('/api/user/profile', data),
  })

  // Parse stored industry back into industry + subIndustry
  const [storedIndustry, ...subParts] = (profile?.industry ?? '').split('-')
  const storedSub = subParts.join('-').replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const form = useAppForm({
    defaultValues: {
      industry: storedIndustry ?? '',
      subIndustry: storedSub ?? '',
      experience: String(profile?.experience ?? ''),
      skills: profile?.skills?.join(', ') ?? '',
      bio: profile?.bio ?? '',
      country: profile?.country ?? '',
    },
    validationLogic: revalidateLogic({ mode: 'change' }),
    validators: { onDynamic: onboardingSchema, onSubmit: onboardingSchema },
    onSubmit: async (values) => {
      const formattedIndustry = `${values.value.industry}-${values.value.subIndustry
        .toLowerCase().replace(/ /g, '-')}`
      const payload = onboardingSchema.parse({ ...values.value, industry: formattedIndustry })
      await saveProfile(payload)
        .then(() => {
          toast.success('Profile updated')
        })
        .catch(() => toast.error('Failed to update profile'))
    },
  })

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-10">
      <h1 className="text-3xl font-bold gradient-title">Settings</h1>

      {/* Account info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" /> Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><span className="text-muted-foreground">Name: </span>{session?.user.name}</p>
          <p><span className="text-muted-foreground">Email: </span>{session?.user.email}</p>
        </CardContent>
      </Card>

      {/* Profile form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}
            className="space-y-4"
          >
            <form.AppField
              name="industry"
              listeners={{ onChange: () => form.setFieldValue('subIndustry', '') }}
            >
              {({ Select }) => (
                <Select
                  label="Industry"
                  placeholder="Select industry"
                  values={industries.map((ind) => ({ label: ind.name, value: ind.id }))}
                />
              )}
            </form.AppField>

            <form.Subscribe
              selector={({ values }) => {
                const industry = industries.find((ind) => ind.id === values.industry)
                return industry
                  ? industry.subIndustries.map((s) => ({ label: s, value: s }))
                  : []
              }}
            >
              {(subIndustries) =>
                subIndustries.length > 0 ? (
                  <form.AppField name="subIndustry">
                    {({ Select }) => (
                      <Select
                        label="Specialization"
                        placeholder="Select specialization"
                        values={subIndustries}
                      />
                    )}
                  </form.AppField>
                ) : null
              }
            </form.Subscribe>

            <form.AppField name="experience">
              {({ TextField }) => (
                <TextField label="Years of Experience" type="number" min="0" max="50" placeholder="e.g. 4" />
              )}
            </form.AppField>

            <form.AppField name="skills">
              {({ TextField }) => (
                <TextField label="Skills" type="text" placeholder="React, TypeScript, Node.js" />
              )}
            </form.AppField>

            <form.AppField name="country">
              {({ TextField }) => (
                <TextField label="Country / Region" type="text" placeholder="e.g. India" />
              )}
            </form.AppField>

            <form.AppField name="bio">
              {({ TextArea }) => (
                <TextArea label="Professional Bio" rows={4} placeholder="A short professional summary..." />
              )}
            </form.AppField>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardContent className="pt-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Sign out</p>
            <p className="text-xs text-muted-foreground mt-0.5">You will be redirected to the home page.</p>
          </div>
          <Button variant="destructive" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-3.5 w-3.5" /> Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
