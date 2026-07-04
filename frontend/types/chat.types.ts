export type ChatMessageRole = "user" | "assistant"

export type ChatMessage = {
  id: string
  role: ChatMessageRole
  content: string
  sources: Sources[]
}

export type ChatRequest = {
  query: string
}

export type ChatResponse = {
  success: boolean
  statusCode: number
  data: {
    answer: string
    sources: Sources[]
  }
  timeStamp: string
  path: string
}

export type Sources = {
  id: number
  chunkIndex: number
  pageNumber: number
}
