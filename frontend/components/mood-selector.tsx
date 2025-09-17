"use client"

import { Button } from "@/components/ui/button"
import { Smile, Meh, Frown, Heart, Star, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface MoodSelectorProps {
  value: string
  onChange: (mood: string) => void
}

const moods = [
  { id: "happy", label: "Happy", icon: Smile, color: "text-green-500" },
  { id: "excited", label: "Excited", icon: Star, color: "text-purple-500" },
  { id: "content", label: "Content", icon: Heart, color: "text-blue-500" },
  { id: "neutral", label: "Neutral", icon: Meh, color: "text-yellow-500" },
  { id: "sad", label: "Sad", icon: Frown, color: "text-orange-500" },
  { id: "stressed", label: "Stressed", icon: Zap, color: "text-red-500" },
]

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {moods.map((mood) => {
        const Icon = mood.icon
        const isSelected = value === mood.id
        return (
          <Button
            key={mood.id}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(mood.id)}
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-3",
              isSelected && "bg-primary text-primary-foreground",
            )}
          >
            <Icon className={cn("w-5 h-5", isSelected ? "text-primary-foreground" : mood.color)} />
            <span className="text-xs">{mood.label}</span>
          </Button>
        )
      })}
    </div>
  )
}
