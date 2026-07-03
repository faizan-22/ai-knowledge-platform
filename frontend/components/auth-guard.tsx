"use client"

import { APP_CONSTANTS } from "@/constants/app.constants"
import { ROUTES } from "@/constants/routes"
import { loadUserFromLocalStorage } from "@/controllers/auth.controller"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    function checkAuth() {
      const hasSession = loadUserFromLocalStorage()

      if (!hasSession) {
        setIsAuthenticated(false)
        setIsCheckingAuth(false)
        router.replace(ROUTES.LOGIN)
        return
      }

      setIsAuthenticated(true)
      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [router])

  if (isCheckingAuth || !isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
        {APP_CONSTANTS.MESSAGES.LOAD_RELOAD_PAGE}
      </div>
    )
  }

  return children
}
