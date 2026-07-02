import { User, UserState } from "@/types/user.types"
import { create } from "zustand"

const USER_STORAGE_KEY = "user"

function getStoredUser(): User | null {
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

export const useUserStore = create<UserState>((set) => ({
  user: null,

  setUser: (user) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    set({ user })
  },

  clearUser: () => {
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem("access_token")
    set({ user: null })
  },

  hydrateUser: () => {
    set({ user: getStoredUser() })
  },
}))
