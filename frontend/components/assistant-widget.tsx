"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, X, ChevronsUpDown } from "lucide-react"

interface SuggestionItem {
  text: string
}

export function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [reflection, setReflection] = useState<string>("")
  const [draft, setDraft] = useState("")
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Pull auth token lazily; if not present we still render but hide sync
  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null), [])

  async function fetchLatestNoteContent(): Promise<string | null> {
    try {
      const today = new Date().toISOString().slice(0, 10)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/v1/notes?date=${encodeURIComponent(today)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!res.ok) return null
      const json = await res.json()
      const notes = (json?.notes || []) as Array<{ content: string; created_at: string }>
      if (!notes.length) return null
      // Use most recent by created_at
      notes.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      return String(notes[0].content || "")
    } catch {
      return null
    }
  }

  async function syncSuggestions() {
    try {
      setBusy(true)
      const content = (draft && draft.trim().length > 0) ? draft : (await fetchLatestNoteContent()) || ""
      if (!content) {
        setSuggestions([])
        return
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/ai/suggestions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) return
      const json = await res.json()
      const arr: string[] = Array.isArray(json?.suggestions) ? json.suggestions : []
      // If API returned chat-friendly messages, prefer them
      const msgs: Array<{ role: string; type: string; text: string }> = Array.isArray(json?.messages) ? json.messages : []
      if (msgs.length > 0) {
        const refl = msgs.find(m => m.type === 'reflection')?.text || ""
        setReflection(refl)
        setSuggestions(msgs.filter(m => m.type === 'suggestion').map(m => ({ text: m.text })))
      } else {
        const hasReflection = arr.length > 1
        setReflection(hasReflection ? String(arr[0]) : "")
        const items = hasReflection ? arr.slice(1) : arr
        setSuggestions(items.map((t) => ({ text: t })))
      }
    } catch {
      // ignore
    } finally {
      setBusy(false)
    }
  }

  // Auto-sync every 90s when open; also initial sync when opening
  useEffect(() => {
    if (!open) {
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = null
      return
    }
    syncSuggestions()
    timerRef.current = setInterval(syncSuggestions, 90_000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [open])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <Card className="w-80 shadow-xl">
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={syncSuggestions} disabled={busy}>
                  <ChevronsUpDown className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Textarea
              placeholder="Ask for help or paste thoughts... (optional)"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="min-h-[60px]"
            />
            <div className="flex items-center justify-between">
              <Button size="sm" variant="outline" onClick={syncSuggestions} disabled={busy}>
                <Sparkles className="w-4 h-4 mr-2" />
                {busy ? "Syncing..." : "Get Suggestions"}
              </Button>
              <span className="text-[10px] text-muted-foreground">Auto-sync every 90s</span>
            </div>

            <div className="space-y-2">
              {reflection && (
                <div className="max-w-[95%] rounded-2xl bg-muted px-3 py-2 text-sm text-foreground">
                  <span className="italic">{reflection}</span>
                </div>
              )}
              {suggestions.length === 0 && !reflection && (
                <div className="text-xs text-muted-foreground">No suggestions yet.</div>
              )}
              {suggestions.map((s, i) => (
                <div key={i} className="max-w-[95%] rounded-2xl bg-primary/10 px-3 py-2 text-sm text-foreground">
                  {s.text}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setOpen(true)} className="shadow-lg">
          <Sparkles className="w-4 h-4 mr-2" />
          Assistant
        </Button>
      )}
    </div>
  )
}


