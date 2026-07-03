import axios from "axios"

import { APP_CONSTANTS } from "@/constants/app.constants"

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
