"use client"

import { useEffect } from "react"

import { useUserStore } from "@/stores/user.store"

export function UserStoreHydrator() {
  const hydrateUser = useUserStore((state) => state.hydrateUser)

  useEffect(() => {
    hydrateUser()
  }, [hydrateUser])

  return null
}
