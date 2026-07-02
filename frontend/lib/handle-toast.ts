import axios from "axios"
import { toast } from "sonner"

const errorToastStyles = {
  light: {
    background: "oklch(0.9 0.12 86)",
    borderColor: "oklch(0.78 0.16 82 / 65%)",
    color: "oklch(0.22 0.045 72)",
    boxShadow: "0 18px 40px oklch(0.45 0.1 82 / 20%)",
  },
  dark: {
    background: "oklch(0.24 0.045 82)",
    borderColor: "oklch(0.76 0.16 82 / 45%)",
    color: "oklch(0.91 0.14 88)",
    boxShadow: "0 20px 45px oklch(0.2 0.04 82 / 35%)",
  },
} as const

const successToastStyles = {
  light: {
    background: "oklch(0.84 0.1 306)",
    borderColor: "oklch(0.68 0.18 306 / 55%)",
    color: "oklch(0.2 0.035 304)",
    boxShadow: "0 18px 40px oklch(0.4 0.12 306 / 20%)",
  },
  dark: {
    background: "oklch(0.22 0.055 304)",
    borderColor: "oklch(0.827 0.119 306.383 / 45%)",
    color: "oklch(0.9 0.08 306)",
    boxShadow: "0 20px 45px oklch(0.2 0.06 304 / 35%)",
  },
} as const

function getThemeMode() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

export function handleError(error: unknown, fallbackMessage: string) {
  let message = fallbackMessage

  if (axios.isAxiosError(error)) {
    message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      fallbackMessage
  }

  toast.error("Something went wrong", {
    description: message,
    style: errorToastStyles[getThemeMode()],
  })
}

export function handleSuccess(description?: string) {
  toast.success("Success", {
    description,
    style: successToastStyles[getThemeMode()],
  })
}

export const handleApiError = handleError
