import type { ResumeData, ResumeEntry, ResumeStyles } from '../../../../../shared/types/api'

// ── Markdown renderer (no external deps, PDF-safe inline HTML) ───────────────

function escHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function inlineMd(text: string): string {
  return escHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="font-family:monospace;font-size:0.88em;background:#f0f0f0;padding:0 3px;border-radius:2px">$1</code>')
}

export function renderMarkdown(text: string, listStyle = 'margin:3px 0 0 0;padding-left:16px'): string {
  if (!text) return ''
  const lines = text.split('\n')
  let html = ''
  let inList = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (/^[-*•]\s+/.test(trimmed)) {
      if (!inList) { html += `<ul style="${listStyle}">`; inList = true }
      html += `<li style="margin-bottom:1px">${inlineMd(trimmed.replace(/^[-*•]\s+/, ''))}</li>`
    } else {
      if (inList) { html += '</ul>'; inList = false }
      if (trimmed) html += `<p style="margin:0 0 3px 0">${inlineMd(trimmed)}</p>`
    }
  }
  if (inList) html += '</ul>'
  return html
}

// ── Fonts ─────────────────────────────────────────────────────────────────────

const FONTS: Record<string, string> = {
  georgia: 'Georgia, "Times New Roman", serif',
  arial: 'Arial, Helvetica, sans-serif',
  times: '"Times New Roman", Times, serif',
  calibri: 'Calibri, "Gill Sans", Verdana, sans-serif',
}

// ── Title case helper ─────────────────────────────────────────────────────────

function applyCase(text: string, tc: ResumeStyles['sectionTitleCase']): string {
  if (tc === 'upper') return text.toUpperCase()
  if (tc === 'lower') return text.toLowerCase()
  // title case
  return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionTitle({
  label,
  styles,
}: {
  label: string
  styles: ResumeStyles
}) {
  return (
    <div
      style={{
        fontSize: `${styles.fontSize + 1}pt`,
        fontWeight: 'bold',
        letterSpacing: styles.sectionTitleCase === 'upper' ? '0.07em' : '0.02em',
        color: styles.accentColor,
        borderBottom: `1.5px solid ${styles.accentColor}`,
        paddingBottom: '3px',
        marginTop: '14px',
        marginBottom: '6px',
      }}
    >
      {applyCase(label, styles.sectionTitleCase)}
    </div>
  )
}

function EntryBlock({ entry, styles }: { entry: ResumeEntry; styles: ResumeStyles }) {
  const dateStr = [
    entry.startDate,
    entry.startDate || (entry.current || entry.endDate) ? '–' : '',
    entry.current ? 'Present' : entry.endDate,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontWeight: 'bold' }}>
          {entry.title}
          {entry.organization ? ` — ${entry.organization}` : ''}
        </span>
        <span style={{ fontSize: `${styles.fontSize - 1}pt`, color: '#666', whiteSpace: 'nowrap', marginLeft: '8px' }}>
          {dateStr}
        </span>
      </div>
      {entry.bullets && (
        <div
          style={{ marginTop: '2px' }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.bullets) }}
        />
      )}
    </div>
  )
}

// ── Main preview ──────────────────────────────────────────────────────────────

export default function ResumePreview({
  data,
  styles,
  userName,
}: {
  data: ResumeData
  styles: ResumeStyles
  userName: string
}) {
  const font = FONTS[styles.fontFamily] ?? FONTS.georgia
  const labels = styles.sectionLabels

  const contacts = [
    data.contactInfo.email,
    data.contactInfo.mobile,
    ...(data.contactInfo.links ?? []).filter((l) => l.url).map((l) => l.label),
  ].filter(Boolean)

  const hasSection = (arr: ResumeEntry[]) => arr.some((e) => e.title || e.bullets)

  return (
    <div
      style={{
        fontFamily: font,
        fontSize: `${styles.fontSize}pt`,
        lineHeight: styles.lineHeight,
        color: '#1a1a1a',
        background: 'white',
        padding: `${styles.pageMargin}px`,
        minHeight: '297mm',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: `${styles.fontSize + 9}pt`, fontWeight: 'bold', letterSpacing: '0.03em', color: '#111' }}>
          {userName || 'Your Name'}
        </div>
        {contacts.length > 0 && (
          <div style={{ fontSize: `${styles.fontSize - 1}pt`, color: '#555', marginTop: '4px' }}>
            {contacts.join('  ·  ')}
          </div>
        )}
      </div>

      <div style={{ borderTop: `2px solid ${styles.accentColor}`, marginBottom: '8px' }} />

      {/* Summary */}
      {data.summary && (
        <>
          <SectionTitle label={labels.summary} styles={styles} />
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(data.summary) }} />
        </>
      )}

      {/* Skills */}
      {data.skills && (
        <>
          <SectionTitle label={labels.skills} styles={styles} />
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(data.skills) }} />
        </>
      )}

      {/* Experience */}
      {hasSection(data.experience) && (
        <>
          <SectionTitle label={labels.experience} styles={styles} />
          {data.experience
            .filter((e) => e.title || e.bullets)
            .map((e, i) => <EntryBlock key={i} entry={e} styles={styles} />)}
        </>
      )}

      {/* Education */}
      {hasSection(data.education) && (
        <>
          <SectionTitle label={labels.education} styles={styles} />
          {data.education
            .filter((e) => e.title || e.bullets)
            .map((e, i) => <EntryBlock key={i} entry={e} styles={styles} />)}
        </>
      )}

      {/* Projects */}
      {hasSection(data.projects) && (
        <>
          <SectionTitle label={labels.projects} styles={styles} />
          {data.projects
            .filter((e) => e.title || e.bullets)
            .map((e, i) => <EntryBlock key={i} entry={e} styles={styles} />)}
        </>
      )}

      {/* Empty state */}
      {!data.summary && !data.skills && !hasSection(data.experience) && !hasSection(data.education) && !hasSection(data.projects) && (
        <div style={{ textAlign: 'center', color: '#aaa', paddingTop: '80px', fontSize: `${styles.fontSize + 1}pt` }}>
          Fill in the form to see your resume here
        </div>
      )}
    </div>
  )
}

// ── Defaults + StyleControls ──────────────────────────────────────────────────

export const DEFAULT_STYLES: ResumeStyles = {
  fontFamily: 'georgia',
  fontSize: 12,
  lineHeight: 1.45,
  accentColor: '#1a1a6e',
  pageMargin: 32,
  sectionTitleCase: 'upper',
  sectionLabels: {
    summary: 'Professional Summary',
    skills: 'Skills',
    experience: 'Work Experience',
    education: 'Education',
    projects: 'Projects',
  },
}

const ACCENT_PRESETS = [
  { label: 'Navy', value: '#1a1a6e' },
  { label: 'Black', value: '#1a1a1a' },
  { label: 'Teal', value: '#0f4c5c' },
  { label: 'Burgundy', value: '#6b2737' },
  { label: 'Forest', value: '#1e4620' },
]

export function StyleControls({
  styles,
  onChange,
}: {
  styles: ResumeStyles
  onChange: (s: ResumeStyles) => void
}) {
  const set = <K extends keyof ResumeStyles>(k: K, v: ResumeStyles[K]) =>
    onChange({ ...styles, [k]: v })

  const setLabel = (k: keyof ResumeStyles['sectionLabels'], v: string) =>
    onChange({ ...styles, sectionLabels: { ...styles.sectionLabels, [k]: v } })

  return (
    <div className="border-b bg-muted/30 text-xs">
      {/* Row 1: type controls */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2">
        {/* Font */}
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Font</span>
          <select
            value={styles.fontFamily}
            onChange={(e) => set('fontFamily', e.target.value as ResumeStyles['fontFamily'])}
            className="bg-background border rounded px-1.5 py-0.5 text-xs"
          >
            <option value="georgia">Georgia (Elegant)</option>
            <option value="arial">Arial (Modern)</option>
            <option value="times">Times New Roman (Classic)</option>
            <option value="calibri">Calibri (Clean)</option>
          </select>
        </div>

        {/* Size */}
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Size</span>
          {([11, 12, 13] as const).map((s) => (
            <button key={s} type="button" onClick={() => set('fontSize', s)}
              className={`w-6 h-6 rounded text-xs font-medium transition-colors ${styles.fontSize === s ? 'bg-primary text-primary-foreground' : 'bg-background border hover:bg-muted'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Spacing */}
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Spacing</span>
          {([{ v: 1.3, l: 'Tight' }, { v: 1.45, l: 'Normal' }, { v: 1.6, l: 'Relaxed' }] as const).map(({ v, l }) => (
            <button key={v} type="button" onClick={() => set('lineHeight', v)}
              className={`px-2 h-6 rounded text-xs transition-colors ${styles.lineHeight === v ? 'bg-primary text-primary-foreground' : 'bg-background border hover:bg-muted'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Margin */}
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Margin</span>
          {([{ v: 24, l: 'Narrow' }, { v: 32, l: 'Normal' }, { v: 40, l: 'Wide' }] as const).map(({ v, l }) => (
            <button key={v} type="button" onClick={() => set('pageMargin', v)}
              className={`px-2 h-6 rounded text-xs transition-colors ${styles.pageMargin === v ? 'bg-primary text-primary-foreground' : 'bg-background border hover:bg-muted'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Title case */}
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Heading</span>
          {([{ v: 'upper', l: 'AA' }, { v: 'title', l: 'Aa' }, { v: 'lower', l: 'aa' }] as const).map(({ v, l }) => (
            <button key={v} type="button" onClick={() => set('sectionTitleCase', v)}
              className={`px-2 h-6 rounded text-xs font-mono transition-colors ${styles.sectionTitleCase === v ? 'bg-primary text-primary-foreground' : 'bg-background border hover:bg-muted'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Accent color */}
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Color</span>
          {ACCENT_PRESETS.map(({ label, value }) => (
            <button key={value} type="button" title={label} onClick={() => set('accentColor', value)}
              className={`w-5 h-5 rounded-full border-2 transition-all ${styles.accentColor === value ? 'border-foreground scale-110' : 'border-transparent'}`}
              style={{ background: value }} />
          ))}
          <input type="color" value={styles.accentColor} onChange={(e) => set('accentColor', e.target.value)}
            title="Custom color" className="w-5 h-5 rounded cursor-pointer border p-0" />
        </div>
      </div>

      {/* Row 2: section label editors */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 pb-2">
        <span className="text-muted-foreground shrink-0">Section labels:</span>
        {(Object.keys(styles.sectionLabels) as Array<keyof typeof styles.sectionLabels>).map((k) => (
          <input
            key={k}
            value={styles.sectionLabels[k]}
            onChange={(e) => setLabel(k, e.target.value)}
            className="bg-background border rounded px-1.5 py-0.5 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder={k}
          />
        ))}
      </div>
    </div>
  )
}
