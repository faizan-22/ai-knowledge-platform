"use client"

import { APP_CONSTANTS } from "@/constants/app.constants"
import { getApiErrorMessage } from "@/lib/api-error"
import {
  deleteDocument,
  getDocuments,
  renameDocument,
  retryDocument,
  uploadDocument,
} from "@/services/document.service"
import { useDocumentStore } from "@/stores/document.store"

export async function loadDocumentsController({
  showLoading = true,
}: { showLoading?: boolean } = {}) {
  const documentStore = useDocumentStore.getState()

  if (showLoading) {
    documentStore.setIsLoading(true)
  }

  documentStore.setError(null)

  try {
    const response = await getDocuments()
    documentStore.setDocuments(response.data)
    return response
  } catch (error) {
    const message = getApiErrorMessage(
      error,
      APP_CONSTANTS.MESSAGES.DOCUMENT_LOAD_ERROR
    )

    documentStore.setError(message)
    throw new Error(message)
  } finally {
    if (showLoading) {
      useDocumentStore.getState().setIsLoading(false)
    }
  }
}

export async function uploadDocumentController(file: File, title: string) {
  const documentStore = useDocumentStore.getState()
  const nextTitle = title.trim()

  if (!nextTitle) {
    documentStore.setError(APP_CONSTANTS.MESSAGES.DOCUMENT_TITLE_REQUIRED)
    throw new Error(APP_CONSTANTS.MESSAGES.DOCUMENT_TITLE_REQUIRED)
  }

  if (file.type !== "application/pdf") {
    documentStore.setError(APP_CONSTANTS.MESSAGES.DOCUMENT_FILE_TYPE_ERROR)
    throw new Error(APP_CONSTANTS.MESSAGES.DOCUMENT_FILE_TYPE_ERROR)
  }

  if (file.size > APP_CONSTANTS.DOCUMENTS.MAX_UPLOAD_FILE_SIZE_BYTES) {
    documentStore.setError(APP_CONSTANTS.MESSAGES.DOCUMENT_FILE_SIZE_ERROR)
    throw new Error(APP_CONSTANTS.MESSAGES.DOCUMENT_FILE_SIZE_ERROR)
  }

  documentStore.setError(null)

  try {
    const response = await uploadDocument(file, nextTitle)
    useDocumentStore.getState().addDocument(response.data)
    return response
  } catch (error) {
    const message = getApiErrorMessage(
      error,
      APP_CONSTANTS.MESSAGES.DOCUMENT_UPLOAD_ERROR
    )

    useDocumentStore.getState().setError(message)
    throw new Error(message)
  }
}

export async function renameDocumentController(
  documentId: number,
  title: string
) {
  const documentStore = useDocumentStore.getState()
  const nextTitle = title.trim()

  if (!nextTitle) {
    documentStore.setError(APP_CONSTANTS.MESSAGES.DOCUMENT_TITLE_REQUIRED)
    throw new Error(APP_CONSTANTS.MESSAGES.DOCUMENT_TITLE_REQUIRED)
  }

  documentStore.setError(null)

  try {
    const response = await renameDocument(documentId, nextTitle)
    useDocumentStore.getState().updateDocument(response.data)
    return response
  } catch (error) {
    const message = getApiErrorMessage(
      error,
      APP_CONSTANTS.MESSAGES.DOCUMENT_RENAME_ERROR
    )

    useDocumentStore.getState().setError(message)
    throw new Error(message)
  }
}

export async function deleteDocumentController(documentId: number) {
  useDocumentStore.getState().setError(null)

  try {
    const response = await deleteDocument(documentId)
    useDocumentStore.getState().removeDocument(documentId)
    return response
  } catch (error) {
    const message = getApiErrorMessage(
      error,
      APP_CONSTANTS.MESSAGES.DOCUMENT_DELETE_ERROR
    )

    useDocumentStore.getState().setError(message)
    throw new Error(message)
  }
}

export async function retryDocumentController(documentId: number) {
  useDocumentStore.getState().setError(null)

  try {
    const response = await retryDocument(documentId)
    useDocumentStore.getState().updateDocument(response.data)
    return response
  } catch (error) {
    const message = getApiErrorMessage(
      error,
      APP_CONSTANTS.MESSAGES.DOCUMENT_RETRY_ERROR
    )

    useDocumentStore.getState().setError(message)
    throw new Error(message)
  }
}
