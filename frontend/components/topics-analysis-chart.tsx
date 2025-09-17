"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface TopicsAnalysisChartProps {
  timeRange: string
}

// No sample topics — provide empty defaults until AI data is wired
const mockTopics: { topic: string; count: number; percentage: number; trend: "up"|"down"|"stable" }[] = []

// No sample sentiment — provide empty defaults
const sentimentData: { sentiment: string; count: number; percentage: number; color: string }[] = []

export function TopicsAnalysisChart({ timeRange }: TopicsAnalysisChartProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Most Discussed Topics</CardTitle>
          <CardDescription>AI-identified themes in your journal entries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockTopics.length === 0 && (
            <div className="text-sm text-muted-foreground">No topic analysis yet.</div>
          )}
          {mockTopics.map((topic) => (
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
          {sentimentData.length === 0 && (
            <div className="text-sm text-muted-foreground">No sentiment data yet.</div>
          )}
          {sentimentData.map((sentiment) => (
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

          {sentimentData.length > 0 && (
            <div className="pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">7.2/10</div>
                <div className="text-sm text-muted-foreground">Average Sentiment Score</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
