"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, Tag, Smile, Meh, Frown, Heart, Star, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

interface JournalEntry {
  id: string
  title?: string
  content: string
  mood: string
  tags: string[]
  createdAt: string
}

interface JournalEntryListProps {
  searchQuery: string
  selectedTags: string[]
}

// No sample data — start with an empty list until real data is wired
const initialEntries: JournalEntry[] = []

const moodIcons = {
  happy: <Smile className="w-4 h-4 text-green-500" />,
  content: <Heart className="w-4 h-4 text-blue-500" />,
  neutral: <Meh className="w-4 h-4 text-yellow-500" />,
  sad: <Frown className="w-4 h-4 text-orange-500" />,
  stressed: <Frown className="w-4 h-4 text-red-500" />,
  excited: <Star className="w-4 h-4 text-purple-500" />,
}

export function JournalEntryList({ searchQuery, selectedTags }: JournalEntryListProps) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftContent, setDraftContent] = useState<string>("")
  const [isBusy, setIsBusy] = useState<boolean>(false)

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const today = new Date().toISOString().slice(0, 10)
        const { getNotesByDate } = await import("@/lib/api")
        const { notes } = await getNotesByDate(today)
        const mapped: JournalEntry[] = notes.map((n) => ({
          id: String(n.id),
          content: n.content,
          createdAt: n.created_at,
          mood: (n.latest_mood_score ?? undefined) ? "content" : "neutral",
          tags: [],
        }))
        setEntries(mapped)
      } catch (e) {
        // silently keep empty state
      }
    }
    fetchNotes()
  }, [])
  const beginEdit = (entry: JournalEntry) => {
    setEditingId(entry.id)
    setDraftContent(entry.content)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraftContent("")
  }

  const saveEdit = async (id: string) => {
    try {
      setIsBusy(true)
      const { updateNote } = await import("@/lib/api")
      const numId = Number(id)
      await updateNote(numId, { content: draftContent })
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, content: draftContent } : e)))
      setEditingId(null)
    } catch (e) {
      // ignore for now
    } finally {
      setIsBusy(false)
    }
  }

  const removeEntry = async (id: string) => {
    try {
      setIsBusy(true)
      const { deleteNote } = await import("@/lib/api")
      await deleteNote(Number(id))
      setEntries((prev) => prev.filter((e) => e.id !== id))
    } catch (e) {
      // ignore for now
    } finally {
      setIsBusy(false)
    }
  }


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
                  <DropdownMenuItem onClick={() => beginEdit(entry)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => removeEntry(entry.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {editingId === entry.id ? (
              <div className="space-y-3">
                <Input value={draftContent} onChange={(e) => setDraftContent(e.target.value)} disabled={isBusy} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => saveEdit(entry.id)} disabled={isBusy || draftContent.trim() === ""}>Save</Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit} disabled={isBusy}>Cancel</Button>
                </div>
              </div>
            ) : (
              <p className="text-foreground leading-relaxed mb-4">{entry.content}</p>
            )}

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

            {/* No AI summary display; suggestions are shown in the entry form when requested */}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
