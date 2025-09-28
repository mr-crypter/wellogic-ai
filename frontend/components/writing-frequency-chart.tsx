"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"
import { getNotesStats } from "@/lib/api"

interface WritingFrequencyChartProps {
  timeRange: string
}

type Row = { day: string; entries: number }

export function WritingFrequencyChart({ timeRange }: WritingFrequencyChartProps) {
  const [data, setData] = useState<Row[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const days = (() => {
          const m = timeRange.match(/\d+/)
          const n = m ? parseInt(m[0], 10) : 30
          return Math.min(365, Math.max(1, n))
        })()
        const stats = await getNotesStats(days)
        if (cancelled) return
        const dow = new Map<string, number>([
          ["Sun", 0], ["Mon", 0], ["Tue", 0], ["Wed", 0], ["Thu", 0], ["Fri", 0], ["Sat", 0],
        ])
        for (const row of (stats.data || []) as Array<{ date: string; note_count: number }>) {
          const d = new Date(row.date)
          const label = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()]
          dow.set(label, (dow.get(label) || 0) + Number(row.note_count || 0))
        }
        const arr: Row[] = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((k) => ({ day: k, entries: dow.get(k) || 0 }))
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
        <CardTitle>Writing Frequency</CardTitle>
        <CardDescription>Your journaling activity patterns throughout the week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
