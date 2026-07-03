export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
  },
  DOCUMENTS: {
    LIST: "/documents",
    TITLE: (documentId: number) => `/documents/title/${documentId}`,
    DETAIL: (documentId: number) => `/documents/${documentId}`,
  },
  CHAT: {
    SEND: (documentId: number) => `/chat/${documentId}`,
  },
} as const
