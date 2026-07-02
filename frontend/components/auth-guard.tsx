"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const hasToken = Boolean(localStorage.getItem("access_token"))
    const hasUser = Boolean(localStorage.getItem("user"))

    if (!hasToken || !hasUser) {
      router.replace("/login")
      setIsCheckingAuth(false)
      return
    }

    setIsAuthenticated(true)
    setIsCheckingAuth(false)
  }, [router])

  if (isCheckingAuth || !isAuthenticated) {
    return null
  }

  return children
}
