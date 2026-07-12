import { API_ENDPOINTS } from "@/constants/api-endpoints"
import { api } from "@/lib/axios"
import type {
  DocumentResponse,
  DocumentsResponse,
} from "@/types/document.types"

export async function getDocuments(): Promise<DocumentsResponse> {
  const response = await api.get(API_ENDPOINTS.DOCUMENTS.LIST)

  return response.data
}

export async function uploadDocument(
  file: File,
  title: string
): Promise<DocumentResponse> {
  const formData = new FormData()

  formData.append("file", file)
  formData.append("title", title)

  const response = await api.post(API_ENDPOINTS.DOCUMENTS.LIST, formData)

  return response.data
}

export async function renameDocument(
  documentId: number,
  title: string
): Promise<DocumentResponse> {
  const response = await api.patch(API_ENDPOINTS.DOCUMENTS.TITLE(documentId), {
    title,
  })

  return response.data
}

export async function retryDocument(
  documentId: number
): Promise<DocumentResponse> {
  const response = await api.post(API_ENDPOINTS.DOCUMENTS.RETRY(documentId), {})

  return response.data
}

export async function deleteDocument(
  documentId: number
): Promise<DocumentResponse> {
  const response = await api.delete(API_ENDPOINTS.DOCUMENTS.DETAIL(documentId))

  return response.data
}
