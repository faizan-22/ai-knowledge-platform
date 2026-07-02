import { UserState } from "@/types/user.types"
import { create } from "zustand"

export const useUserStore = create<UserState>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null }),
}))
