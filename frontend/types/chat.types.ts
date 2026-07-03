export type ChatMessageRole = "user" | "assistant"

export type ChatMessage = {
  id: string
  role: ChatMessageRole
  content: string
}

export type ChatRequest = {
  query: string
}

export type ChatResponse = {
  success: boolean
  statusCode: number
  data: string
  timeStamp: string
  path: string
}
