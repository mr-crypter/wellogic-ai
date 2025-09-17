"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, Tag, Smile, Meh, Frown, Heart, Star, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface JournalEntry {
  id: string
  title?: string
  content: string
  mood: string
  tags: string[]
  createdAt: string
  aiInsights?: string[]
}

interface JournalEntryListProps {
  searchQuery: string
  selectedTags: string[]
}

// Mock data - replace with real data from Supabase
const mockEntries: JournalEntry[] = [
  {
    id: "1",
    title: "A Great Day at Work",
    content:
      "Today was incredibly productive. I finished the project I've been working on for weeks, and the client feedback was overwhelmingly positive. I feel a real sense of accomplishment and pride in what I've created. The team collaboration was seamless, and I learned so much from my colleagues...",
    mood: "happy",
    tags: ["work", "achievement", "gratitude"],
    createdAt: "2024-01-15T10:30:00Z",
    aiInsights: ["Strong positive sentiment detected", "Achievement theme identified"],
  },
  {
    id: "2",
    content:
      "Feeling a bit overwhelmed with all the tasks on my plate. Need to prioritize better and maybe delegate some responsibilities. Taking deep breaths and focusing on one thing at a time.",
    mood: "stressed",
    tags: ["work", "stress", "reflection"],
    createdAt: "2024-01-14T16:45:00Z",
    aiInsights: ["Stress indicators present", "Self-awareness and coping strategies mentioned"],
  },
  {
    id: "3",
    title: "Weekend Reflections",
    content:
      "Spent quality time with family this weekend. We went hiking and had a picnic. These moments remind me what's truly important in life. I want to make more time for these experiences.",
    mood: "content",
    tags: ["family", "nature", "gratitude", "reflection"],
    createdAt: "2024-01-13T20:15:00Z",
    aiInsights: ["Family values emphasized", "Work-life balance theme"],
  },
]

const moodIcons = {
  happy: <Smile className="w-4 h-4 text-green-500" />,
  content: <Heart className="w-4 h-4 text-blue-500" />,
  neutral: <Meh className="w-4 h-4 text-yellow-500" />,
  sad: <Frown className="w-4 h-4 text-orange-500" />,
  stressed: <Frown className="w-4 h-4 text-red-500" />,
  excited: <Star className="w-4 h-4 text-purple-500" />,
}

export function JournalEntryList({ searchQuery, selectedTags }: JournalEntryListProps) {
  const [entries] = useState<JournalEntry[]>(mockEntries)

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      !searchQuery ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => entry.tags.includes(tag))

    return matchesSearch && matchesTags
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (filteredEntries.length === 0) {
    return (
      <Card>
        <CardContent className="py-20 text-center">
          <p className="text-muted-foreground">No journal entries found.</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {filteredEntries.map((entry) => (
        <Card key={entry.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {entry.title && <CardTitle className="text-lg mb-2">{entry.title}</CardTitle>}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(entry.createdAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    {moodIcons[entry.mood as keyof typeof moodIcons]}
                    <span className="capitalize">{entry.mood}</span>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed mb-4">{entry.content}</p>

            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {entry.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {entry.aiInsights && entry.aiInsights.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">AI Insights</h4>
                  <div className="space-y-1">
                    {entry.aiInsights.map((insight, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span className="text-muted-foreground">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
