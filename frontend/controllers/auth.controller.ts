"use client"

import { APP_CONSTANTS } from "@/constants/app.constants"
import { LoginInput, SignupInput } from "@/schemas/auth.schema"
import { loginUser, signUp } from "@/services/auth.service"
import {
  hasStoredSession,
  useUserStore,
} from "@/stores/user.store"

export async function loginController(loginInput: LoginInput) {
  const response = await loginUser(loginInput)
  const userStore = useUserStore.getState()

  userStore.setUser({
    name: response.data.name,
    email: response.data.email,
    id: String(response.data.id),
  })

  localStorage.setItem(
    APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN,
    response.data.access_token
  )

  return response
}

export async function signupController(signupInput: SignupInput) {
  return signUp(signupInput)
}

export function logoutController() {
  useUserStore.getState().clearUser()
}

export function loadUserFromLocalStorage() {
  if (!hasStoredSession()) {
    return false
  }

  useUserStore.getState().hydrateUser()
  return true
}
