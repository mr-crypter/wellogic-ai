"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface MoodDistributionChartProps {
  timeRange: string
}

// Mock data - replace with real data from Supabase
const mockData = [
  { name: "Happy", value: 35, color: "#22c55e" },
  { name: "Content", value: 28, color: "#3b82f6" },
  { name: "Excited", value: 15, color: "#a855f7" },
  { name: "Neutral", value: 12, color: "#eab308" },
  { name: "Stressed", value: 7, color: "#ef4444" },
  { name: "Sad", value: 3, color: "#f97316" },
]

export function MoodDistributionChart({ timeRange }: MoodDistributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Distribution</CardTitle>
        <CardDescription>Breakdown of your emotional states</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mockData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {mockData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
