"use client"

import { APP_CONSTANTS } from "@/constants/app.constants"
import { ROUTES } from "@/constants/routes"
import { loadUserFromLocalStorage } from "@/controllers/auth.controller"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function LoginRedirectGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    function checkAuth() {
      if (loadUserFromLocalStorage()) {
        router.replace(ROUTES.DASHBOARD)
        return
      }

      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [router])

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
        {APP_CONSTANTS.MESSAGES.LOAD_RELOAD_PAGE}
      </div>
    )
  }

  return children
}
