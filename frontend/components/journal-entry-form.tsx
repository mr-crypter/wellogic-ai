"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Save, Sparkles, Tag } from "lucide-react"
import { MoodSelector } from "@/components/mood-selector"
import { getAiSuggestions, createNote } from "@/lib/api"

interface JournalEntryFormProps {
  onClose: () => void
}

export function JournalEntryForm({ onClose }: JournalEntryFormProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [mood, setMood] = useState<string>("")
  const [productivity, setProductivity] = useState<string>("")
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)

  const suggestedPrompts = [
    "What am I grateful for today?",
    "What challenged me today and how did I handle it?",
    "What did I learn about myself today?",
    "What are my goals for tomorrow?",
    "How am I feeling right now and why?",
  ]

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const today = new Date().toISOString().slice(0, 10)
      const moodScore = mood.trim() === "" ? undefined : Number(mood)
      const productivityScore = productivity.trim() === "" ? undefined : Number(productivity)
      await createNote({ content, mood_score: moodScore as any, productivity_score: productivityScore as any, date: today })
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAiSuggestions = async () => {
    try {
      const moodScore = Number(mood) || undefined
      const productivityScore = Number(productivity) || undefined
      const res = await getAiSuggestions({ content, mood: moodScore, productivity: productivityScore })
      const msgs: Array<{ role: string; type: string; text: string }> = (res as any).messages || []
      if (Array.isArray(msgs) && msgs.length > 0) {
        const refl = msgs.find(m => m.type === 'reflection')?.text || ""
        const items = msgs.filter(m => m.type === 'suggestion').map(m => m.text)
        setAiSuggestions(refl ? [refl, ...items] : items)
      } else {
        setAiSuggestions(res.suggestions || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const generatePrompt = async () => {
    setIsGeneratingPrompt(true)
    // TODO: Implement AI prompt generation
    setTimeout(() => {
      const randomPrompt = suggestedPrompts[Math.floor(Math.random() * suggestedPrompts.length)]
      setContent(randomPrompt + "\n\n")
      setIsGeneratingPrompt(false)
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>New Journal Entry</CardTitle>
            <CardDescription>Capture your thoughts and feelings</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Title (Optional)</label>
          <Input placeholder="Give your entry a title..." value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        {/* AI Prompt Generator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Content</label>
            <Button variant="outline" size="sm" onClick={generatePrompt} disabled={isGeneratingPrompt}>
              <Sparkles className="w-4 h-4 mr-2" />
              {isGeneratingPrompt ? "Generating..." : "AI Prompt"}
            </Button>
          </div>
          <Textarea
            placeholder="Start writing your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] resize-none"
          />
        </div>

        <Separator />

        {/* Mood & Productivity */}
        <div className="space-y-2">
          <label className="text-sm font-medium">How are you feeling? <span className="text-muted-foreground">(optional)</span></label>
          <MoodSelector value={mood} onChange={setMood} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Productivity (0-10) <span className="text-muted-foreground">(optional)</span></label>
          <Input placeholder="8" value={productivity} onChange={(e) => setProductivity(e.target.value)} />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tags</label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={handleAddTag}>
              <Tag className="w-4 h-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                  {tag}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* AI Suggestions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">AI Suggestions</label>
            <Button variant="outline" size="sm" onClick={handleAiSuggestions} disabled={!content.trim()}>
              <Sparkles className="w-4 h-4 mr-2" /> Suggest next steps
            </Button>
          </div>
          {aiSuggestions.length > 0 && (
            <Card className="border-dashed">
              <CardContent className="pt-4 text-sm whitespace-pre-wrap">
                {(() => {
                  const reflection = aiSuggestions.length > 1 ? aiSuggestions[0] : ""
                  const items = aiSuggestions.length > 1 ? aiSuggestions.slice(1) : aiSuggestions
                  return (
                    <div className="space-y-3">
                      {reflection && (
                        <div className="max-w-[90%] rounded-2xl bg-muted px-3 py-2 text-foreground">
                          <span className="italic">{reflection}</span>
                        </div>
                      )}
                      <div className="space-y-2">
                        {items.map((s, i) => (
                          <div key={i} className="max-w-[90%] rounded-2xl bg-primary/10 px-3 py-2 text-foreground">
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!content.trim() || isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Entry"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
