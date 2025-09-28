"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { useEffect, useState } from "react"
import { getDailyReport } from "@/lib/api"

interface MoodDistributionChartProps {
  timeRange: string
}

type Slice = { name: string; value: number; color: string }
const COLORS: Record<string, string> = {
  positive: "#22c55e",
  neutral: "#eab308",
  negative: "#ef4444",
}

export function MoodDistributionChart({ timeRange }: MoodDistributionChartProps) {
  const [data, setData] = useState<Slice[]>([])

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
          dates.push(d.toISOString().slice(0, 10))
        }
        const reports = await Promise.all(dates.map((d) => getDailyReport(d).catch(() => null)))
        if (cancelled) return
        const counts: Record<string, number> = { positive: 0, neutral: 0, negative: 0 }
        for (const rep of reports) {
          const items = rep?.items || []
          for (const it of items) {
            const pol = (it.sentiment?.polarity || "").toLowerCase()
            if (pol === "positive" || pol === "neutral" || pol === "negative") {
              counts[pol]++
            }
          }
        }
        const arr: Slice[] = ["positive", "neutral", "negative"].map((k) => ({ name: k, value: counts[k] || 0, color: COLORS[k] }))
        setData(arr)
      } catch {
        if (cancelled) return
        setData([])
      }
    }
    load()
    return () => { cancelled = true }
  }, [timeRange])

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
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
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
