"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, TrendingUp, BarChart3, PieChart, Activity } from "lucide-react"
import { MoodTrendsChart } from "@/components/mood-trends-chart"
import { getNotesStats, getNoteStreaks } from "@/lib/api"
import { WritingFrequencyChart } from "@/components/writing-frequency-chart"
import { TopicsAnalysisChart } from "@/components/topics-analysis-chart"
import { MoodDistributionChart } from "@/components/mood-distribution-chart"
import { WritingStreakChart } from "@/components/writing-streak-chart"

export default function TrendsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedMetric, setSelectedMetric] = useState("mood")
  const [totalEntries, setTotalEntries] = useState<string>("-")
  const [streak, setStreak] = useState<string>("-")
  const [avgMood, setAvgMood] = useState<string>("-")
  const [topTag, setTopTag] = useState<string>("-")

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
        const [stats, streaks] = await Promise.all([
          getNotesStats(days),
          getNoteStreaks(),
        ])
        if (cancelled) return
        const total = (stats.data || []).reduce((acc, d) => acc + Number(d.note_count || 0), 0)
        setTotalEntries(String(total))
        setStreak(`${streaks.current_streak} days`)
      } catch {
        if (cancelled) return
        setTotalEntries("-")
        setStreak("-")
      }
    }
    load()
    return () => { cancelled = true }
  }, [timeRange])

  const keyMetrics = [
    { title: "Total Entries", value: totalEntries, change: "", trend: "neutral", icon: BarChart3 },
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
      </div>
    </div>
  )
}
