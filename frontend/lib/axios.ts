import axios from "axios"

import { APP_CONSTANTS } from "@/constants/app.constants"
import { ROUTES } from "@/constants/routes"
import { useDocumentStore } from "@/stores/document.store"
import { useUserStore } from "@/stores/user.store"

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config
  }

  const token = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      useUserStore.getState().clearUser()
      useDocumentStore.getState().clearDocuments()

      if (window.location.pathname !== ROUTES.LOGIN) {
        window.location.replace(ROUTES.LOGIN)
      }
    }

    return Promise.reject(error)
  }
)
