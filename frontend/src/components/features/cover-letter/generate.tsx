import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAppForm } from '@/hooks/demo.form'
import { createCoverLetter } from '@/lib/coverLetterApi'
import type { CoverLetter } from '../../../../../shared/types/api'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'

export default function Generate() {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (payload: { companyName: string; positionTitle: string; jobDescription: string }) =>
      createCoverLetter(payload),
    onError: (err: Error) => {
      toast.error(err?.message || 'Failed to generate cover letter')
    },
    onSuccess: (res: CoverLetter) => {
      toast.success('Cover letter generated')
      if (res.id) {
        router.navigate({ to: '/app/cover-letters/$id', params: { id: res.id } })
      }
    },
  })

  const form = useAppForm({
    defaultValues: {
      companyName: '',
      jobTitle: '',
      jobDescription: '',
    },
    onSubmit: async ({ value }: { value: { companyName: string; jobTitle: string; jobDescription: string } }) => {
      await mutation.mutateAsync({
        companyName: value.companyName,
        positionTitle: value.jobTitle,
        jobDescription: value.jobDescription,
      })
    },
  })

  return (
    <div className="space-y-4">
      <Card className="max-w-3xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Generate Cover Letter</CardTitle>
          <CardDescription>
            Provide the job details and we'll generate a tailored cover letter
            for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <form.AppField name="companyName">
                {({ TextField }) => (
                  <TextField
                    type="text"
                    label="Company Name"
                    placeholder="Enter company name"
                  />
                )}
              </form.AppField>

              <form.AppField name="jobTitle">
                {({ TextField }) => (
                  <TextField
                    type="text"
                    label="Job Title"
                    placeholder="Enter job title"
                  />
                )}
              </form.AppField>
            </div>

            <form.AppField name="jobDescription">
              {({ TextArea }) => (
                <TextArea
                  label="Job Description"
                  placeholder="Enter job description"
                  rows={12}
                />
              )}
            </form.AppField>

            <div className="w-max">
              <form.AppForm>
                <form.SubscribeButton
                  label={mutation.isPending ? 'Generating...' : 'Generate'}
                />
              </form.AppForm>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
