"use client"

import { APP_CONSTANTS } from "@/constants/app.constants"
import {
  deleteDocument,
  getDocuments,
  renameDocument,
  uploadDocument,
} from "@/services/document.service"
import { useDocumentStore } from "@/stores/document.store"

export async function loadDocumentsController() {
  const documentStore = useDocumentStore.getState()

  documentStore.setIsLoading(true)
  documentStore.setError(null)

  try {
    const response = await getDocuments()
    documentStore.setDocuments(response.data)
    return response
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : APP_CONSTANTS.MESSAGES.DOCUMENT_LOAD_ERROR

    documentStore.setError(message)
    throw error
  } finally {
    useDocumentStore.getState().setIsLoading(false)
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
    const message =
      error instanceof Error
        ? error.message
        : APP_CONSTANTS.MESSAGES.DOCUMENT_UPLOAD_ERROR

    useDocumentStore.getState().setError(message)
    throw error
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
    const message =
      error instanceof Error
        ? error.message
        : APP_CONSTANTS.MESSAGES.DOCUMENT_RENAME_ERROR

    useDocumentStore.getState().setError(message)
    throw error
  }
}

export async function deleteDocumentController(documentId: number) {
  useDocumentStore.getState().setError(null)

  try {
    const response = await deleteDocument(documentId)
    useDocumentStore.getState().removeDocument(documentId)
    return response
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : APP_CONSTANTS.MESSAGES.DOCUMENT_DELETE_ERROR

    useDocumentStore.getState().setError(message)
    throw error
  }
}
