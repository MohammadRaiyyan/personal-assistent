import { Button } from '@/components/ui/button'
import MDEditor from '@uiw/react-md-editor'
import { CheckCircle2, ClipboardCopy, Pencil, X } from 'lucide-react'
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

const Preview = ({ content }: { content: string }) => {
  const colorMode = useThemeMode()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(content)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3" data-color-mode={colorMode}>
      <div className="flex items-center gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
          {copied
            ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            : <ClipboardCopy className="h-3.5 w-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditing((e) => !e)}
          className="gap-1.5"
        >
          {editing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
          {editing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      {editing ? (
        <MDEditor
          value={value}
          onChange={(v) => setValue(v ?? '')}
          height={680}
          preview="live"
        />
      ) : (
        <div className="border rounded-lg p-6">
          <MDEditor.Markdown
            source={value}
            style={{ background: 'transparent', fontSize: 14 }}
          />
        </div>
      )}
    </div>
  )
}

export default Preview
