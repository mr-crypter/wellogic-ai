"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Target, BookOpen, Users, Heart, Zap } from "lucide-react"

interface GrowthRecommendationsProps {
  reportId: string
}

export function GrowthRecommendations({ reportId }: GrowthRecommendationsProps) {
  const recommendations = [
    {
      category: "Emotional Wellbeing",
      icon: Heart,
      color: "text-red-500",
      priority: "high",
      recommendations: [
        {
          title: "Expand Your Gratitude Practice",
          description:
            "Your gratitude entries show the highest positive impact. Consider dedicating 5 minutes daily to detailed gratitude reflection.",
          actionable: "Set a daily reminder for gratitude journaling",
          difficulty: "Easy",
        },
        {
          title: "Stress Management Techniques",
          description: "Work stress patterns suggest you'd benefit from proactive stress management strategies.",
          actionable: "Try the 4-7-8 breathing technique during stressful moments",
          difficulty: "Medium",
        },
      ],
    },
    {
      category: "Personal Growth",
      icon: Target,
      color: "text-purple-500",
      priority: "high",
      recommendations: [
        {
          title: "Goal Clarity Enhancement",
          description: "Your entries show strong motivation but could benefit from more specific goal-setting.",
          actionable: "Write SMART goals for your top 3 priorities",
          difficulty: "Medium",
        },
        {
          title: "Reflection Depth",
          description: "Your self-awareness is growing. Consider exploring 'why' questions more deeply.",
          actionable: "End each entry with 'What did I learn about myself today?'",
          difficulty: "Easy",
        },
      ],
    },
    {
      category: "Relationships & Social",
      icon: Users,
      color: "text-blue-500",
      priority: "medium",
      recommendations: [
        {
          title: "Social Connection Tracking",
          description:
            "Social interactions boost your mood significantly. Consider tracking and planning more social activities.",
          actionable: "Schedule one meaningful social interaction per week",
          difficulty: "Easy",
        },
      ],
    },
    {
      category: "Health & Energy",
      icon: Zap,
      color: "text-green-500",
      priority: "medium",
      recommendations: [
        {
          title: "Exercise-Mood Connection",
          description: "Physical activity consistently improves your mood. Consider making it more regular.",
          actionable: "Track exercise and mood correlation for 2 weeks",
          difficulty: "Medium",
        },
      ],
    },
  ]

  const journalPrompts = [
    "What am I most grateful for this week, and why?",
    "What challenge am I facing, and what would my future self advise?",
    "How have I grown in the past month?",
    "What patterns do I notice in my thoughts and behaviors?",
    "What would I do if I knew I couldn't fail?",
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            Personalized Growth Recommendations
          </CardTitle>
          <CardDescription>
            AI-curated suggestions based on your journaling patterns and personal insights
          </CardDescription>
        </CardHeader>
      </Card>

      {recommendations.map((category) => {
        const Icon = category.icon
        return (
          <Card key={category.category}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${category.color}`} />
                  {category.category}
                </CardTitle>
                <Badge variant={category.priority === "high" ? "default" : "secondary"}>
                  {category.priority} priority
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {category.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium">{rec.title}</h4>
                      <Badge variant="outline">{rec.difficulty}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{rec.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${category.color.replace("text-", "bg-")}`} />
                        <span className="text-sm font-medium">{rec.actionable}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Try This
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Journal Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Recommended Journal Prompts
          </CardTitle>
          <CardDescription>Thought-provoking questions tailored to your growth areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {journalPrompts.map((prompt, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm leading-relaxed">{prompt}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
