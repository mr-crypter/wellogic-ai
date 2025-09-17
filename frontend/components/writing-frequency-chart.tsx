"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface WritingFrequencyChartProps {
  timeRange: string
}

// Mock data - replace with real data from Supabase
const mockData = [
  { day: "Mon", entries: 12, words: 2400 },
  { day: "Tue", entries: 8, words: 1600 },
  { day: "Wed", entries: 15, words: 3200 },
  { day: "Thu", entries: 10, words: 2100 },
  { day: "Fri", entries: 6, words: 1200 },
  { day: "Sat", entries: 18, words: 3800 },
  { day: "Sun", entries: 14, words: 2900 },
]

export function WritingFrequencyChart({ timeRange }: WritingFrequencyChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Writing Frequency</CardTitle>
        <CardDescription>Your journaling activity patterns throughout the week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="day" className="text-xs fill-muted-foreground" />
              <YAxis className="text-xs fill-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="entries" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
