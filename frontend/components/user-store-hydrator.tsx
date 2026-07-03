"use client"

import { useEffect } from "react"

import { loadUserFromLocalStorage } from "@/controllers/auth.controller"

export function UserStoreHydrator() {
  useEffect(() => {
    loadUserFromLocalStorage()
  }, [])

  return null
}
