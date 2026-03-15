import { Button } from '@/components/ui/button'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { ArrowRight, BookOpen, Brain, FileText, Sparkles, TrendingUp } from 'lucide-react'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context: { auth: { isAuthenticated } } }) => {
    if (isAuthenticated) throw redirect({ to: '/app' })
  },
  component: LandingPage,
})

const FEATURES = [
  {
    icon: TrendingUp,
    title: 'Industry Insights',
    description: 'Real-time salary data, hiring trends, and skill demand for your industry and location.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: FileText,
    title: 'Resume Builder',
    description: 'AI-assisted resume writing that highlights your strengths with industry-specific language.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    icon: BookOpen,
    title: 'Cover Letters',
    description: 'Generate tailored cover letters in seconds. Paste a job description, get a letter.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Brain,
    title: 'Interview Prep',
    description: 'Skill-tracked quizzes that get harder as you improve. Know exactly where you stand.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
]

const STEPS = [
  { n: '01', title: 'Set up your profile', body: 'Tell us your industry, skills, and background. Takes 2 minutes.' },
  { n: '02', title: 'Get personalised AI tools', body: 'Every feature is calibrated to your experience level and goals.' },
  { n: '03', title: 'Land your next role', body: 'Better resume, sharper interview skills, smarter job applications.' },
]

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Nav */}
      <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50">
        <nav className="container mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-xl font-bold gradient-title">TrajectAI</span>
          <div className="flex items-center gap-2">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/auth/register">
              <Button size="sm">Get started free</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-32 pb-20 text-center space-y-6 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary font-medium mb-2">
          <Sparkles className="h-3 w-3" />
          AI-powered career tools
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight gradient-title">
          Your AI Career Co-Pilot
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Resume building, cover letter generation, interview prep, and industry insights — all personalised to your background and goals.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/auth/register">
            <Button size="lg" className="gap-2">
              Get started free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/auth/login">
            <Button size="lg" variant="outline">Log in</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 pb-20 max-w-4xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map(({ icon: Icon, title, description, color, bg }) => (
            <div key={title} className="rounded-xl border bg-card p-5 space-y-3">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 pb-24 max-w-2xl">
        <h2 className="text-2xl font-bold text-center mb-8">How it works</h2>
        <div className="space-y-4">
          {STEPS.map(({ n, title, body }) => (
            <div key={n} className="flex gap-4 items-start">
              <span className="text-3xl font-bold text-muted-foreground/30 w-10 shrink-0 tabular-nums">{n}</span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/auth/register">
            <Button size="lg" className="gap-2">
              Start for free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        TrajectAI · AI-powered career tools
      </footer>
    </div>
  )
}
