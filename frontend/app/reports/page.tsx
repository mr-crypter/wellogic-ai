"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Download, Share, Calendar, TrendingUp, Target } from "lucide-react"
import { WeeklyReport } from "@/components/weekly-report"
import { MonthlyReport } from "@/components/monthly-report"
import { PersonalInsights } from "@/components/personal-insights"
import { GrowthRecommendations } from "@/components/growth-recommendations"

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("weekly")
  const [selectedReport, setSelectedReport] = useState("latest")

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
            <TabsTrigger value="summary">Summary</TabsTrigger>
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
