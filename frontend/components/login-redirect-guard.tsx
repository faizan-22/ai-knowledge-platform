"use client"

import { hasStoredSession, useUserStore } from "@/stores/user.store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function LoginRedirectGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const hydrateUser = useUserStore((state) => state.hydrateUser)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    function checkAuth() {
      if (hasStoredSession()) {
        hydrateUser()
        router.replace("/dashboard")
        return
      }

      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [hydrateUser, router])

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  return children
}
