import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { industries } from '@/constants/onboarding'
import { useAppForm } from '@/hooks/demo.form'
import { api } from '@/lib/api'
import { onboardingSchema } from '@/schema/onboarding'
import { revalidateLogic } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { BookOpen, Brain, FileText, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type z from 'zod'

const STEPS = [
  {
    title: 'Your Industry & Role',
    subtitle: 'Used to generate salary benchmarks, hiring trends, and tailor every AI output to your field.',
    hint: 'Be specific — "Frontend Engineering" gives better results than just "Technology".',
    icon: TrendingUp,
    fields: ['industry', 'subIndustry'] as const,
  },
  {
    title: 'Experience & Skills',
    subtitle: 'Calibrates interview difficulty, fills in resume skill sections, and powers skill-gap analysis.',
    hint: 'List all skills, even ones you\'re learning — the AI uses them to suggest what to study next.',
    icon: Brain,
    fields: ['experience', 'skills', 'country'] as const,
  },
  {
    title: 'Your Professional Story',
    subtitle: 'Your bio is used as the foundation for cover letter intros, resume summaries, and AI coaching feedback.',
    hint: 'Write 3–5 sentences. Include your current role, key strengths, and what kind of work you\'re looking for.',
    icon: FileText,
    fields: ['bio'] as const,
  },
]

const Onboarding = () => {
  const [step, setStep] = useState(0)
  const currentStep = STEPS[step]

  const { mutateAsync: onboard } = useMutation({
    mutationFn: async (data: z.infer<typeof onboardingSchema>) =>
      api.post('/api/user/profile', data),
  })

  const form = useAppForm({
    defaultValues: {
      industry: '',
      subIndustry: '',
      experience: '',
      skills: '',
      bio: '',
      country: '',
    },
    validationLogic: revalidateLogic({ mode: 'change' }),
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
          window.location.href = '/app'
        })
        .catch(() => {
          toast.error('Something went wrong. Please try again.')
        })
    },
  })

  const progress = ((step + 1) / STEPS.length) * 100

  const canAdvance = () => {
    const vals = form.store.state.values
    if (step === 0) return vals.industry && vals.subIndustry
    if (step === 1) return vals.experience && vals.skills && vals.country
    return true
  }

  return (
    <div className="w-full max-w-xl space-y-6">

      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold gradient-title">Set up your profile</h1>
        <p className="text-sm text-muted-foreground">
          2 minutes now · better results everywhere
        </p>
      </div>

      {/* Step indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-1.5" />
        <div className="flex gap-2 justify-center pt-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i <= step ? 'bg-primary w-8' : 'bg-muted w-5'
              }`}
            />
          ))}
        </div>
      </div>

      {/* What this powers */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <currentStep.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">{currentStep.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{currentStep.subtitle}</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader className="pb-0">
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 border-l-2 border-primary/40">
            💡 {currentStep.hint}
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className="space-y-4"
          >
            {/* Step 1 fields */}
            {step === 0 && (
              <>
                <form.AppField
                  name="industry"
                  listeners={{ onChange: () => form.setFieldValue('subIndustry', '') }}
                >
                  {({ Select }) => (
                    <Select
                      label="Industry"
                      placeholder="Select your industry"
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
                            placeholder="Select your specialization"
                            values={subIndustries}
                          />
                        )}
                      </form.AppField>
                    ) : null
                  }
                </form.Subscribe>
              </>
            )}

            {/* Step 2 fields */}
            {step === 1 && (
              <>
                <form.AppField name="experience">
                  {({ TextField }) => (
                    <TextField
                      label="Years of Experience"
                      type="number"
                      min="0"
                      max="50"
                      placeholder="e.g. 4"
                    />
                  )}
                </form.AppField>
                <form.AppField name="skills">
                  {({ TextField }) => (
                    <TextField
                      label="Skills"
                      type="text"
                      placeholder="e.g. React, TypeScript, Node.js, System Design"
                    />
                  )}
                </form.AppField>
                <form.AppField name="country">
                  {({ TextField }) => (
                    <TextField
                      label="Country / Region"
                      type="text"
                      placeholder="e.g. India, United States, Germany"
                    />
                  )}
                </form.AppField>
              </>
            )}

            {/* Step 3 fields */}
            {step === 2 && (
              <>
                <form.AppField name="bio">
                  {({ TextArea }) => (
                    <TextArea
                      label="Professional Bio"
                      rows={6}
                      placeholder="e.g. I'm a full-stack engineer with 4 years of experience building SaaS products at early-stage startups. I specialize in React and Node.js and I'm looking for senior roles at product-led companies..."
                    />
                  )}
                </form.AppField>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Your bio powers:</p>
                  {[
                    { icon: BookOpen, text: 'Cover letter introductions' },
                    { icon: FileText, text: 'Resume professional summaries' },
                    { icon: Brain, text: 'Personalised interview coaching feedback' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="flex gap-2 pt-2">
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((s) => s - 1)}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  className="flex-1"
                  disabled={!canAdvance()}
                  onClick={() => setStep((s) => s + 1)}
                >
                  Continue →
                </Button>
              ) : (
                <form.AppForm>
                  <form.SubscribeButton label="Finish setup →" />
                </form.AppForm>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Onboarding
