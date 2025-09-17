"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface MoodTrendsChartProps {
  timeRange: string
}

// Mock data - replace with real data from Supabase
const mockData = [
  { date: "Jan 1", mood: 7, entries: 2 },
  { date: "Jan 2", mood: 6, entries: 1 },
  { date: "Jan 3", mood: 8, entries: 3 },
  { date: "Jan 4", mood: 7, entries: 1 },
  { date: "Jan 5", mood: 9, entries: 2 },
  { date: "Jan 6", mood: 6, entries: 1 },
  { date: "Jan 7", mood: 8, entries: 2 },
  { date: "Jan 8", mood: 7, entries: 1 },
  { date: "Jan 9", mood: 8, entries: 3 },
  { date: "Jan 10", mood: 9, entries: 2 },
  { date: "Jan 11", mood: 7, entries: 1 },
  { date: "Jan 12", mood: 8, entries: 2 },
  { date: "Jan 13", mood: 6, entries: 1 },
  { date: "Jan 14", mood: 9, entries: 3 },
  { date: "Jan 15", mood: 8, entries: 2 },
]

export function MoodTrendsChart({ timeRange }: MoodTrendsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Trends Over Time</CardTitle>
        <CardDescription>Track your emotional patterns and identify trends</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs fill-muted-foreground" />
              <YAxis domain={[1, 10]} className="text-xs fill-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
