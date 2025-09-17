"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface TopicsAnalysisChartProps {
  timeRange: string
}

// Mock data - replace with real data from AI analysis
const mockTopics = [
  { topic: "Personal Growth", count: 45, percentage: 35, trend: "up" },
  { topic: "Work & Career", count: 32, percentage: 25, trend: "stable" },
  { topic: "Relationships", count: 28, percentage: 22, trend: "up" },
  { topic: "Health & Wellness", count: 18, percentage: 14, trend: "down" },
  { topic: "Hobbies & Interests", count: 12, percentage: 9, trend: "up" },
  { topic: "Travel & Adventure", count: 8, percentage: 6, trend: "stable" },
  { topic: "Financial Goals", count: 6, percentage: 5, trend: "up" },
  { topic: "Learning & Education", count: 4, percentage: 3, trend: "stable" },
]

const sentimentData = [
  { sentiment: "Positive", count: 89, percentage: 70, color: "bg-green-500" },
  { sentiment: "Neutral", count: 28, percentage: 22, color: "bg-yellow-500" },
  { sentiment: "Negative", count: 10, percentage: 8, color: "bg-red-500" },
]

export function TopicsAnalysisChart({ timeRange }: TopicsAnalysisChartProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Most Discussed Topics</CardTitle>
          <CardDescription>AI-identified themes in your journal entries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">7.2/10</div>
              <div className="text-sm text-muted-foreground">Average Sentiment Score</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
