import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAppForm } from '@/hooks/demo.form'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'

export default function Generate() {
  const router = useRouter()

  const form = useAppForm({
    defaultValues: {
      companyName: '',
      jobTitle: '',
      jobDescription: '',
    },
    onSubmit: () => {},
  })

  const onSubmit = async (data) => {
    try {
      //   await generateLetterFn(data)
    } catch (error) {
      toast.error(error.message || 'Failed to generate cover letter')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Provide information about the position you're applying for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className="space-y-4"
          >
            {/* Form fields remain the same */}
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
                  rows={20}
                />
              )}
            </form.AppField>

            <div className="w-max">
              <form.AppForm>
                <form.SubscribeButton label="Generate" />
              </form.AppForm>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
