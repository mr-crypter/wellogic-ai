"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BookOpen, TrendingUp, FileText, Brain, LogOut, User } from "lucide-react"
import { useEffect, useState } from "react"

const navigation = [
  {
    name: "Journal",
    href: "/journal",
    icon: BookOpen,
    description: "Write and manage your journal entries",
  },
  {
    name: "Trends",
    href: "/trends",
    icon: TrendingUp,
    description: "Visualize patterns in your thoughts",
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
    description: "AI-generated insights and suggestions",
  },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const updateAuth = () => {
      const token = localStorage.getItem("jwt_token")
      setIsAuthenticated(!!token)
    }
    updateAuth()
    const onStorage = (e: StorageEvent) => {
      if (e.key === "jwt_token") updateAuth()
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("jwt_token")
    setIsAuthenticated(false)
    router.push("/auth")
  }

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-semibold">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-foreground font-semibold">AI Journal</span>
          </Link>

          {/* Navigation Links - only show if authenticated */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2",
                        isActive && "bg-primary text-primary-foreground",
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Auth Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link href="/user">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <BookOpen className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
