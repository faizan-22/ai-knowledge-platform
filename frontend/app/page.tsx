"use client"

import { loadUserFromLocalStorage } from "@/controllers/auth.controller"
import { APP_CONSTANTS } from "@/constants/app.constants"
import { ROUTES } from "@/constants/routes"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    if (loadUserFromLocalStorage()) {
      router.replace(ROUTES.DASHBOARD)
      return
    }

    router.replace(ROUTES.LOGIN)
  }, [router])

  return (
    <div className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
      {APP_CONSTANTS.MESSAGES.LOAD_RELOAD_PAGE}
    </div>
  )
}
