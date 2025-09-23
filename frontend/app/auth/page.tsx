"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AvatarSelection } from "@/components/avatar-selection"
import { useAuth } from "@/hooks/use-auth"
import { User, Mail, Edit2, Save, X, Camera, Shield, Bell } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

interface UserProfile {
  email: string
  nickname: string
  avatar_url: string
  avatar_name: string
  bio?: string
  created_at?: string
  preferences?: {
    email_notifications: boolean
    ai_insights: boolean
    data_sharing: boolean
  }
}

export default function ProfilePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<UserProfile>({
    email: "",
    nickname: "",
    avatar_url: "",
    avatar_name: "",
    bio: "",
    preferences: {
      email_notifications: true,
      ai_insights: true,
      data_sharing: false,
    },
  })

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile()
    }
  }, [isAuthenticated])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("jwt_token")
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setEditForm(data)
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("jwt_token")
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setIsEditing(false)
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setEditForm(profile)
    }
    setIsEditing(false)
  }

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePreferenceChange = (key: keyof UserProfile["preferences"], value: boolean) => {
    setEditForm((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value as boolean,
      } as UserProfile["preferences"],
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Failed to load profile</p>
            <Button onClick={fetchProfile} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your basic account information and avatar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="space-y-4">
                  <Label>Avatar</Label>
                  {isEditing ? (
                    <AvatarSelection
                      selectedAvatar={editForm.avatar_url}
                      onAvatarSelect={(avatarId) => handleInputChange("avatar_url", avatarId)}
                      customAvatarName={editForm.avatar_name}
                      onAvatarNameChange={(name) => handleInputChange("avatar_name", name)}
                    />
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                        <img
                          src={profile.avatar_url || "/placeholder.svg"}
                          alt={profile.avatar_name || "Avatar"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{profile.avatar_name || "Avatar"}</p>
                        <p className="text-sm text-muted-foreground">Your profile avatar</p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nickname">Nickname</Label>
                    {isEditing ? (
                      <Input
                        id="nickname"
                        value={editForm.nickname}
                        onChange={(e) => handleInputChange("nickname", e.target.value)}
                        placeholder="Your display name"
                      />
                    ) : (
                      <p className="text-sm bg-muted p-3 rounded-md">{profile.nickname}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your@email.com"
                      />
                    ) : (
                      <p className="text-sm bg-muted p-3 rounded-md flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {profile.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={editForm.bio || ""}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm bg-muted p-3 rounded-md min-h-[80px]">{profile.bio || "No bio added yet."}</p>
                  )}
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex items-center gap-2 pt-4">
                    <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Preferences
                </CardTitle>
                <CardDescription>Customize your AI Journal experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive updates about your journal insights</p>
                    </div>
                    <Switch
                      checked={editForm.preferences?.email_notifications || false}
                      onCheckedChange={(checked) => handlePreferenceChange("email_notifications" as keyof typeof editForm.preferences, checked)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>AI Insights</Label>
                      <p className="text-sm text-muted-foreground">Enable AI-powered analysis of your entries</p>
                    </div>
                    <Switch
                      checked={editForm.preferences?.ai_insights || false}
                      onCheckedChange={(checked) => handlePreferenceChange("ai_insights" as keyof typeof editForm.preferences, checked)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">Allow anonymized data for research purposes</p>
                    </div>
                    <Switch
                      checked={editForm.preferences?.data_sharing || false}
                      onCheckedChange={(checked) => handlePreferenceChange("data_sharing" as keyof typeof editForm.preferences, checked)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Member Since</Label>
                  <p className="text-sm text-muted-foreground">
                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "Unknown"}
                  </p>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium">Account Status</Label>
                  <p className="text-sm text-green-600">Active</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Camera className="w-4 h-4 mr-2" />
                  Upload Profile Picture
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Shield className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
