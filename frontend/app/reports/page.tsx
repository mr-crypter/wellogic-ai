"use client"

import { useAuth } from "@/hooks/use-auth"
import { ReactNode, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Brain,
  Download,
  Share,
  Calendar,
  TrendingUp,
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
  BarChart3,
  Activity,
  Heart,
} from "lucide-react"
import { WeeklyReport } from "@/components/weekly-report"
import { MonthlyReport } from "@/components/monthly-report"
import { PersonalInsights } from "@/components/personal-insights"
import { GrowthRecommendations } from "@/components/growth-recommendations"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { getWeeklyReport } from "@/lib/api"

type TrendRow = {
  context: ReactNode;
  date: string;
  aiMood: number | null;
  aiProductivity: number | null;
  selfReported?: number | null;
  aiSentiment?: number | null;
};

export default function ReportsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState("weekly")
  const [selectedReport, setSelectedReport] = useState("latest")
  const [showSelfReported, setShowSelfReported] = useState(true)
  const [showComparison, setShowComparison] = useState(false)
  const [comparisonRange, setComparisonRange] = useState([7])
  const [showDailyInsights, setShowDailyInsights] = useState(false)
  const [trendData, setTrendData] = useState<TrendRow[]>([])
  const [previousWeekData, setPreviousWeekData] = useState<TrendRow[]>([])

  useEffect(() => {
    let cancelled = false
    const fetchTrends = async () => {
      try {
        const today = new Date()
        const endStr = today.toISOString().slice(0, 10)
        const prevEnd = new Date(today)
        prevEnd.setDate(prevEnd.getDate() - 7)
        const prevEndStr = prevEnd.toISOString().slice(0, 10)
        const [curr, prev] = await Promise.all([
          getWeeklyReport(endStr),
          getWeeklyReport(prevEndStr),
        ])
        if (cancelled) return
        setTrendData((curr.trends || []).map((d: any) => ({
          date: String(d.date).slice(0,10),
          aiMood: d.avg_ai_mood ?? d.avg_mood ?? null,
          aiProductivity: d.avg_ai_productivity ?? null,
          selfReported: null,
          aiSentiment: null,
        })))
        setPreviousWeekData((prev.trends || []).map((d: any) => ({
          date: String(d.date).slice(0,10),
          aiMood: d.avg_ai_mood ?? d.avg_mood ?? null,
          aiProductivity: d.avg_ai_productivity ?? null,
          selfReported: null,
          aiSentiment: null,
        })))
      } catch {
        if (cancelled) return
        setTrendData([])
        setPreviousWeekData([])
      }
    }
    fetchTrends()
    return () => { cancelled = true }
  }, [])

const safeAvg = (arr: number[]): number => (arr.length ? arr.reduce((a,b)=>a+b,0) / arr.length : 0)
const weeklyAverages = {
  currentWeek: {
    aiMood: safeAvg(trendData.map(d => d.aiMood ?? 0)),
    selfReported: NaN as any,
    aiProductivity: safeAvg(trendData.map(d => d.aiProductivity ?? 0)),
    aiSentiment: safeAvg(trendData.map(d => d.aiSentiment ?? 0)),
  },
  previousWeek: {
    aiMood: safeAvg(previousWeekData.map(d => d.aiMood ?? 0)),
    aiProductivity: safeAvg(previousWeekData.map(d => d.aiProductivity ?? 0)),
    aiSentiment: safeAvg(previousWeekData.map(d => d.aiSentiment ?? 0)),
  },
}

  const currentWeekAvg = trendData.length ? (trendData.reduce((sum, day) => sum + (day.aiMood || 0), 0) / trendData.length) : 0
  const previousWeekAvg = previousWeekData.length ? (previousWeekData.reduce((sum, day) => sum + (day.aiMood || 0), 0) / previousWeekData.length) : 0
  const weeklyChange = currentWeekAvg - previousWeekAvg
  const changePercentage = ((weeklyChange / previousWeekAvg) * 100).toFixed(1)

  const getChangeIcon = (change: number) => {
    if (change > 0.5) return <ArrowUp className="w-4 h-4 text-green-500" />
    if (change < -0.5) return <ArrowDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-yellow-500" />
  }

  const getSpikesAndDips = () => {
    const spikes = trendData.filter((day) => (day.aiMood ?? 0) > currentWeekAvg + 1)
    const dips = trendData.filter((day) => (day.aiMood ?? 0) < currentWeekAvg - 1)
    return { spikes, dips }
  }

  const { spikes, dips } = getSpikesAndDips()

  const getSentimentDisplay = (sentiment: number) => {
    if (sentiment > 0.5)
      return { color: "text-green-600", label: "Very Positive", bg: "bg-green-50 dark:bg-green-950/20" }
    if (sentiment > 0.1) return { color: "text-green-500", label: "Positive", bg: "bg-green-50 dark:bg-green-950/20" }
    if (sentiment > -0.1)
      return { color: "text-yellow-600", label: "Neutral", bg: "bg-yellow-50 dark:bg-yellow-950/20" }
    if (sentiment > -0.5)
      return { color: "text-orange-600", label: "Negative", bg: "bg-orange-50 dark:bg-orange-950/20" }
    return { color: "text-red-600", label: "Very Negative", bg: "bg-red-50 dark:bg-red-950/20" }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const reportPeriods = [
    { value: "weekly", label: "Weekly Reports" },
    { value: "monthly", label: "Monthly Reports" },
    { value: "quarterly", label: "Quarterly Reports" },
  ]

  const availableReports = [
    { value: "latest", label: "Latest Report", date: "Jan 8-14, 2024" },
    { value: "previous", label: "Previous Report", date: "Jan 1-7, 2024" },
    { value: "december", label: "December Report", date: "Dec 2023" },
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Brain className="w-8 h-8 text-primary" />
              AI Reports
            </h1>
            <p className="text-muted-foreground">Personalized insights and recommendations from your journal</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportPeriods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              AI vs Self-Reported Weekly Averages
            </CardTitle>
            <CardDescription>Comparison of AI-inferred metrics with your self-reported data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Current Week Comparison</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium">Mood Average</span>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                          <span className="text-sm">AI: {weeklyAverages.currentWeek.aiMood.toFixed(1)}/10</span>
                        </div>
                        {!isNaN(weeklyAverages.currentWeek.selfReported) && (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm">
                              Self: {weeklyAverages.currentWeek.selfReported.toFixed(1)}/10
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {!isNaN(weeklyAverages.currentWeek.selfReported) && (
                        <Badge variant="outline">
                          Δ{" "}
                          {Math.abs(
                            weeklyAverages.currentWeek.aiMood - weeklyAverages.currentWeek.selfReported,
                          ).toFixed(1)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium">AI Productivity</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">{weeklyAverages.currentWeek.aiProductivity.toFixed(1)}/10</span>
                      </div>
                    </div>
                    <Badge variant={weeklyAverages.currentWeek.aiProductivity > 7 ? "default" : "secondary"}>
                      {weeklyAverages.currentWeek.aiProductivity > 7
                        ? "High"
                        : weeklyAverages.currentWeek.aiProductivity > 5
                          ? "Medium"
                          : "Low"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium">AI Sentiment</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className={`w-3 h-3 rounded-full ${weeklyAverages.currentWeek.aiSentiment > 0 ? "bg-green-500" : weeklyAverages.currentWeek.aiSentiment < 0 ? "bg-red-500" : "bg-yellow-500"}`}
                        ></div>
                        <span className="text-sm">{weeklyAverages.currentWeek.aiSentiment.toFixed(2)}</span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={getSentimentDisplay(weeklyAverages.currentWeek.aiSentiment).color}
                    >
                      {getSentimentDisplay(weeklyAverages.currentWeek.aiSentiment).label}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Week-over-Week Changes</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Mood Change</span>
                    <div className="flex items-center gap-2">
                      {getChangeIcon(weeklyAverages.currentWeek.aiMood - weeklyAverages.previousWeek.aiMood)}
                      <span className="text-sm font-medium">
                        {weeklyAverages.currentWeek.aiMood - weeklyAverages.previousWeek.aiMood > 0 ? "+" : ""}
                        {(weeklyAverages.currentWeek.aiMood - weeklyAverages.previousWeek.aiMood).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Productivity Change</span>
                    <div className="flex items-center gap-2">
                      {getChangeIcon(
                        weeklyAverages.currentWeek.aiProductivity - weeklyAverages.previousWeek.aiProductivity,
                      )}
                      <span className="text-sm font-medium">
                        {weeklyAverages.currentWeek.aiProductivity - weeklyAverages.previousWeek.aiProductivity > 0
                          ? "+"
                          : ""}
                        {(
                          weeklyAverages.currentWeek.aiProductivity - weeklyAverages.previousWeek.aiProductivity
                        ).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Sentiment Change</span>
                    <div className="flex items-center gap-2">
                      {getChangeIcon(weeklyAverages.currentWeek.aiSentiment - weeklyAverages.previousWeek.aiSentiment)}
                      <span className="text-sm font-medium">
                        {weeklyAverages.currentWeek.aiSentiment - weeklyAverages.previousWeek.aiSentiment > 0
                          ? "+"
                          : ""}
                        {(weeklyAverages.currentWeek.aiSentiment - weeklyAverages.previousWeek.aiSentiment).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Trend Analysis section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  AI Mood Trend Analysis
                </CardTitle>
                <CardDescription>AI-inferred emotional patterns from your journal entries</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="self-reported" checked={showSelfReported} onCheckedChange={setShowSelfReported} />
                  <Label htmlFor="self-reported" className="text-sm">
                    Show Self-Reported
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="comparison" checked={showComparison} onCheckedChange={setShowComparison} />
                  <Label htmlFor="comparison" className="text-sm">
                    Compare Periods
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="daily-insights" checked={showDailyInsights} onCheckedChange={setShowDailyInsights} />
                  <Label htmlFor="daily-insights" className="text-sm">
                    Daily Insights
                  </Label>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as any
                        const sentimentDisplay = getSentimentDisplay((data.aiSentiment ?? 0) as number)
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{label}</p>
                            <p className="text-primary">AI Mood: {payload[0].value}/10</p>
                            {typeof data.selfReported === 'number' && (
                              <p className="text-blue-500">Self-Reported: {data.selfReported}/10</p>
                            )}
                            {showDailyInsights && (
                              <>
                                <p className="text-green-600">AI Productivity: {(data.aiProductivity ?? 0)}/10</p>
                                <p className={sentimentDisplay.color}>
                                  AI Sentiment: {sentimentDisplay.label} ({data.aiSentiment.toFixed(2)})
                                </p>
                              </>
                            )}
                            <p className="text-sm text-muted-foreground mt-1">{data.context}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="aiMood"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    name="AI Inferred"
                  />
                  {showSelfReported && (
                    <Line
                      type="monotone"
                      dataKey="selfReported"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
                      connectNulls={false}
                      name="Self-Reported"
                    />
                  )}
                  {showDailyInsights && (
                    <Line
                      type="monotone"
                      dataKey="aiProductivity"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      dot={{ fill: "hsl(var(--chart-3))", strokeWidth: 2, r: 3 }}
                      name="AI Productivity"
                    />
                  )}
                  {showComparison && (
                    <ReferenceLine
                      y={comparisonRange[0]}
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="2 2"
                      label="Comparison Line"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {showDailyInsights && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5 text-primary" />
                    Daily AI Insights
                  </CardTitle>
                  <CardDescription>Detailed AI analysis for each day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trendData.map((day, index) => {
                      const sentimentDisplay = getSentimentDisplay((day.aiSentiment ?? 0) as number)
                      return (
                        <div key={index} className={`p-4 rounded-lg border ${sentimentDisplay.bg}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{day.date}</span>
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4 text-primary" />
                              <span className="text-sm">{(day.aiMood ?? 0).toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Productivity:</span>
                              <Badge variant="outline" className="text-xs">
                                {(day.aiProductivity ?? 0).toFixed(1)}/10
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Sentiment:</span>
                              <Badge variant="outline" className={`text-xs ${sentimentDisplay.color}`}>
                                {sentimentDisplay.label}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mt-2">{day.context}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {showComparison && (
              <div className="mb-6">
                <Label className="text-sm font-medium mb-2 block">Comparison Reference Line</Label>
                <Slider
                  value={comparisonRange}
                  onValueChange={setComparisonRange}
                  max={10}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0</span>
                  <span>Current: {comparisonRange[0]}</span>
                  <span>10</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparative Insights section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Weekly Comparative Insights</CardTitle>
            <CardDescription>This week vs last week analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {getChangeIcon(weeklyChange)}
                  <span className="text-2xl font-bold">
                    {weeklyChange > 0 ? "+" : ""}
                    {weeklyChange.toFixed(1)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Average mood change</p>
                <p className="text-xs text-muted-foreground">({changePercentage}% vs last week)</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-green-600">Mood Spikes</h4>
                {spikes.length > 0 ? (
                  spikes.map((spike, index) => (
                    <div key={index} className="p-2 bg-green-50 dark:bg-green-950/20 rounded">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{spike.date}</span>
                        <Badge variant="outline" className="text-green-600">
                          {spike.aiMood}/10
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{spike.context}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No significant spikes this week</p>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-red-600">Mood Dips</h4>
                {dips.length > 0 ? (
                  dips.map((dip, index) => (
                    <div key={index} className="p-2 bg-red-50 dark:bg-red-950/20 rounded">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{dip.date}</span>
                        <Badge variant="outline" className="text-red-600">
                          {dip.aiMood}/10
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{dip.context}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No significant dips this week</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Available Reports</CardTitle>
            <CardDescription>Select a report to view detailed AI-generated insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {availableReports.map((report) => (
                <Card
                  key={report.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedReport === report.value ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedReport(report.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{report.label}</h3>
                      {selectedReport === report.value && <Badge variant="default">Active</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{report.date}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Report Content */}
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="summary">Overview</TabsTrigger>
            <TabsTrigger value="insights">Personal Insights</TabsTrigger>
            <TabsTrigger value="growth">Growth Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            {selectedPeriod === "weekly" ? (
              <WeeklyReport reportId={selectedReport} />
            ) : (
              <MonthlyReport reportId={selectedReport} />
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <PersonalInsights reportId={selectedReport} />
          </TabsContent>

          <TabsContent value="growth" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Growth Metrics
                  </CardTitle>
                  <CardDescription>Key indicators of your personal development</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Self-Awareness Score</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }} />
                        </div>
                        <span className="text-sm font-medium">8.5/10</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Emotional Intelligence</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: "78%" }} />
                        </div>
                        <span className="text-sm font-medium">7.8/10</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Goal Clarity</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: "72%" }} />
                        </div>
                        <span className="text-sm font-medium">7.2/10</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Resilience Index</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: "90%" }} />
                        </div>
                        <span className="text-sm font-medium">9.0/10</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Progress Tracking
                  </CardTitle>
                  <CardDescription>Your journey towards personal goals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Career Development</span>
                        <Badge variant="default">On Track</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Consistent mentions of skill building and networking
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Work-Life Balance</span>
                        <Badge variant="outline">Improving</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Increased focus on family time and self-care</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Health & Fitness</span>
                        <Badge variant="secondary">Needs Attention</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Limited mentions of exercise and wellness activities
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <GrowthRecommendations reportId={selectedReport} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
