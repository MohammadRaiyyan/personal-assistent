import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Link, getRouteApi, useRouter } from '@tanstack/react-router'
import {
  ArrowRight,
  BookOpen,
  Brain,
  Flame,
  Settings2,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react'
import type {
  Assessment,
  Insight,
  UserProfile,
} from '../../../../../shared/types/api'
import PerformanceChart from './performance-chart'
import QuizList from './quiz-list'

type Difficulty = 'junior' | 'mid' | 'senior' | 'lead' | 'staff'

const appRoute = getRouteApi('/app')

// ─── Mastery system (per-skill) ──────────────────────────────────────────────

const MASTERY = [
  {
    label: 'Beginner',
    emoji: '🌱',
    difficulty: 'junior' as Difficulty,
    color: 'text-slate-400',
    minAttempts: 0,
    minScore: 0,
  },
  {
    label: 'Learning',
    emoji: '📚',
    difficulty: 'mid' as Difficulty,
    color: 'text-blue-400',
    minAttempts: 1,
    minScore: 50,
  },
  {
    label: 'Competent',
    emoji: '⚡',
    difficulty: 'senior' as Difficulty,
    color: 'text-yellow-400',
    minAttempts: 2,
    minScore: 65,
  },
  {
    label: 'Advanced',
    emoji: '🎯',
    difficulty: 'lead' as Difficulty,
    color: 'text-orange-400',
    minAttempts: 3,
    minScore: 78,
  },
  {
    label: 'Expert',
    emoji: '🏆',
    difficulty: 'staff' as Difficulty,
    color: 'text-purple-400',
    minAttempts: 4,
    minScore: 90,
  },
]

function computeMastery(skill: string, assessments: Assessment[]) {
  const history = assessments
    .filter((a) => a.skillFocus?.includes(skill))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

  const attempts = history.length
  if (attempts === 0) {
    return {
      attempts: 0,
      avgScore: 0,
      lastScore: null,
      masteryIdx: 0,
      mastery: MASTERY[0],
      next: MASTERY[1],
      progressToNext: 0,
    }
  }

  const avgScore = history.reduce((s, a) => s + a.score, 0) / attempts
  const lastScore = history[0].score

  let masteryIdx = 0
  for (let i = MASTERY.length - 1; i >= 0; i--) {
    if (attempts >= MASTERY[i].minAttempts && avgScore >= MASTERY[i].minScore) {
      masteryIdx = i
      break
    }
  }

  const mastery = MASTERY[masteryIdx]
  const next = MASTERY[masteryIdx + 1] ?? null
  const progressToNext = next
    ? Math.max(
        0,
        Math.min(
          ((avgScore - mastery.minScore) / (next.minScore - mastery.minScore)) *
            100,
          99,
        ),
      )
    : 100

  return {
    attempts,
    avgScore,
    lastScore,
    masteryIdx,
    mastery,
    next,
    progressToNext,
  }
}

function expToDifficulty(exp: number): Difficulty {
  if (exp < 2) return 'junior'
  if (exp < 5) return 'mid'
  if (exp < 8) return 'senior'
  if (exp < 12) return 'lead'
  return 'staff'
}

function getStreak(assessments: Assessment[]): number {
  if (!assessments.length) return 0
  const unique = [
    ...new Set(assessments.map((a) => new Date(a.createdAt).toDateString())),
  ]
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime())
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (Math.floor((today.getTime() - unique[0].getTime()) / 86_400_000) > 1)
    return 0
  let streak = 1
  for (let i = 0; i < unique.length - 1; i++) {
    if (
      Math.floor(
        (unique[i].getTime() - unique[i + 1].getTime()) / 86_400_000,
      ) === 1
    )
      streak++
    else break
  }
  return streak
}

// ─── Skill Track Card ─────────────────────────────────────────────────────────

function SkillTrackCard({
  skill,
  assessments,
  onClick,
}: {
  skill: string
  assessments: Assessment[]
  onClick: () => void
}) {
  const stats = computeMastery(skill, assessments)
  const { mastery, next, progressToNext, attempts, avgScore } = stats

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-sm active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-sm leading-tight">{skill}</span>
        <span className={`text-xs font-medium shrink-0 ${mastery.color}`}>
          {mastery.emoji} {mastery.label}
        </span>
      </div>

      {attempts > 0 ? (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>
              {attempts} quiz{attempts !== 1 ? 'zes' : ''} · avg{' '}
              {Math.round(avgScore)}%
            </span>
            {next && (
              <span>
                {Math.round(progressToNext)}% to {next.label}
              </span>
            )}
          </div>
          <Progress value={progressToNext} className="h-1" />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Not started · will begin at Beginner level
        </p>
      )}

      <div className="flex items-center gap-1 text-xs font-medium text-primary mt-auto">
        <span>
          {attempts === 0
            ? 'Start'
            : mastery.label === 'Expert'
              ? 'Master mode'
              : 'Continue'}
        </span>
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  )
}

// ─── Explore Card ─────────────────────────────────────────────────────────────

function ExploreCard({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: React.ElementType
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-4 rounded-xl border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-sm active:scale-[0.99] w-full"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Interview({
  assessments,
  insights,
}: {
  assessments: Assessment[]
  insights: Insight | null
}) {
  const profile = appRoute.useLoaderData() as UserProfile | null
  const router = useRouter()

  const total = assessments.length
  const avg = total
    ? Math.round(assessments.reduce((s, a) => s + a.score, 0) / total)
    : 0
  const best = total
    ? Math.round(Math.max(...assessments.map((a) => a.score)))
    : 0
  const streak = getStreak(assessments)

  const startSkill = (
    skill: string,
    difficulty: Difficulty,
    category: 'technical' | 'behavioral' = 'technical',
  ) => {
    router.navigate({
      to: '/app/interview/mock',
      search: {
        skillFocus: skill,
        category,
        difficulty,
        count: 10,
        autoStart: true,
      },
    })
  }

  const defaultDifficulty = expToDifficulty(profile?.experience ?? 0)

  return (
    <div className="space-y-8 pb-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium gradient-title">
            Interview Prep
          </h1>
          {total > 0 && (
            <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Brain className="h-3.5 w-3.5" />
                {total} quizzes
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-3.5 w-3.5" />
                {avg}% avg
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5 text-yellow-400" />
                {best}% best
              </span>
              {streak > 0 && (
                <span className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  {streak} day streak
                </span>
              )}
            </div>
          )}
        </div>
        <Link to="/app/interview/mock" search={{ skillFocus: undefined, category: 'technical', difficulty: 'mid', count: 10, autoStart: false }}>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings2 className="h-3.5 w-3.5" />
            Custom Quiz
          </Button>
        </Link>
      </div>

      {/* ── Your Skill Tracks ── */}
      {profile && profile.skills.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-semibold">Your Skill Tracks</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Difficulty auto-advances with your progress
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {profile.skills.map((skill) => {
              const stats = computeMastery(skill, assessments)
              return (
                <SkillTrackCard
                  key={skill}
                  skill={skill}
                  assessments={assessments}
                  onClick={() => startSkill(skill, stats.mastery.difficulty)}
                />
              )
            })}
          </div>
        </section>
      )}

      {/* ── Explore ── */}
      <section className="space-y-3">
        <h2 className="font-semibold">Explore</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ExploreCard
            icon={BookOpen}
            title="Behavioral Practice"
            description="STAR scenarios, leadership, conflict, communication"
            onClick={() =>
              router.navigate({
                to: '/app/interview/mock',
                search: {
                  skillFocus: undefined,
                  category: 'behavioral',
                  difficulty: defaultDifficulty,
                  count: 10,
                  autoStart: true,
                },
              })
            }
          />
          <ExploreCard
            icon={Settings2}
            title="Custom Quiz"
            description="Choose your skills, difficulty, and question count"
            onClick={() => router.navigate({ to: '/app/interview/mock', search: { skillFocus: undefined, category: 'technical', difficulty: 'mid', count: 10, autoStart: false } })}
          />
        </div>
      </section>

      {/* ── AI Suggested ── */}
      {insights?.recommendedSkills && insights.recommendedSkills.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <h2 className="font-semibold">Expand Your Repertoire</h2>
            <span className="text-xs text-muted-foreground">
              AI suggested for your industry
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.recommendedSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => startSkill(skill, defaultDifficulty)}
                className="flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/5 px-3 py-1.5 text-xs font-medium text-purple-300 transition-colors hover:bg-purple-500/15"
              >
                <Sparkles className="h-3 w-3" />
                {skill}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Performance ── */}
      {total > 0 && (
        <>
          <PerformanceChart assessments={assessments} />
          <QuizList assessments={assessments} />
        </>
      )}

      {/* ── First-time nudge ── */}
      {total === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 gap-2 text-center">
            <Brain className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              Pick a skill above to take your first quiz
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Your skill levels will start tracking as soon as you complete a
              quiz
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
