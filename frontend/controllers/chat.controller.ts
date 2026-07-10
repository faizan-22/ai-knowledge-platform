"use client"

import { APP_CONSTANTS } from "@/constants/app.constants"
import { getApiErrorMessage } from "@/lib/api-error"
import { sendChatMessage } from "@/services/chat.service"

export async function sendChatMessageController(
  documentId: number,
  query: string
) {
  const nextQuery = query.trim()

  if (!nextQuery) {
    throw new Error(APP_CONSTANTS.MESSAGES.CHAT_QUERY_REQUIRED)
  }

  try {
    return await sendChatMessage(documentId, nextQuery)
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, APP_CONSTANTS.MESSAGES.CHAT_SEND_ERROR)
    )
  }
}
