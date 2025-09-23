"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getMe } from "@/lib/api"

export default function UserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: number; email: string; nickname: string|null; avatar_url: string|null; avatar_name: string|null } | null>(null)

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null
    if (!token) {
      router.push("/auth")
      return
    }
    const load = async () => {
      try {
        const me = await getMe()
        setUser(me)
      } catch {
        // if token invalid, redirect
        router.push("/auth")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const logout = () => {
    localStorage.removeItem("jwt_token")
    router.push("/auth")
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="min-h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden" />
              <div>
                <div className="text-lg font-medium">{user.nickname || user.avatar_name || "User"}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => router.push("/journal")}>Go to Journal</Button>
              <Button variant="destructive" onClick={logout}>Log out</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


