import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { industries } from '@/constants/onboarding'
import { useAppForm } from '@/hooks/demo.form'
import { onboardingSchema } from '@/schema/onboarding'
import { revalidateLogic } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import type z from 'zod'

const Onboarding = () => {
  const router = useRouter()

  const { mutateAsync: onboard } = useMutation({
    mutationFn: async (data: z.infer<typeof onboardingSchema>) => {
      // API call to update user profile
    },
  })

  const form = useAppForm({
    defaultValues: {
      industry: '',
      subIndustry: '',
      experience: '',
      skills: '',
      bio: '',
    },
    validationLogic: revalidateLogic({
      mode: 'change',
    }),
    validators: {
      onDynamic: onboardingSchema,
      onSubmit: onboardingSchema,
    },
    onSubmit: async (values) => {
      const formattedIndustry = `${values.value.industry}-${values.value.subIndustry
        .toLowerCase()
        .replace(/ /g, '-')}`
      const payload = onboardingSchema.parse({
        ...values.value,
        industry: formattedIndustry,
      })
      await onboard(payload)
        .then(() => {
          router.navigate({ to: '/app' })
        })
        .catch((error) => {
          console.error('Onboarding error:', error)
        })
    },
  })

  return (
    <Card className="max-w-2xl w-full">
      <CardHeader>
        <CardTitle className="gradient-title text-2xl">
          Complete Your Profile
        </CardTitle>
        <CardDescription>
          Select your industry to get personalized career insights and
          recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-6"
        >
          <form.AppField
            name="industry"
            listeners={{
              onChange: () => {
                form.setFieldValue('subIndustry', '')
              },
            }}
          >
            {({ Select }) => {
              return (
                <Select
                  label="Industry"
                  placeholder="Select industry"
                  values={industries.map((ind) => ({
                    label: ind.name,
                    value: ind.id,
                  }))}
                />
              )
            }}
          </form.AppField>
          <form.Subscribe
            selector={({ values }) => {
              if (values.industry) {
                const industry = industries.find(
                  (ind) => ind.id === values.industry,
                )
                return {
                  showSubIndustry: true,
                  subIndustry: industry
                    ? industry.subIndustries.map((ind) => ({
                        label: ind,
                        value: ind,
                      }))
                    : [],
                }
              }
              return { showSubIndustry: false, subIndustry: [] }
            }}
          >
            {({ showSubIndustry, subIndustry }) => {
              if (!showSubIndustry) return null
              return (
                <form.AppField name="subIndustry">
                  {({ Select }) => {
                    return (
                      <Select
                        placeholder="Select your specialization"
                        values={subIndustry}
                        label="Specialization"
                      />
                    )
                  }}
                </form.AppField>
              )
            }}
          </form.Subscribe>
          <form.AppField name="experience">
            {({ TextField }) => (
              <TextField
                label="Experience"
                type="number"
                min="0"
                max="50"
                placeholder="Enter years of experience"
              />
            )}
          </form.AppField>

          <form.AppField name="skills">
            {({ TextField }) => (
              <TextField
                label="Skills"
                type="text"
                placeholder="e.g., Python, JavaScript, Project Management"
              />
            )}
          </form.AppField>

          <form.AppField name="bio">
            {({ TextArea }) => (
              <TextArea
                label="Bio"
                rows={5}
                placeholder="Tell us about your professional background..."
              />
            )}
          </form.AppField>

          <form.AppForm>
            <form.SubscribeButton label="Submit" />
          </form.AppForm>
        </form>
      </CardContent>
    </Card>
  )
}

export default Onboarding
