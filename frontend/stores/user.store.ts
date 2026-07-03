import { APP_CONSTANTS } from "@/constants/app.constants"
import { User, UserState } from "@/types/user.types"
import { create } from "zustand"

export const USER_STORAGE_KEY = APP_CONSTANTS.STORAGE_KEYS.USER
export const ACCESS_TOKEN_STORAGE_KEY = APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN

export function getStoredUser(): User | null {
  if (typeof window === "undefined") {
    return null
  }

  const storedUser = localStorage.getItem(USER_STORAGE_KEY)

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser) as User
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

export function hasStoredSession() {
  if (typeof window === "undefined") {
    return false
  }

  return Boolean(
    localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) && getStoredUser()
  )
}

export const useUserStore = create<UserState>((set) => ({
  user: null,

  setUser: (user) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    set({ user })
  },

  clearUser: () => {
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
    set({ user: null })
  },

  hydrateUser: () => {
    const user = getStoredUser()
    set({ user })
    return user
  },
}))
