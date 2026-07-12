export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
  },
  DOCUMENTS: {
    LIST: "/documents",
    TITLE: (documentId: number) => `/documents/${documentId}/title`,
    DETAIL: (documentId: number) => `/documents/${documentId}`,
    RETRY: (documentId: number) => `/documents/${documentId}/retry`,
  },
  CHAT: {
    SEND: (documentId: number) => `/chat/${documentId}`,
  },
} as const
