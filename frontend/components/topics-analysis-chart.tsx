"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { getDailyReport } from "@/lib/api"

interface TopicsAnalysisChartProps {
  timeRange: string
}

type TopicRow = { topic: string; count: number; percentage: number; trend: "up"|"down"|"stable" }
type SentimentRow = { sentiment: string; count: number; percentage: number; color: string }

export function TopicsAnalysisChart({ timeRange }: TopicsAnalysisChartProps) {
  const [topics, setTopics] = useState<TopicRow[]>([])
  const [sentiments, setSentiments] = useState<SentimentRow[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const days = (() => {
          const m = timeRange.match(/\d+/)
          const n = m ? parseInt(m[0], 10) : 30
          return Math.min(60, Math.max(1, n))
        })()
        const today = new Date()
        const dates: string[] = []
        for (let i = 0; i < days; i++) {
          const d = new Date(today)
          d.setDate(d.getDate() - i)
          dates.push(d.toISOString().slice(0,10))
        }
        const reports = await Promise.all(dates.map((d) => getDailyReport(d).catch(() => null)))
        if (cancelled) return
        const tagCount: Record<string, number> = {}
        const sentCount: Record<string, number> = { positive: 0, neutral: 0, negative: 0 }
        for (const rep of reports) {
          const items = rep?.items || []
          for (const it of items) {
            const tags: string[] = it.tags || []
            for (const t of tags) tagCount[t] = (tagCount[t] || 0) + 1
            const pol = (it.sentiment?.polarity || "").toLowerCase()
            if (pol === "positive" || pol === "neutral" || pol === "negative") sentCount[pol]++
          }
        }
        const totalTags = Object.values(tagCount).reduce((a,b)=>a+b,0) || 1
        const top = Object.entries(tagCount).sort((a,b)=>b[1]-a[1]).slice(0,5)
        setTopics(top.map(([k,v]) => ({ topic: k, count: v, percentage: Math.round((v/totalTags)*100), trend: "stable" })))
        const totalSent = Object.values(sentCount).reduce((a,b)=>a+b,0) || 1
        const COLORS: Record<string,string> = { positive: "bg-green-500", neutral: "bg-yellow-500", negative: "bg-red-500" }
        setSentiments(Object.entries(sentCount).map(([k,v]) => ({ sentiment: k, count: v, percentage: Math.round((v/totalSent)*100), color: COLORS[k] })))
      } catch {
        if (cancelled) return
        setTopics([])
        setSentiments([])
      }
    }
    load()
    return () => { cancelled = true }
  }, [timeRange])
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Most Discussed Topics</CardTitle>
          <CardDescription>AI-identified themes in your journal entries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {topics.length === 0 && (
            <div className="text-sm text-muted-foreground">No topic analysis yet.</div>
          )}
          {topics.map((topic) => (
            <div key={topic.topic} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{topic.topic}</span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={topic.trend === "up" ? "default" : topic.trend === "down" ? "destructive" : "secondary"}
                  >
                    {topic.count} entries
                  </Badge>
                </div>
              </div>
              <Progress value={topic.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sentiment Analysis</CardTitle>
          <CardDescription>Overall emotional tone of your entries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {sentiments.length === 0 && (
            <div className="text-sm text-muted-foreground">No sentiment data yet.</div>
          )}
          {sentiments.map((sentiment) => (
            <div key={sentiment.sentiment} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{sentiment.sentiment}</span>
                <span className="text-sm text-muted-foreground">{sentiment.count} entries</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${sentiment.color}`}
                    style={{ width: `${sentiment.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{sentiment.percentage}%</span>
              </div>
            </div>
          ))}

          {sentiments.length > 0 && (
            <div className="pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{(() => {
                  const pos = sentiments.find(s => s.sentiment === 'positive')?.percentage || 0
                  const neu = sentiments.find(s => s.sentiment === 'neutral')?.percentage || 0
                  // crude score: map positive->1, neutral->0.5, negative->0
                  return ((pos * 1 + neu * 0.5) / 100 * 10).toFixed(1)
                })()}</div>
                <div className="text-sm text-muted-foreground">Average Sentiment Score</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
