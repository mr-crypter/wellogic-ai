"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flame, Target } from "lucide-react"

interface WritingStreakChartProps {
  timeRange: string
}

// Mock data - replace with real data from Supabase
const streakData = {
  currentStreak: 14,
  longestStreak: 28,
  totalDays: 127,
  streakGoal: 30,
  weeklyGoal: 5,
  monthlyGoal: 20,
}

const recentActivity = [
  { date: "2024-01-15", hasEntry: true },
  { date: "2024-01-14", hasEntry: true },
  { date: "2024-01-13", hasEntry: true },
  { date: "2024-01-12", hasEntry: false },
  { date: "2024-01-11", hasEntry: true },
  { date: "2024-01-10", hasEntry: true },
  { date: "2024-01-09", hasEntry: true },
]

export function WritingStreakChart({ timeRange }: WritingStreakChartProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Writing Streaks
          </CardTitle>
          <CardDescription>Track your consistency and build habits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-500">{streakData.currentStreak}</div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{streakData.longestStreak}</div>
              <div className="text-sm text-muted-foreground">Longest Streak</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Streak Goal Progress</span>
              <Badge variant="outline">
                {streakData.currentStreak}/{streakData.streakGoal} days
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${(streakData.currentStreak / streakData.streakGoal) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Activity</h4>
            <div className="grid grid-cols-7 gap-1">
              {recentActivity.map((day, index) => (
                <div
                  key={day.date}
                  className={`w-8 h-8 rounded-sm flex items-center justify-center text-xs ${
                    day.hasEntry ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {new Date(day.date).getDate()}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Goals & Achievements
          </CardTitle>
          <CardDescription>Track your progress towards writing goals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Weekly Goal</span>
                <Badge variant="default">5/5 entries</Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Monthly Goal</span>
                <Badge variant="outline">18/20 entries</Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "90%" }} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Achievements</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">7-day streak completed</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm">100 total entries</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span className="text-sm">First month completed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
