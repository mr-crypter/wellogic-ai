"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, Target } from "lucide-react"

interface MonthlyReportProps {
  reportId: string
}

export function MonthlyReport({ reportId }: MonthlyReportProps) {
  // Mock data - replace with real AI-generated report data
  const reportData = {
    period: "December 2023",
    totalEntries: 28,
    totalWords: 12450,
    averageMood: 7.5,
    moodImprovement: "+12%",
    majorThemes: [
      { theme: "Career Growth", mentions: 15, trend: "up" },
      { theme: "Family Relationships", mentions: 12, trend: "stable" },
      { theme: "Personal Health", mentions: 8, trend: "down" },
    ],
    achievements: [
      "Maintained consistent journaling for 25 out of 31 days",
      "Showed significant improvement in handling work stress",
      "Developed clearer long-term career goals",
    ],
    areasForGrowth: [
      "Health and wellness could use more attention",
      "Social connections mentioned less frequently",
      "Financial planning rarely discussed",
    ],
  }

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
              <CardDescription>{reportData.period}</CardDescription>
            </div>
            <Badge variant="default" className="bg-purple-500">
              Comprehensive Analysis
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{reportData.totalEntries}</div>
              <div className="text-sm text-muted-foreground">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{reportData.totalWords.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Words Written</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{reportData.averageMood}/10</div>
              <div className="text-sm text-muted-foreground">Average Mood</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{reportData.moodImprovement}</div>
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
            {reportData.majorThemes.map((item) => (
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
              {reportData.achievements.map((achievement, index) => (
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
              {reportData.areasForGrowth.map((area, index) => (
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
