"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Heart, Zap, Shield } from "lucide-react"

interface PersonalInsightsProps {
  reportId: string
}

export function PersonalInsights({ reportId }: PersonalInsightsProps) {
  const insights = [
    {
      category: "Emotional Patterns",
      icon: Heart,
      color: "text-red-500",
      insights: [
        "You tend to feel most positive on weekends when spending time with family",
        "Work-related stress peaks on Mondays and Wednesdays",
        "Your mood significantly improves after physical exercise or outdoor activities",
        "Evening journaling sessions show deeper emotional processing",
      ],
    },
    {
      category: "Cognitive Patterns",
      icon: Brain,
      color: "text-purple-500",
      insights: [
        "Your problem-solving approach has become more systematic over time",
        "You frequently use metaphors and analogies when processing complex situations",
        "Self-reflection depth increases during challenging periods",
        "Goal-setting language appears more frequently in recent entries",
      ],
    },
    {
      category: "Energy & Motivation",
      icon: Zap,
      color: "text-yellow-500",
      insights: [
        "Energy levels correlate strongly with sleep quality mentions",
        "Creative projects and learning new skills boost your motivation",
        "Social interactions consistently improve your energy levels",
        "Routine disruptions initially cause stress but often lead to growth",
      ],
    },
    {
      category: "Resilience & Coping",
      icon: Shield,
      color: "text-green-500",
      insights: [
        "Your coping strategies have diversified and become more effective",
        "You increasingly seek support from others when facing challenges",
        "Gratitude practice has become a consistent resilience tool",
        "Recovery time from setbacks has decreased significantly",
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Personal Insights Dashboard
          </CardTitle>
          <CardDescription>
            Deep AI analysis of your personality patterns, emotional trends, and behavioral insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Personality Traits Identified</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Reflective</Badge>
                <Badge variant="outline">Goal-Oriented</Badge>
                <Badge variant="outline">Empathetic</Badge>
                <Badge variant="outline">Growth-Minded</Badge>
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Communication Style</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Analytical</Badge>
                <Badge variant="outline">Narrative</Badge>
                <Badge variant="outline">Solution-Focused</Badge>
                <Badge variant="outline">Authentic</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {insights.map((category) => {
        const Icon = category.icon
        return (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${category.color}`} />
                {category.category}
              </CardTitle>
              <CardDescription>AI-identified patterns in your {category.category.toLowerCase()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${category.color.replace("text-", "bg-")}`}
                    />
                    <p className="text-sm leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
