import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  createResume,
  deleteResume,
  duplicateResume,
  updateResume,
} from '@/lib/resumeApi'
import { useMutation } from '@tanstack/react-query'
import { Link, useRouter } from '@tanstack/react-router'
import { format } from 'date-fns'
import { Copy, Edit3, FileText, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { Resume } from '../../../../../shared/types/api'

function InlineRename({
  id,
  title,
  onDone,
}: {
  id: string
  title: string
  onDone: () => void
}) {
  const [value, setValue] = useState(title)
  const router = useRouter()

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      updateResume(id, { title: value.trim() || 'Untitled Resume' }),
    onSuccess: () => {
      router.invalidate()
      onDone()
    },
    onError: () => toast.error('Failed to rename'),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        mutate()
      }}
      className="flex items-center gap-2"
    >
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onDone()}
        className="border rounded px-2 py-1 text-sm bg-background flex-1 focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <Button
        type="submit"
        size="sm"
        disabled={isPending}
        className="h-7 text-xs"
      >
        Save
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 text-xs"
        onClick={onDone}
      >
        Cancel
      </Button>
    </form>
  )
}

function ResumeCard({ resume }: { resume: Resume }) {
  const router = useRouter()
  const [renaming, setRenaming] = useState(false)

  const { mutate: duplicate, isPending: isDuplicating } = useMutation({
    mutationFn: () => duplicateResume(resume.id),
    onSuccess: () => {
      router.invalidate()
      toast.success('Duplicated!')
    },
    onError: () => toast.error('Failed to duplicate'),
  })

  const { mutate: del, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteResume(resume.id),
    onSuccess: () => {
      router.invalidate()
      toast.success('Deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  return (
    <Card className="group hover:border-primary/40 transition-colors">
      <CardContent className="pt-4 pb-3 px-4 space-y-3">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {renaming ? (
              <InlineRename
                id={resume.id}
                title={resume.title ?? 'Untitled Resume'}
                onDone={() => setRenaming(false)}
              />
            ) : (
              <div className="flex items-center gap-1.5">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="font-semibold text-sm truncate">
                  {resume.title ?? 'Untitled Resume'}
                </span>
                <button
                  type="button"
                  onClick={() => setRenaming(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                >
                  <Edit3 className="h-3 w-3" />
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-0.5 ml-5">
              Updated {format(new Date(resume.updatedAt), 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" asChild className="flex-1 h-8">
            <Link to="/app/resume/$id" params={{ id: resume.id }}>
              Edit
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1"
            onClick={() => duplicate()}
            disabled={isDuplicating}
          >
            <Copy className="h-3.5 w-3.5" />
            Duplicate
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete resume?</AlertDialogTitle>
                <AlertDialogDescription>
                  "{resume.title ?? 'Untitled Resume'}" will be permanently
                  deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => del()}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ResumeList({ resumes }: { resumes: Resume[] }) {
  const router = useRouter()

  const { mutate: create, isPending } = useMutation({
    mutationFn: () => createResume({ content: '{}', title: 'Untitled Resume' }),
    onSuccess: (resume) => {
      router.invalidate()
      router.navigate({ to: '/app/resume/$id', params: { id: resume.id } })
    },
    onError: () => toast.error('Failed to create resume'),
  })

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium gradient-title">My Resumes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build multiple resumes tailored to different roles
          </p>
        </div>
        <Button onClick={() => create()} disabled={isPending} className="gap-2">
          <Plus className="h-4 w-4" />
          New Resume
        </Button>
      </div>

      {resumes.length === 0 ? (
        <div className="border-2 border-dashed rounded-xl py-16 flex flex-col items-center gap-3 text-muted-foreground">
          <FileText className="h-10 w-10 opacity-30" />
          <p className="text-sm font-medium">No resumes yet</p>
          <p className="text-xs opacity-70">
            Create your first resume to get started
          </p>
          <Button
            onClick={() => create()}
            disabled={isPending}
            className="mt-2 gap-2"
          >
            <Plus className="h-4 w-4" /> Create Resume
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((r) => (
            <ResumeCard key={r.id} resume={r} />
          ))}
          {/* New resume tile */}
          <button
            type="button"
            onClick={() => create()}
            disabled={isPending}
            className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors min-h-[120px] justify-center"
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm font-medium">New Resume</span>
          </button>
        </div>
      )}
    </div>
  )
}
