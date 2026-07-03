import { API_ENDPOINTS } from "@/constants/api-endpoints"
import { api } from "@/lib/axios"
import type { ChatResponse } from "@/types/chat.types"

export async function sendChatMessage(
  documentId: number,
  query: string
): Promise<ChatResponse> {
  const response = await api.post(API_ENDPOINTS.CHAT.SEND(documentId), {
    query,
  })

  if (typeof response.data === "string") {
    return {
      success: true,
      statusCode: response.status,
      data: response.data,
      timeStamp: "",
      path: API_ENDPOINTS.CHAT.SEND(documentId),
    }
  }

  return response.data
}
