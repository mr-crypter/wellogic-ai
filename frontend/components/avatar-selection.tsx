"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2, Check, X } from "lucide-react"

const avatars = [
  {
    id: "avatar1",
    name: "Alex",
    preview: "/friendly-professional-avatar-with-short-hair.jpg",
  },
  {
    id: "avatar2",
    name: "Sam",
    preview: "/casual-modern-avatar-with-glasses.jpg",
  },
  {
    id: "avatar3",
    name: "Jordan",
    preview: "/creative-artistic-avatar-with-long-hair.jpg",
  },
  {
    id: "avatar4",
    name: "Casey",
    preview: "/minimalist-clean-avatar-with-cap.jpg",
  },
  {
    id: "avatar5",
    name: "Riley",
    preview: "/warm-approachable-avatar-with-smile.jpg",
  },
  {
    id: "avatar6",
    name: "Avery",
    preview: "/tech-savvy-modern-avatar-with-headphones.jpg",
  },
]

interface AvatarSelectionProps {
  selectedAvatar: string
  onAvatarSelect: (avatarId: string) => void
  customAvatarName?: string
  onAvatarNameChange?: (name: string) => void
}

export function AvatarSelection({
  selectedAvatar,
  onAvatarSelect,
  customAvatarName,
  onAvatarNameChange,
}: AvatarSelectionProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState("")

  const selectedAvatarData = avatars.find((a) => a.id === selectedAvatar)
  const currentAvatarName = customAvatarName || selectedAvatarData?.name || ""

  const handleStartEdit = () => {
    setTempName(currentAvatarName)
    setIsEditingName(true)
  }

  const handleSaveName = () => {
    if (tempName.trim() && onAvatarNameChange) {
      onAvatarNameChange(tempName.trim())
    }
    setIsEditingName(false)
  }

  const handleCancelEdit = () => {
    setTempName("")
    setIsEditingName(false)
  }

  return (
    <div className="space-y-4">
      <span className="text-sm text-muted-foreground">Select your avatar</span>

      <div className="grid grid-cols-3 gap-3">
        {avatars.map((avatar) => (
          <Card
            key={avatar.id}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              selectedAvatar === avatar.id ? "ring-2 ring-primary bg-primary/10" : "hover:bg-muted/50"
            }`}
            onClick={() => onAvatarSelect(avatar.id)}
          >
            <div className="p-3 text-center">
              <div className="w-full h-20 bg-muted/20 rounded-lg mb-2 overflow-hidden">
                <img
                  src={avatar.preview || "/placeholder.svg"}
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs font-medium">
                {selectedAvatar === avatar.id && customAvatarName ? customAvatarName : avatar.name}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {selectedAvatar && (
        <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Avatar Name</Label>
            {!isEditingName && onAvatarNameChange && (
              <Button type="button" variant="ghost" size="sm" onClick={handleStartEdit} className="h-6 px-2">
                <Edit2 className="w-3 h-3" />
              </Button>
            )}
          </div>

          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Enter avatar name"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName()
                  if (e.key === "Escape") handleCancelEdit()
                }}
                autoFocus
              />
              <Button type="button" variant="ghost" size="sm" onClick={handleSaveName} className="h-8 w-8 p-0">
                <Check className="w-4 h-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleCancelEdit} className="h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{currentAvatarName}</p>
          )}
        </div>
      )}
    </div>
  )
}
