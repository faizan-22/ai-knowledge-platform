import axios from "axios"

import type { standardError } from "@/types/error.type"

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError<standardError>(error)) {
    const message = error.response?.data?.message

    if (message) {
      return message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallbackMessage
}
