"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, Target } from "lucide-react"
import { getWeeklyReport, getDailyReport } from "@/lib/api"

interface MonthlyReportProps {
  reportId: string
}

export function MonthlyReport({ reportId }: MonthlyReportProps) {
  const [period, setPeriod] = useState<string>("")
  const [totalEntries, setTotalEntries] = useState<number>(0)
  const [totalWords, setTotalWords] = useState<number>(0)
  const [averageMood, setAverageMood] = useState<number>(0)
  const [moodImprovement, setMoodImprovement] = useState<string>("")
  const [majorThemes, setMajorThemes] = useState<{ theme: string; mentions: number; trend: "up"|"down"|"stable" }[]>([])
  const [achievements, setAchievements] = useState<string[]>([])
  const [areasForGrowth, setAreasForGrowth] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const today = new Date()
        const start = new Date(today.getFullYear(), today.getMonth(), 1)
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        setPeriod(`${start.toLocaleDateString()} - ${end.toLocaleDateString()}`)

        // Build list of weeks in month (ending Saturdays or month end)
        const trendAverages: number[] = []
        const tagCount: Record<string, number> = {}
        let entries = 0, words = 0
        const achievementsList: string[] = []
        const growthList: string[] = []
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
          const wEnd = new Date(Math.min(end.getTime(), new Date(d.getFullYear(), d.getMonth(), d.getDate() + 6).getTime()))
          const weekly = await getWeeklyReport(wEnd.toISOString().slice(0,10)).catch(() => null)
          if (weekly?.trends?.length) {
            const avg = weekly.trends.reduce((s: number, r: any) => s + (r.avg_ai_mood ?? r.avg_mood ?? 0), 0) / weekly.trends.length
            trendAverages.push(avg)
          }
        }
        // Daily aggregation across month
        const allDates: string[] = []
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          allDates.push(new Date(d).toISOString().slice(0,10))
        }
        const daily = await Promise.all(allDates.map(dt => getDailyReport(dt).catch(() => null)))
        for (const day of daily) {
          if (!day) continue
          const items = day.items || []
          entries += items.length
          for (const it of items) {
            if (it.note?.content) words += (String(it.note.content).split(/\s+/).filter(Boolean).length)
            const tags: string[] = it.tags || []
            for (const t of tags) tagCount[t] = (tagCount[t] || 0) + 1
          }
        }
        if (cancelled) return
        setTotalEntries(entries)
        setTotalWords(words)
        const avgMood = trendAverages.length ? (trendAverages.reduce((a,b)=>a+b,0)/trendAverages.length) : 0
        setAverageMood(Number(avgMood.toFixed(1)))
        if (trendAverages.length >= 2) {
          const diff = trendAverages[trendAverages.length - 1] - trendAverages[0]
          setMoodImprovement(`${diff >= 0 ? "+" : ""}${diff.toFixed(1)}`)
        } else {
          setMoodImprovement("")
        }
        const themes = Object.entries(tagCount).sort((a,b) => b[1]-a[1]).slice(0,5).map(([theme, mentions]) => ({ theme, mentions: Number(mentions), trend: "stable" as const }))
        setMajorThemes(themes)
        setAchievements([])
        setAreasForGrowth([])
      } catch {
        if (cancelled) return
        setTotalEntries(0)
        setTotalWords(0)
        setAverageMood(0)
        setMoodImprovement("")
        setMajorThemes([])
        setAchievements([])
        setAreasForGrowth([])
      }
    }
    load()
    return () => { cancelled = true }
  }, [reportId])

  return (
    <div className="space-y-6">
      {/* Monthly Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Monthly Deep Dive
              </CardTitle>
              <CardDescription>{period || ""}</CardDescription>
            </div>
            <Badge variant="default" className="bg-purple-500">
              Comprehensive Analysis
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalEntries}</div>
              <div className="text-sm text-muted-foreground">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalWords.toLocaleString?.() ?? totalWords}</div>
              <div className="text-sm text-muted-foreground">Words Written</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{averageMood}/10</div>
              <div className="text-sm text-muted-foreground">Average Mood</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{moodImprovement}</div>
              <div className="text-sm text-muted-foreground">Mood Improvement</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Major Themes */}
      <Card>
        <CardHeader>
          <CardTitle>Major Life Themes</CardTitle>
          <CardDescription>What occupied your thoughts this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {majorThemes.length === 0 && (
              <div className="text-sm text-muted-foreground">No themes yet.</div>
            )}
            {majorThemes.map((item) => (
              <div key={item.theme} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h4 className="font-medium">{item.theme}</h4>
                  <p className="text-sm text-muted-foreground">{item.mentions} mentions this month</p>
                </div>
                <Badge variant={item.trend === "up" ? "default" : item.trend === "down" ? "destructive" : "secondary"}>
                  {item.trend === "up" ? "↗" : item.trend === "down" ? "↘" : "→"} {item.trend}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements and Growth Areas */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Key Achievements
            </CardTitle>
            <CardDescription>What you accomplished this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.length === 0 && (
                <div className="text-sm text-muted-foreground">No achievements yet.</div>
              )}
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm leading-relaxed">{achievement}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-500" />
              Areas for Growth
            </CardTitle>
            <CardDescription>Opportunities for development</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {areasForGrowth.length === 0 && (
                <div className="text-sm text-muted-foreground">No growth areas yet.</div>
              )}
              {areasForGrowth.map((area, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm leading-relaxed">{area}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
