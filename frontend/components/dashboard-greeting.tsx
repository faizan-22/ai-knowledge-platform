"use client"

import { useEffect, useState } from "react"

import { useUserStore } from "@/stores/user.store"

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) {
    return "Good morning"
  }

  if (hour < 17) {
    return "Good afternoon"
  }

  return "Good evening"
}

function getFirstName(name?: string) {
  return name?.trim().split(/\s+/)[0] || "there"
}

export function DashboardGreeting() {
  const user = useUserStore((state) => state.user)
  const [greeting, setGreeting] = useState<string | null>(null)
  const firstName = getFirstName(user?.name)

  useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  if (!greeting) {
    return null
  }

  return (
    <section className="px-4 pt-4 lg:px-6">
      <h2 className="text-2xl font-semibold tracking-tight">
        {greeting}, {firstName}!
      </h2>
    </section>
  )
}
