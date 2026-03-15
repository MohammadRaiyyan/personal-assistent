import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { improveResume, updateResume } from '@/lib/resumeApi'
import { useMutation } from '@tanstack/react-query'
import {
  getRouteApi,
  Link,
  useBlocker,
  useRouter,
} from '@tanstack/react-router'
import MDEditor, { commands } from '@uiw/react-md-editor'
import type {
  ImproveResumePayload,
  Resume,
  ResumeContent,
  ResumeData,
  ResumeEntry,
  ResumeLink,
  ResumeStyles,
  UserProfile,
} from '../../../../../shared/types/api'

import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Download,
  Loader2,
  Plus,
  Redo2,
  Save,
  Sparkles,
  Trash2,
  Undo2,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import ResumePreview, { DEFAULT_STYLES, StyleControls } from './resume-preview'

const appRoute = getRouteApi('/app')

// ── Theme mode hook ──────────────────────────────────────────────────────────

function useThemeMode() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  )
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains('dark')),
    )
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])
  return isDark ? 'dark' : 'light'
}

// ── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_ENTRY: ResumeEntry = {
  title: '',
  organization: '',
  startDate: '',
  endDate: '',
  current: false,
  bullets: '',
}

const DEFAULT_LINKS: ResumeLink[] = [
  { label: 'LinkedIn', url: '' },
  { label: 'Portfolio', url: '' },
]

const DEFAULT_DATA: ResumeData = {
  contactInfo: { email: '', mobile: '', links: DEFAULT_LINKS },
  summary: '',
  skills: '',
  experience: [{ ...DEFAULT_ENTRY }],
  education: [{ ...DEFAULT_ENTRY }],
  projects: [{ ...DEFAULT_ENTRY }],
}

// ── Templates ────────────────────────────────────────────────────────────────

const TEMPLATES: Array<{
  name: string
  accent: string
  styles: Partial<ResumeStyles>
}> = [
  {
    name: 'Classic',
    accent: '#1a1a6e',
    styles: {
      fontFamily: 'georgia',
      fontSize: 12,
      lineHeight: 1.45,
      accentColor: '#1a1a6e',
      pageMargin: 32,
      sectionTitleCase: 'upper',
    },
  },
  {
    name: 'Modern',
    accent: '#0f4c5c',
    styles: {
      fontFamily: 'arial',
      fontSize: 12,
      lineHeight: 1.45,
      accentColor: '#0f4c5c',
      pageMargin: 32,
      sectionTitleCase: 'title',
    },
  },
  {
    name: 'Minimal',
    accent: '#1a1a1a',
    styles: {
      fontFamily: 'arial',
      fontSize: 11,
      lineHeight: 1.3,
      accentColor: '#1a1a1a',
      pageMargin: 24,
      sectionTitleCase: 'upper',
    },
  },
  {
    name: 'Executive',
    accent: '#6b2737',
    styles: {
      fontFamily: 'times',
      fontSize: 12,
      lineHeight: 1.45,
      accentColor: '#6b2737',
      pageMargin: 40,
      sectionTitleCase: 'title',
    },
  },
  {
    name: 'Fresh',
    accent: '#1e4620',
    styles: {
      fontFamily: 'calibri',
      fontSize: 13,
      lineHeight: 1.6,
      accentColor: '#1e4620',
      pageMargin: 32,
      sectionTitleCase: 'title',
    },
  },
]

// ── Content parser with migration ───────────────────────────────────────────

function parseContent(raw: string, fallback: ResumeContent): ResumeContent {
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw)
    if (parsed?.data && parsed?.styles) {
      const content = parsed as ResumeContent
      // Migrate old contactInfo format (linkedin/twitter/website → links array)
      const ci = content.data.contactInfo as Record<string, unknown>
      if (!Array.isArray(ci.links)) {
        const links: ResumeLink[] = []
        if (ci.linkedin)
          links.push({ label: 'LinkedIn', url: String(ci.linkedin) })
        if (ci.twitter)
          links.push({ label: 'Twitter / X', url: String(ci.twitter) })
        if (ci.website)
          links.push({ label: 'Portfolio', url: String(ci.website) })
        if (links.length === 0)
          links.push(...DEFAULT_LINKS.map((l) => ({ ...l })))
        content.data.contactInfo = {
          email: String(ci.email ?? ''),
          mobile: String(ci.mobile ?? ''),
          links,
        }
      }
      return content
    }
  } catch {
    // legacy markdown — start fresh
  }
  return fallback
}

// ── Undo / redo hook ─────────────────────────────────────────────────────────

function useUndoable(initial: ResumeData) {
  const snaps = useRef<ResumeData[]>([initial])
  const idx = useRef(0)
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const skipRef = useRef(false)

  const [, forceRender] = useState(0)

  const push = useCallback((val: ResumeData) => {
    if (skipRef.current) return
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => {
      snaps.current = snaps.current.slice(0, idx.current + 1)
      snaps.current.push(val)
      if (snaps.current.length > 50) snaps.current.shift()
      idx.current = snaps.current.length - 1
    }, 700)
  }, [])

  const undo = useCallback((setData: (d: ResumeData) => void) => {
    if (idx.current <= 0) return
    idx.current--
    skipRef.current = true
    setData(snaps.current[idx.current])
    skipRef.current = false
    forceRender((n) => n + 1)
  }, [])

  const redo = useCallback((setData: (d: ResumeData) => void) => {
    if (idx.current >= snaps.current.length - 1) return
    idx.current++
    skipRef.current = true
    setData(snaps.current[idx.current])
    skipRef.current = false
    forceRender((n) => n + 1)
  }, [])

  const canUndo = idx.current > 0
  const canRedo = idx.current < snaps.current.length - 1

  return { push, undo, redo, canUndo, canRedo }
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Section({
  title,
  open,
  onToggle,
  action,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Use div + role=button to avoid nesting <button> inside <button> when action contains a Button */}
      <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer select-none">
        <div
          role="button"
          tabIndex={0}
          onClick={onToggle}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
          className="flex items-center gap-2 flex-1"
        >
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-semibold">{title}</span>
        </div>
        {action}
      </div>
      {open && <div className="px-4 pb-4 pt-1 space-y-3">{children}</div>}
    </div>
  )
}

function AiBtn({
  loading,
  onClick,
}: {
  loading: boolean
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={loading}
      className="h-7 px-2 text-primary text-xs gap-1"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Sparkles className="h-3 w-3" />
      )}
      AI
    </Button>
  )
}

// ── Markdown editor field ────────────────────────────────────────────────────

const MD_COMMANDS = [
  commands.bold,
  commands.italic,
  commands.strikethrough,
  commands.divider,
  commands.unorderedListCommand,
  commands.orderedListCommand,
  commands.checkedListCommand,
  commands.divider,
  commands.link,
]

function MarkdownField({
  value,
  onChange,
  placeholder,
  onImprove,
  improving,
  minHeight = 80,
  colorMode,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  onImprove?: () => void
  improving?: boolean
  minHeight?: number
  colorMode: 'light' | 'dark'
}) {
  return (
    <div className="space-y-1">
      {onImprove && (
        <div className="flex justify-end mb-1">
          <AiBtn loading={improving ?? false} onClick={onImprove} />
        </div>
      )}
      <div data-color-mode={colorMode}>
        <MDEditor
          value={value}
          onChange={(v) => onChange(v ?? '')}
          preview="edit"
          commands={MD_COMMANDS}
          extraCommands={[]}
          visibleDragbar={false}
          height={minHeight}
          textareaProps={{ placeholder }}
          style={{ fontSize: 13 }}
        />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ResumeBuilder({ resume }: { resume: Resume }) {
  const session = appRoute.useRouteContext().auth.session
  const profile = appRoute.useLoaderData() as UserProfile | null
  const router = useRouter()
  const colorMode = useThemeMode()

  const initial = parseContent(resume.content, {
    styles: DEFAULT_STYLES,
    data: DEFAULT_DATA,
  })

  const [data, setDataRaw] = useState<ResumeData>(initial.data)
  const [styles, setStyles] = useState<ResumeStyles>(initial.styles)
  const [title, setTitle] = useState(resume.title ?? 'Untitled Resume')
  const [editingTitle, setEditingTitle] = useState(false)
  const [hasUnsaved, setHasUnsaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [improvingKey, setImprovingKey] = useState<string | null>(null)
  const [open, setOpen] = useState({
    contact: true,
    summary: true,
    skills: true,
    experience: true,
    education: false,
    projects: false,
  })

  const history = useUndoable(initial.data)

  const setData = useCallback(
    (updater: ResumeData | ((prev: ResumeData) => ResumeData)) => {
      setDataRaw((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        history.push(next)
        return next
      })
    },
    [history],
  )

  const didPrefill = useRef(false)
  const readyToTrack = useRef(false)

  useEffect(() => {
    if (didPrefill.current) return
    didPrefill.current = true
    const isEmpty = !data.summary && !data.skills && !data.contactInfo.email
    if (isEmpty) {
      setData((d) => ({
        ...d,
        summary: profile?.bio ?? '',
        skills: profile?.skills?.join(', ') ?? '',
        contactInfo: { ...d.contactInfo, email: session?.user.email ?? '' },
      }))
    }
    setTimeout(() => {
      readyToTrack.current = true
    }, 200)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!readyToTrack.current) return
    setHasUnsaved(true)
  }, [data, styles, title])

  // Keyboard undo/redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        history.undo(setDataRaw)
        setHasUnsaved(true)
      }
      if (
        (e.metaKey || e.ctrlKey) &&
        (e.key === 'y' || (e.key === 'z' && e.shiftKey))
      ) {
        e.preventDefault()
        history.redo(setDataRaw)
        setHasUnsaved(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [history])

  const blocker = useBlocker({
    shouldBlockFn: () => hasUnsaved,
    enableBeforeUnload: true,
    withResolver: true,
  })

  const { mutateAsync: saveFn } = useMutation({
    mutationFn: (payload: { content: string; title: string }) =>
      updateResume(resume.id, payload),
    onSuccess: () => router.invalidate(),
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const content: ResumeContent = { styles, data }
      await saveFn({ content: JSON.stringify(content), title })
      setHasUnsaved(false)
      toast.success('Resume saved!')
    } catch {
      toast.error('Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImprove = async (
    type: ImproveResumePayload['type'],
    content: string,
    key: string,
    onResult: (v: string) => void,
  ) => {
    if (!content.trim()) {
      toast.error('Add some content first')
      return
    }
    setImprovingKey(key)
    try {
      const improved = await improveResume({
        type,
        content,
        industry: profile?.industry ?? '',
      })
      if (improved) {
        onResult(improved)
        toast.success('Improved!')
      }
    } catch {
      toast.error('Failed to improve')
    } finally {
      setImprovingKey(null)
    }
  }

  const applyTemplate = (tpl: (typeof TEMPLATES)[0]) => {
    setStyles((s) => ({ ...s, ...tpl.styles }))
    toast.success(`Template "${tpl.name}" applied`)
  }

  const generatePDF = () => {
    // html2canvas can't parse oklch() colors from Tailwind v4 CSS variables.
    // ResumePreview is 100% inline-styled, so we grab its HTML directly and
    // inject it into a clean popup window — no CSS parsing, no color issues.
    const el = document.getElementById('resume-pdf-export')
    if (!el) {
      toast.error('Could not find export element')
      return
    }

    const popup = window.open('', '_blank', 'width=900,height=700')
    if (!popup) {
      toast.error('Pop-up blocked — please allow pop-ups for this site')
      return
    }

    popup.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    @page { size: A4 portrait; margin: 0; }
    html, body { margin: 0; padding: 0; background: white; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>${el.innerHTML}</body>
</html>`)
    popup.document.close()
    popup.focus()
    // Small delay lets fonts/images settle before print dialog opens
    setTimeout(() => {
      popup.print()
      popup.close()
    }, 400)
  }

  // ── Data helpers ───────────────────────────────────────────────────────────

  const setField = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) =>
    setData((d) => ({ ...d, [key]: value }))

  const setContact = (key: keyof ResumeData['contactInfo'], value: string) =>
    setData((d) => ({ ...d, contactInfo: { ...d.contactInfo, [key]: value } }))

  const setLink = (index: number, key: keyof ResumeLink, value: string) =>
    setData((d) => ({
      ...d,
      contactInfo: {
        ...d.contactInfo,
        links: d.contactInfo.links.map((l, i) =>
          i === index ? { ...l, [key]: value } : l,
        ),
      },
    }))

  const addLink = () =>
    setData((d) => ({
      ...d,
      contactInfo: {
        ...d.contactInfo,
        links: [...d.contactInfo.links, { label: '', url: '' }],
      },
    }))

  const removeLink = (index: number) =>
    setData((d) => ({
      ...d,
      contactInfo: {
        ...d.contactInfo,
        links: d.contactInfo.links.filter((_, i) => i !== index),
      },
    }))

  const setEntry = (
    section: 'experience' | 'education' | 'projects',
    index: number,
    key: keyof ResumeEntry,
    value: string | boolean,
  ) =>
    setData((d) => ({
      ...d,
      [section]: d[section].map((e, i) =>
        i === index ? { ...e, [key]: value } : e,
      ),
    }))

  const addEntry = (section: 'experience' | 'education' | 'projects') =>
    setData((d) => ({ ...d, [section]: [...d[section], { ...DEFAULT_ENTRY }] }))

  const removeEntry = (
    section: 'experience' | 'education' | 'projects',
    index: number,
  ) =>
    setData((d) => ({
      ...d,
      [section]: d[section].filter((_, i) => i !== index),
    }))

  const toggle = (k: keyof typeof open) =>
    setOpen((p) => ({ ...p, [k]: !p[k] }))

  // ── Entry section renderer ─────────────────────────────────────────────────

  const EntrySection = ({
    section,
    label,
    orgLabel = 'Organization',
    improveType,
  }: {
    section: 'experience' | 'education' | 'projects'
    label: string
    orgLabel?: string
    improveType: ImproveResumePayload['type']
  }) => (
    <Section
      title={label}
      open={open[section]}
      onToggle={() => toggle(section)}
    >
      <div className="space-y-3">
        {data[section].map((entry, i) => (
          <div key={i} className="border rounded-lg p-3 space-y-2 bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {label.replace(/s$/, '')} {i + 1}
              </span>
              <button
                type="button"
                onClick={() => removeEntry(section, i)}
                className="text-destructive hover:text-destructive/70 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs mb-1">Title / Role</Label>
                <Input
                  value={entry.title}
                  onChange={(e) =>
                    setEntry(section, i, 'title', e.target.value)
                  }
                  placeholder="e.g. Software Engineer"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs mb-1">{orgLabel}</Label>
                <Input
                  value={entry.organization}
                  onChange={(e) =>
                    setEntry(section, i, 'organization', e.target.value)
                  }
                  placeholder="e.g. Acme Corp"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs mb-1">Start</Label>
                <Input
                  value={entry.startDate}
                  onChange={(e) =>
                    setEntry(section, i, 'startDate', e.target.value)
                  }
                  placeholder="Jan 2022"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs mb-1">End</Label>
                <Input
                  value={entry.current ? '' : entry.endDate}
                  onChange={(e) =>
                    setEntry(section, i, 'endDate', e.target.value)
                  }
                  placeholder={entry.current ? 'Present' : 'Dec 2024'}
                  disabled={entry.current}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={entry.current}
                onChange={(e) =>
                  setEntry(section, i, 'current', e.target.checked)
                }
                className="rounded"
              />
              Currently{' '}
              {section === 'education' ? 'studying here' : 'working here'}
            </label>
            <MarkdownField
              value={entry.bullets}
              onChange={(v) => setEntry(section, i, 'bullets', v)}
              minHeight={100}
              placeholder={`- ${section === 'education' ? "GPA 3.8, Dean's List" : 'Led development of core features'}\n- ...`}
              improving={improvingKey === `${section}-${i}`}
              onImprove={() =>
                handleImprove(
                  improveType,
                  entry.bullets,
                  `${section}-${i}`,
                  (v) => setEntry(section, i, 'bullets', v),
                )
              }
              colorMode={colorMode}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full gap-1.5"
          onClick={() => addEntry(section)}
        >
          <Plus className="h-3.5 w-3.5" /> Add {label.replace(/s$/, '')}
        </Button>
      </div>
    </Section>
  )

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="-mx-4 -mt-4">
      {/* Toolbar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="gap-1 px-2">
            <Link to="/app/resume">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          {editingTitle ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
              className="text-sm font-semibold bg-transparent border-b border-primary focus:outline-none w-48"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingTitle(true)}
              className="text-sm font-semibold hover:text-primary transition-colors"
            >
              {title}
            </button>
          )}

          {hasUnsaved && (
            <span className="text-xs text-amber-500">Unsaved</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Undo / Redo */}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => {
              history.undo(setDataRaw)
              setHasUnsaved(true)
            }}
            disabled={!history.canUndo}
            title="Undo (⌘Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => {
              history.redo(setDataRaw)
              setHasUnsaved(true)
            }}
            disabled={!history.canRedo}
            title="Redo (⌘⇧Z)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>

          {/* Templates */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                Templates
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {TEMPLATES.map((tpl) => (
                <DropdownMenuItem
                  key={tpl.name}
                  onClick={() => applyTemplate(tpl)}
                  className="gap-2 cursor-pointer"
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: tpl.accent }}
                  />
                  {tpl.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !hasUnsaved}
            className="gap-1.5 h-8"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={generatePDF}
            className="gap-1.5 h-8"
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </Button>
        </div>
      </div>

      {/* Style controls strip */}
      <StyleControls styles={styles} onChange={setStyles} />

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-7rem)]">
        {/* ── Left: Form ── */}
        <div className="border-r p-4 space-y-2 overflow-y-auto">
          {/* Contact */}
          <Section
            title="Contact Information"
            open={open.contact}
            onToggle={() => toggle('contact')}
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1">Email</Label>
                <Input
                  value={data.contactInfo.email}
                  onChange={(e) => setContact('email', e.target.value)}
                  placeholder="you@example.com"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs mb-1">Phone</Label>
                <Input
                  value={data.contactInfo.mobile}
                  onChange={(e) => setContact('mobile', e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {/* Dynamic links */}
            <div className="space-y-2 mt-2">
              <Label className="text-xs text-muted-foreground">Links</Label>
              {data.contactInfo.links.map((link, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={link.label}
                    onChange={(e) => setLink(i, 'label', e.target.value)}
                    placeholder="Label (e.g. LinkedIn)"
                    className="h-8 text-sm w-32 shrink-0"
                  />
                  <Input
                    value={link.url}
                    onChange={(e) => setLink(i, 'url', e.target.value)}
                    placeholder="https://..."
                    className="h-8 text-sm flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeLink(i)}
                    className="text-destructive hover:text-destructive/70 transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-muted-foreground"
                onClick={addLink}
              >
                <Plus className="h-3 w-3" /> Add link
              </Button>
            </div>
          </Section>

          {/* Summary */}
          <Section
            title={styles.sectionLabels.summary}
            open={open.summary}
            onToggle={() => toggle('summary')}
            action={
              <AiBtn
                loading={improvingKey === 'summary'}
                onClick={() =>
                  handleImprove('summary', data.summary, 'summary', (v) =>
                    setField('summary', v),
                  )
                }
              />
            }
          >
            <MarkdownField
              value={data.summary}
              onChange={(v) => setField('summary', v)}
              minHeight={100}
              placeholder="A passionate engineer with X years of experience..."
              colorMode={colorMode}
            />
          </Section>

          {/* Skills */}
          <Section
            title={styles.sectionLabels.skills}
            open={open.skills}
            onToggle={() => toggle('skills')}
          >
            <MarkdownField
              value={data.skills}
              onChange={(v) => setField('skills', v)}
              minHeight={80}
              placeholder="React, TypeScript, Node.js — or use bullet points"
              colorMode={colorMode}
            />
          </Section>

          <EntrySection
            section="experience"
            label={styles.sectionLabels.experience}
            orgLabel="Company"
            improveType="experience"
          />
          <EntrySection
            section="education"
            label={styles.sectionLabels.education}
            orgLabel="Institution"
            improveType="education"
          />
          <EntrySection
            section="projects"
            label={styles.sectionLabels.projects}
            orgLabel="Tech / Domain"
            improveType="project"
          />
        </div>

        {/* ── Right: Live Preview ── */}
        <div className="sticky top-22 self-start h-[calc(100vh-3.5rem-3rem-2.5rem)] overflow-y-auto bg-white shadow-inner">
          <ResumePreview
            data={data}
            styles={styles}
            userName={session?.user.name ?? ''}
          />
        </div>
      </div>

      {/* Off-screen element for PDF export */}
      <div
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          width: '210mm',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <div id="resume-pdf-export">
          <ResumePreview
            data={data}
            styles={styles}
            userName={session?.user.name ?? ''}
          />
        </div>
      </div>

      {/* Leave-page dialog */}
      {blocker.status === 'blocked' && (
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unsaved changes</DialogTitle>
              <DialogDescription>
                You have unsaved changes. Save before leaving or your work will
                be lost.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 ">
              <Button variant="outline" onClick={blocker.reset}>
                Stay
              </Button>
              <Button variant="destructive" onClick={blocker.proceed}>
                Discard & Leave
              </Button>
              <Button
                onClick={async () => {
                  await handleSave()
                  blocker.proceed()
                }}
                disabled={isSaving}
              >
                {isSaving && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                )}
                Save & Leave
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
