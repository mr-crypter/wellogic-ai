"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, TrendingUp, BarChart3, PieChart, Activity } from "lucide-react"
import { MoodTrendsChart } from "@/components/mood-trends-chart"
import { getNotesStats, getNoteStreaks, getMoodTrends, getDailyReport } from "@/lib/api"
import { WritingFrequencyChart } from "@/components/writing-frequency-chart"
import { TopicsAnalysisChart } from "@/components/topics-analysis-chart"
import { MoodDistributionChart } from "@/components/mood-distribution-chart"
import { WritingStreakChart } from "@/components/writing-streak-chart"

export default function TrendsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedMetric, setSelectedMetric] = useState("mood")
  const [totalEntries, setTotalEntries] = useState<string>("-")
  const [thisWeek, setThisWeek] = useState<string>("-")
  const [streak, setStreak] = useState<string>("-")
  const [avgMood, setAvgMood] = useState<string>("-")
  const [topTag, setTopTag] = useState<string>("-")
  const [history, setHistory] = useState<Array<{ date: string; count: number; snippet: string }>>([])

  const timeRanges = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 3 months" },
    { value: "1y", label: "Last year" },
  ]

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const days = (() => {
          const m = timeRange.match(/\d+/)
          const n = m ? parseInt(m[0], 10) : 30
          return Math.min(365, Math.max(1, n))
        })()
        const [stats, streaks, trends, weekStats] = await Promise.all([
          getNotesStats(days),
          getNoteStreaks(),
          getMoodTrends(timeRange),
          getNotesStats(7),
        ])
        if (cancelled) return
        const total = (stats.data || []).reduce((acc, d) => acc + Number(d.note_count || 0), 0)
        setTotalEntries(String(total))
        const weekTotal = (weekStats.data || []).reduce((acc: number, d: any) => acc + Number(d.note_count || 0), 0)
        setThisWeek(String(weekTotal))
        setStreak(`${streaks.current_streak} days`)
        const moods: number[] = (trends.data || []).map((d: any) => (d.avg_ai_mood ?? d.avg_mood ?? null)).filter((x: any) => typeof x === 'number')
        const avg = moods.length ? (moods.reduce((a: number,b: number)=>a+b,0) / moods.length) : 0
        setAvgMood(avg ? avg.toFixed(1) : "-")
        // compute top tag from recent days via daily reports
        const today = new Date()
        const dates: string[] = []
        for (let i = 0; i < Math.min(days, 30); i++) { // cap to 30 for perf
          const d = new Date(today)
          d.setDate(d.getDate() - i)
          dates.push(d.toISOString().slice(0,10))
        }
        const reports = await Promise.all(dates.map((d) => getDailyReport(d).catch(() => null)))
        if (cancelled) return
        const tagCount: Record<string, number> = {}
        const historyRows: Array<{ date: string; count: number; snippet: string }> = []
        for (const rep of reports) {
          const items = rep?.items || []
          if (rep?.date) {
            historyRows.push({
              date: String(rep.date).slice(0,10),
              count: items.length,
              snippet: items[0]?.note?.content ? String(items[0].note.content).slice(0,120) : "",
            })
          }
          for (const it of items) {
            const tags: string[] = it.tags || []
            for (const t of tags) tagCount[t] = (tagCount[t] || 0) + 1
          }
        }
        const top = Object.entries(tagCount).sort((a,b)=>b[1]-a[1])[0]?.[0] || "-"
        setTopTag(top)
        setHistory(historyRows.filter(r => r.count > 0).sort((a,b) => (a.date < b.date ? 1 : -1)).slice(0, 14))
      } catch {
        if (cancelled) return
        setTotalEntries("-")
        setThisWeek("-")
        setStreak("-")
        setAvgMood("-")
        setTopTag("-")
        setHistory([])
      }
    }
    load()
    return () => { cancelled = true }
  }, [timeRange])

  const keyMetrics = [
    { title: "Total Entries", value: totalEntries, change: "", trend: "neutral", icon: BarChart3 },
    { title: "This Week", value: thisWeek, change: "", trend: "neutral", icon: Activity },
    { title: "Writing Streak", value: streak, change: "", trend: "neutral", icon: Activity },
    { title: "Avg. Mood Score", value: avgMood, change: "", trend: "neutral", icon: TrendingUp },
    { title: "Most Common Tag", value: topTag, change: "", trend: "neutral", icon: PieChart },
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Trends & Analytics</h1>
            <p className="text-muted-foreground">Discover patterns in your journaling journey</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <CalendarDays className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {keyMetrics.map((metric) => {
            const Icon = metric.icon
            return (
              <Card key={metric.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Badge
                      variant={
                        metric.trend === "up" ? "default" : metric.trend === "down" ? "destructive" : "secondary"
                      }
                      className="text-xs"
                    >
                      {metric.change}
                    </Badge>
                    <span>from last period</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts */}
        <Tabs defaultValue="mood" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="mood">Mood Trends</TabsTrigger>
            <TabsTrigger value="frequency">Writing Frequency</TabsTrigger>
            <TabsTrigger value="topics">Topics Analysis</TabsTrigger>
            <TabsTrigger value="distribution">Mood Distribution</TabsTrigger>
            <TabsTrigger value="streaks">Writing Streaks</TabsTrigger>
          </TabsList>

          <TabsContent value="mood" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MoodTrendsChart timeRange={timeRange} />
              </div>
              <div className="space-y-6">
                <MoodDistributionChart timeRange={timeRange} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="frequency" className="space-y-6">
            <WritingFrequencyChart timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="topics" className="space-y-6">
            <TopicsAnalysisChart timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <MoodDistributionChart timeRange={timeRange} />
              <Card>
                <CardHeader>
                  <CardTitle>Mood Insights</CardTitle>
                  <CardDescription>Key patterns in your emotional journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Most positive day</span>
                      <Badge variant="outline">Monday</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Most reflective time</span>
                      <Badge variant="outline">Evening</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mood improvement</span>
                      <Badge variant="default">+15% this month</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Consistency score</span>
                      <Badge variant="outline">8.5/10</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="streaks" className="space-y-6">
            <WritingStreakChart timeRange={timeRange} />
          </TabsContent>
        </Tabs>
        {/* Recent History */}
        <div className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle>Recent History</CardTitle>
              <CardDescription>Past entries by day</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-sm text-muted-foreground">No recent entries.</div>
              ) : (
                <div className="space-y-3">
                  {history.map((h) => (
                    <div key={h.date} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <div className="text-sm font-medium">{new Date(h.date).toLocaleDateString()}</div>
                        {h.snippet && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{h.snippet}</div>
                        )}
                      </div>
                      <Badge variant="outline">{h.count} entr{h.count === 1 ? "y" : "ies"}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
