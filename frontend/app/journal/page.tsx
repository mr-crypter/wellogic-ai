"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Search, Smile, Meh, Heart } from "lucide-react"
import { JournalEntryForm } from "@/components/journal-entry-form"
import { JournalEntryList } from "@/components/journal-entry-list"

export default function JournalPage() {
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const commonTags = ["work", "personal", "goals", "reflection", "gratitude", "challenges", "growth"]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Journal Entries</h1>
            <p className="text-muted-foreground">Capture your thoughts and track your personal growth</p>
          </div>
          <Button onClick={() => setShowNewEntry(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Search</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Entries</span>
                  <span className="font-semibold">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">This Week</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Streak</span>
                  <span className="font-semibold">7 days</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Recent Mood</span>
                  <div className="flex gap-1">
                    <Smile className="w-4 h-4 text-green-500" />
                    <Smile className="w-4 h-4 text-green-500" />
                    <Meh className="w-4 h-4 text-yellow-500" />
                    <Smile className="w-4 h-4 text-green-500" />
                    <Heart className="w-4 h-4 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags Filter */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Filter by Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {commonTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {showNewEntry ? (
              <JournalEntryForm onClose={() => setShowNewEntry(false)} />
            ) : (
              <JournalEntryList searchQuery={searchQuery} selectedTags={selectedTags} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
