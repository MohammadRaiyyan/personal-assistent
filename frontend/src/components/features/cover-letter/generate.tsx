import { Button } from '@/components/ui/button'
import { useAppForm } from '@/hooks/demo.form'
import { createCoverLetter } from '@/lib/coverLetterApi'
import type { CoverLetter } from '../../../../../shared/types/api'
import { useMutation } from '@tanstack/react-query'
import { Link, useRouter } from '@tanstack/react-router'
import MDEditor from '@uiw/react-md-editor'
import { CheckCircle2, ClipboardCopy, ExternalLink, Loader2, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

function useThemeMode() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark'),
  )
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains('dark')),
    )
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return isDark ? 'dark' : 'light'
}

export default function Generate() {
  const router = useRouter()
  const colorMode = useThemeMode()
  const [result, setResult] = useState<CoverLetter | null>(null)
  const [copied, setCopied] = useState(false)

  const mutation = useMutation({
    mutationFn: (payload: { companyName: string; positionTitle: string; jobDescription: string }) =>
      createCoverLetter(payload),
    onError: (err: Error) => toast.error(err?.message || 'Failed to generate cover letter'),
    onSuccess: (res: CoverLetter) => {
      setResult(res)
      router.invalidate()
      toast.success('Cover letter generated!')
    },
  })

  const form = useAppForm({
    defaultValues: { companyName: '', jobTitle: '', jobDescription: '' },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({
        companyName: value.companyName,
        positionTitle: value.jobTitle,
        jobDescription: value.jobDescription,
      })
    },
  })

  const handleCopy = () => {
    if (!result?.content) return
    navigator.clipboard.writeText(result.content)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="-mx-4 -mt-4" data-color-mode={colorMode}>
      {/* Toolbar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-4 h-12 flex items-center justify-between">
        <h1 className="font-bold gradient-title text-lg">New Cover Letter</h1>
        {result && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5">
              {copied
                ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                : <ClipboardCopy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button size="sm" asChild>
              <Link to="/app/cover-letters/$id" params={{ id: result.id }} className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                View
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-7rem)]">

        {/* ── Left: Form ── */}
        <div className="border-r p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Fill in the job details — we'll use your profile, skills, and resume to write a targeted letter.
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <form.AppField name="companyName">
                {({ TextField }) => (
                  <TextField type="text" label="Company Name" placeholder="e.g. Stripe" />
                )}
              </form.AppField>
              <form.AppField name="jobTitle">
                {({ TextField }) => (
                  <TextField type="text" label="Job Title" placeholder="e.g. Senior Engineer" />
                )}
              </form.AppField>
            </div>

            <form.AppField name="jobDescription">
              {({ TextArea }) => (
                <TextArea
                  label="Job Description"
                  placeholder="Paste the full job description here. The more detail you provide, the more tailored the letter will be."
                  rows={14}
                />
              )}
            </form.AppField>

            <form.AppForm>
              <form.Subscribe selector={(s) => s.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                    {isSubmitting
                      ? <><Loader2 className="h-4 w-4 animate-spin" />Generating…</>
                      : <><Sparkles className="h-4 w-4" />Generate Cover Letter</>}
                  </Button>
                )}
              </form.Subscribe>
            </form.AppForm>
          </form>
        </div>

        {/* ── Right: Preview ── */}
        <div className="sticky top-12 self-start h-[calc(100vh-3.5rem-3rem)] overflow-y-auto p-6">
          {result ? (
            <MDEditor.Markdown
              source={result.content}
              style={{ background: 'transparent', fontSize: 13 }}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-muted-foreground">
              <Sparkles className="h-10 w-10 opacity-20" />
              <p className="text-sm">Your cover letter will appear here once generated.</p>
              <p className="text-xs opacity-60">
                Personalised using your profile, skills, experience, and resume.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
