"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("jwt_token")
    setIsAuthenticated(!!token)
    setIsLoading(false)

    // Redirect to auth if not authenticated
    if (!token) {
      router.push("/auth")
    }
  }, [router])

  const logout = () => {
    localStorage.removeItem("jwt_token")
    setIsAuthenticated(false)
    router.push("/auth")
  }

  return {
    isAuthenticated,
    isLoading,
    logout,
  }
}
