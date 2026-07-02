export type User = {
  id: string
  name: string
  email: string
}

export type UserState = {
    user: User|null
    setUser: (user: User) => void
    clearUser: () => void
    hydrateUser: () => void
}
