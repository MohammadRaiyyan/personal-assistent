import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Progress } from '@/components/ui/progress'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Brain,
  BriefcaseIcon,
  LineChart,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import type { Insight } from '../../../../../shared/types/api'

const salaryChartConfig = {
  min: {
    label: 'Min Salary (K)',
    color: '#94a3b8',
  },
  median: {
    label: 'Median Salary (K)',
    color: '#64748b',
  },
  max: {
    label: 'Max Salary (K)',
    color: '#475569',
  },
} satisfies ChartConfig

const Insights = ({ insights }: { insights: Insight }) => {
  const salaryData = insights.salaryRanges.map((range) => ({
    name: range.role,
    min: range.min / 1000,
    max: range.max / 1000,
    median: range.median / 1000,
  }))

  const getDemandLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-green-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getMarketOutlookInfo = (outlook: string) => {
    switch (outlook.toLowerCase()) {
      case 'positive':
        return { icon: TrendingUp, color: 'text-green-500' }
      case 'neutral':
        return { icon: LineChart, color: 'text-yellow-500' }
      case 'negative':
        return { icon: TrendingDown, color: 'text-red-500' }
      default:
        return { icon: LineChart, color: 'text-gray-500' }
    }
  }

  const OutlookIcon = getMarketOutlookInfo(insights.marketOutlook).icon
  const outlookColor = getMarketOutlookInfo(insights.marketOutlook).color

  const lastUpdatedDate = format(new Date(insights.lastUpdated), 'dd/MM/yyyy')
  const nextUpdateDistance = formatDistanceToNow(
    new Date(insights.nextUpdate),
    { addSuffix: true },
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Badge variant="outline">Last updated: {lastUpdatedDate}</Badge>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Market Sentiment
            </CardTitle>
            <OutlookIcon className={`h-4 w-4 ${outlookColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.marketOutlook}</div>
            <p className="text-xs text-muted-foreground">
              Next update expected {nextUpdateDistance}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Industry Growth Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.jobGrowth.toFixed(1)}%
            </div>
            <Progress value={insights.jobGrowth} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Talent Demand</CardTitle>
            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.demandLevel}</div>
            <div
              className={`h-2 w-full rounded-full mt-2 ${getDemandLevelColor(
                insights.demandLevel,
              )}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              In-Demand Skills
            </CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mt-2">
              {insights.keySkills.map((skill) => (
                <Badge key={skill} variant="default">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Ranges Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Salary Distribution by Role</CardTitle>
          <CardDescription>
            Overview of minimum, median, and maximum salaries (in thousands)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={salaryChartConfig} className="h-100 w-full">
            <BarChart accessibilityLayer data={salaryData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="min" fill="var(--chart-1)" radius={4} />
              <Bar dataKey="median" fill="var(--chart-2)" radius={4} />
              <Bar dataKey="max" fill="var(--chart-3)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Industry Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Emerging Industry Trends</CardTitle>
            <CardDescription>
              Notable developments influencing the sector
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {insights.keyTrends.map((trend, index) => (
                <li key={index}>
                  <Badge
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <div className="h-2 w-2  rounded-full bg-primary" />
                    <span>{trend}</span>
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skill Development Suggestions</CardTitle>
            <CardDescription>Recommended areas to upskill</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insights.recommendedSkills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Insights
