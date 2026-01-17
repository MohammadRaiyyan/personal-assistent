import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppForm } from '@/hooks/demo.form'
import MDEditor from '@uiw/react-md-editor'
import html2pdf from 'html2pdf.js/dist/html2pdf.min.js'
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Plus,
  Save,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthContext } from '@/context/auth-context'
import { resumeSchema } from '@/schema/onboarding'
import { entriesToMarkdown } from '@/utils/entriesToMarkdown'
import { useStore } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import type z from 'zod'

const defaultContent: z.infer<typeof resumeSchema> = {
  contactInfo: {
    email: '',
    mobile: '',
    linkedin: '',
    twitter: '',
  },
  summary: '',
  skills: '',
  experience: [
    {
      title: '',
      organization: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    },
  ],
  education: [
    {
      title: '',
      organization: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    },
  ],
  projects: [
    {
      title: '',
      organization: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    },
  ],
}

export default function ResumeBuilder({
  initialContent,
}: {
  initialContent: string
}) {
  const [activeTab, setActiveTab] = useState('edit')
  const [previewContent, setPreviewContent] = useState(() => initialContent)
  const [resumeMode, setResumeMode] = useState('preview')
  const { session } = useAuthContext()

  const form = useAppForm({
    defaultValues: defaultContent,
    onSubmit: async () => {
      try {
        const formattedContent = previewContent
          .replace(/\n/g, '\n') // Normalize newlines
          .replace(/\n\s*\n/g, '\n\n') // Normalize multiple newlines to double newlines
          .trim()

        console.log(previewContent, formattedContent)
        await saveResumeFn(previewContent)
      } catch (error) {
        console.error('Save error:', error)
      }
    },
    validators: {
      onSubmit: resumeSchema,
    },
  })

  const {
    mutateAsync: saveResumeFn,
    isPending: isSaving,
    data: saveResult,
    error: saveError,
  } = useMutation({
    mutationFn: async (content: string) => {
      new Promise((resolve) =>
        setTimeout(() => resolve({ success: true }), 1000),
      )
    },
    onSuccess: () => {
      // Optional: additional success handling
    },
  })

  // Watch form fields for preview updates
  const formValues = useStore(form.store, (state) => state.values)

  useEffect(() => {
    if (initialContent) setActiveTab('preview')
  }, [initialContent])

  // Update preview content when form values change
  useEffect(() => {
    if (activeTab === 'edit') {
      const newContent = getCombinedContent()
      setPreviewContent(newContent ? newContent : initialContent)
    }
  }, [formValues, activeTab])

  // Handle save result
  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success('Resume saved successfully!')
    }
    if (saveError) {
      toast.error(saveError.message || 'Failed to save resume')
    }
  }, [saveResult, saveError, isSaving])

  const getContactMarkdown = () => {
    const { contactInfo } = formValues
    const parts = []
    if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`)
    if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`)
    if (contactInfo.linkedin)
      parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`)
    if (contactInfo.twitter) parts.push(`🐦 [Twitter](${contactInfo.twitter})`)

    return parts.length > 0
      ? `## <div align="center">${session?.user.name}</div>
        \n\n<div align="center">\n\n${parts.join(' | ')}\n\n</div>`
      : ''
  }

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(experience, 'Work Experience'),
      entriesToMarkdown(education, 'Education'),
      entriesToMarkdown(projects, 'Projects'),
    ]
      .filter(Boolean)
      .join('\n\n')
  }

  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      const element = document.getElementById('resume-pdf')
      const opt = {
        margin: [15, 15],
        filename: 'resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }

      await html2pdf().set(opt).from(element).save()
    } catch (error) {
      console.error('PDF generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div data-color-mode="light" className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          <TabsList>
            <TabsTrigger value="edit">Form</TabsTrigger>
            <TabsTrigger value="preview">Markdown</TabsTrigger>
          </TabsList>
          <div className="space-x-3">
            <Button
              onClick={generatePDF}
              variant={'secondary'}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
            <Button
              variant="default"
              onClick={(e) => {
                e.preventDefault()
                form.handleSubmit()
              }}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        <TabsContent value="edit">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className="space-y-8"
          >
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <form.AppField name="contactInfo.email">
                  {({ TextField }) => {
                    return (
                      <TextField
                        label="Email"
                        type="email"
                        placeholder="your@email.com"
                      />
                    )
                  }}
                </form.AppField>
                <form.AppField name="contactInfo.mobile">
                  {({ TextField }) => {
                    return (
                      <TextField
                        label="Mobile Number"
                        type="tel"
                        placeholder="+1 234 567 8900"
                      />
                    )
                  }}
                </form.AppField>

                <form.AppField name="contactInfo.linkedin">
                  {({ TextField }) => {
                    return (
                      <TextField
                        label="LinkedIn URL"
                        type="url"
                        placeholder="https://linkedin.com/in/your-profile"
                      />
                    )
                  }}
                </form.AppField>
                <form.AppField name="contactInfo.twitter">
                  {({ TextField }) => {
                    return (
                      <TextField
                        label="Twitter/X Profile"
                        type="url"
                        placeholder="https://twitter.com/your-handle"
                      />
                    )
                  }}
                </form.AppField>
              </div>
            </div>

            <form.AppField name="summary">
              {({ TextArea }) => (
                <TextArea
                  label="Professional Summary"
                  placeholder="Write a compelling professional summary..."
                  rows={8}
                />
              )}
            </form.AppField>

            <form.AppField name="skills">
              {({ TextArea }) => (
                <TextArea
                  label="Skills"
                  placeholder="List your key skills..."
                  rows={6}
                />
              )}
            </form.AppField>

            <form.AppField name="experience" mode="array">
              {(field) => {
                return (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">
                        Work Experience
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {field.state.value.map((_, index) => {
                        return (
                          <div
                            key={index}
                            className="space-y-4 mb-6 bg-background p-4 rounded relative"
                          >
                            <Button
                              variant="outline"
                              size={'icon-sm'}
                              onClick={() => field.removeValue(index)}
                              className="absolute -top-12 right-0"
                            >
                              <X />
                            </Button>
                            <div className="grid grid-cols-4 gap-3">
                              <form.AppField
                                key={index}
                                name={`experience[${index}].title`}
                              >
                                {({ TextField }) => (
                                  <TextField
                                    placeholder="Enter title"
                                    type="text"
                                    label="Title/Position"
                                  />
                                )}
                              </form.AppField>
                              <form.AppField
                                key={index}
                                name={`experience[${index}].organization`}
                              >
                                {({ TextField }) => (
                                  <TextField
                                    placeholder="Enter organization"
                                    type="text"
                                    label="Organization/Company"
                                  />
                                )}
                              </form.AppField>
                              <form.AppField
                                key={index}
                                name={`experience[${index}].startDate`}
                              >
                                {({ TextField }) => (
                                  <TextField
                                    placeholder="MM/YYYY"
                                    type="text"
                                    label="Start Date"
                                  />
                                )}
                              </form.AppField>
                              <form.Subscribe
                                selector={(state) =>
                                  state.values.experience[index].current
                                }
                              >
                                {(isCurrent) => {
                                  if (isCurrent) {
                                    return null
                                  }
                                  return (
                                    <form.AppField
                                      key={index}
                                      name={`experience[${index}].endDate`}
                                    >
                                      {({ TextField }) => (
                                        <TextField
                                          placeholder="MM/YYYY"
                                          type="text"
                                          label="End Date"
                                        />
                                      )}
                                    </form.AppField>
                                  )
                                }}
                              </form.Subscribe>
                              <form.AppField
                                key={index}
                                name={`experience[${index}].current`}
                              >
                                {({ TextField }) => (
                                  <TextField
                                    type="checkbox"
                                    label="Currently Working Here"
                                  />
                                )}
                              </form.AppField>
                            </div>

                            <form.AppField
                              key={index}
                              name={`experience[${index}].description`}
                            >
                              {({ TextArea }) => (
                                <TextArea
                                  label="Description"
                                  placeholder="Describe your role and achievements..."
                                  rows={4}
                                />
                              )}
                            </form.AppField>
                          </div>
                        )
                      })}
                      <Button
                        variant="outline"
                        onClick={() =>
                          field.pushValue(defaultContent.experience[0])
                        }
                      >
                        <Plus /> Add More Experience
                      </Button>
                    </CardContent>
                  </Card>
                )
              }}
            </form.AppField>
            <form.AppField name="education" mode="array">
              {(field) => {
                return (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">
                        Education
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {field.state.value.map((_, index) => {
                        return (
                          <div
                            key={index}
                            className="space-y-4 mb-6 bg-background p-4 rounded relative"
                          >
                            <Button
                              variant="outline"
                              size={'icon-sm'}
                              onClick={() => field.removeValue(index)}
                              className="absolute -top-12 right-0"
                            >
                              <X />
                            </Button>
                            <div className="grid grid-cols-4 gap-3">
                              <form.AppField
                                key={index}
                                name={`education[${index}].title`}
                              >
                                {({ TextField }) => (
                                  <TextField
                                    placeholder="Enter degree/course"
                                    type="text"
                                    label="Degree/Course"
                                  />
                                )}
                              </form.AppField>
                              <form.AppField
                                key={index}
                                name={`experience[${index}].organization`}
                              >
                                {({ TextField }) => (
                                  <TextField
                                    placeholder="Enter college/university"
                                    type="text"
                                    label="College/University"
                                  />
                                )}
                              </form.AppField>
                              <form.AppField
                                key={index}
                                name={`experience[${index}].startDate`}
                              >
                                {({ TextField }) => (
                                  <TextField
                                    placeholder="MM/YYYY"
                                    type="text"
                                    label="Start Date"
                                  />
                                )}
                              </form.AppField>
                              <form.Subscribe
                                selector={(state) =>
                                  state.values.experience[index].current
                                }
                              >
                                {(isCurrent) => {
                                  if (isCurrent) {
                                    return null
                                  }
                                  return (
                                    <form.AppField
                                      key={index}
                                      name={`experience[${index}].endDate`}
                                    >
                                      {({ TextField }) => (
                                        <TextField
                                          placeholder="MM/YYYY"
                                          type="text"
                                          label="End Date"
                                        />
                                      )}
                                    </form.AppField>
                                  )
                                }}
                              </form.Subscribe>

                              <form.AppField
                                key={index}
                                name={`experience[${index}].current`}
                              >
                                {({ TextField }) => (
                                  <TextField
                                    type="checkbox"
                                    label="Currently Studying Here"
                                  />
                                )}
                              </form.AppField>
                            </div>
                            <form.AppField
                              key={index}
                              name={`experience[${index}].description`}
                            >
                              {({ TextArea }) => (
                                <TextArea
                                  label="Description"
                                  placeholder="Describe your studies and achievements..."
                                  rows={4}
                                />
                              )}
                            </form.AppField>
                          </div>
                        )
                      })}

                      <Button
                        variant="outline"
                        onClick={() =>
                          field.pushValue(defaultContent.education[0])
                        }
                      >
                        <Plus /> Add More Education
                      </Button>
                    </CardContent>
                  </Card>
                )
              }}
            </form.AppField>
            <form.AppField name="projects" mode="array">
              {(field) => {
                return (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">
                        Projects
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {field.state.value.map((_, index) => {
                        return (
                          <div
                            key={index}
                            className="space-y-4 mb-6 bg-background p-4 rounded relative"
                          >
                            <Button
                              variant="outline"
                              size={'icon-sm'}
                              onClick={() => field.removeValue(index)}
                              className="absolute -top-12 right-0"
                            >
                              <X />
                            </Button>
                            <div className="grid grid-cols-4 gap-3">
                              <form.AppField
                                key={index}
                                name={`experience[${index}].title`}
                              >
                                {({ TextField }) => (
                                  <TextField
                                    placeholder="Enter project title"
                                    type="text"
                                    label=" Project Title"
                                  />
                                )}
                              </form.AppField>
                              <form.AppField
                                key={index}
                                name={`experience[${index}].organization`}
                              >
                                {({ TextField }) => (
                                  <TextField
                                    placeholder="Enter domain/technology"
                                    type="text"
                                    label="Domain/Technology"
                                  />
                                )}
                              </form.AppField>
                              <form.AppField
                                key={index}
                                name={`experience[${index}].startDate`}
                              >
                                {({ TextField }) => (
                                  <TextField
                                    placeholder="MM/YYYY"
                                    type="text"
                                    label="Start Date"
                                  />
                                )}
                              </form.AppField>
                              <form.Subscribe
                                selector={(state) =>
                                  state.values.experience[index].current
                                }
                              >
                                {(isCurrent) => {
                                  if (isCurrent) {
                                    return null
                                  }
                                  return (
                                    <form.AppField
                                      key={index}
                                      name={`experience[${index}].endDate`}
                                    >
                                      {({ TextField }) => (
                                        <TextField
                                          placeholder="MM/YYYY"
                                          type="text"
                                          label="End Date"
                                        />
                                      )}
                                    </form.AppField>
                                  )
                                }}
                              </form.Subscribe>

                              <form.AppField
                                key={index}
                                name={`experience[${index}].current`}
                              >
                                {({ TextField }) => (
                                  <TextField
                                    type="checkbox"
                                    label="Currently Working on This"
                                  />
                                )}
                              </form.AppField>
                            </div>
                            <form.AppField
                              key={index}
                              name={`experience[${index}].description`}
                            >
                              {({ TextArea }) => (
                                <TextArea
                                  label="Description"
                                  placeholder="Describe your project and achievements..."
                                  rows={4}
                                />
                              )}
                            </form.AppField>
                          </div>
                        )
                      })}
                      <Button
                        variant="outline"
                        onClick={() =>
                          field.pushValue(defaultContent.projects[0])
                        }
                      >
                        <Plus /> Add More Projects
                      </Button>
                    </CardContent>
                  </Card>
                )
              }}
            </form.AppField>
          </form>
        </TabsContent>

        <TabsContent value="preview">
          {activeTab === 'preview' && (
            <Button
              variant="link"
              type="button"
              className="mb-2"
              onClick={() =>
                setResumeMode(resumeMode === 'preview' ? 'edit' : 'preview')
              }
            >
              {resumeMode === 'preview' ? (
                <>
                  <Edit className="h-4 w-4" />
                  Edit Resume
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4" />
                  Show Preview
                </>
              )}
            </Button>
          )}

          {activeTab === 'preview' && resumeMode !== 'preview' && (
            <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                You will lose editied markdown if you update the form data.
              </span>
            </div>
          )}
          <div className="border rounded-lg">
            <MDEditor
              value={previewContent}
              onChange={setPreviewContent}
              height={800}
              preview={resumeMode}
            />
          </div>
          <div className="hidden">
            <div id="resume-pdf">
              <MDEditor.Markdown
                source={previewContent}
                style={{
                  background: 'white',
                  color: 'black',
                }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
