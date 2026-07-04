"use client"

import { APP_CONSTANTS } from "@/constants/app.constants"
import { ROUTES } from "@/constants/routes"
import { loadUserFromLocalStorage } from "@/controllers/auth.controller"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    loadUserFromLocalStorage()
  )

  const checkAuth = useCallback(() => {
    const hasSession = loadUserFromLocalStorage()

    if (!hasSession) {
      setIsAuthenticated(false)
      router.replace(ROUTES.LOGIN)
      return
    }

    setIsAuthenticated(true)
  }, [router])

  useEffect(() => {
    checkAuth()

    window.addEventListener("pageshow", checkAuth)

    return () => {
      window.removeEventListener("pageshow", checkAuth)
    }
  }, [checkAuth])

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
        {APP_CONSTANTS.MESSAGES.LOAD_RELOAD_PAGE}
      </div>
    )
  }

  return children
}
