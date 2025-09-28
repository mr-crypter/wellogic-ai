"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, TrendingUp, FileText, Brain, Sparkles, BarChart3 } from "lucide-react"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("jwt_token")
    setIsAuthenticated(!!token)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 text-balance">
            Transform Your Thoughts Into <span className="text-primary font-bold">Insights</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
            AI Journal helps you capture your thoughts, discover patterns, and gain deeper understanding of your
            personal growth through intelligent analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link href="/journal">
                  <Button size="lg" className="w-full sm:w-auto">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Continue Journaling
                  </Button>
                </Link>
                <Link href="/trends">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    View Trends
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button size="lg" className="w-full sm:w-auto">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Start Journaling
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                    <Brain className="w-5 h-5 mr-2" />
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Intelligent Journaling Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover how AI can enhance your journaling experience and provide meaningful insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Smart Journal Entries</CardTitle>
                <CardDescription>Write freely with AI-powered suggestions and mood tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    AI writing prompts
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Mood detection
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Tag suggestions
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Pattern Recognition</CardTitle>
                <CardDescription>Visualize trends in your emotions, topics, and growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Mood trends
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Topic analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Growth metrics
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>Get personalized reports and recommendations for your wellbeing</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    Actionable suggestions
                  </li>
                  <li className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    Growth insights
                  </li>
                  <li className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    Recommendations
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
