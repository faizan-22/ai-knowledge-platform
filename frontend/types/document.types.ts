export type Document = {
  id: number
  title: string
  originalFileName: string
  filePath: string
  mimeType: string
  size: number
  status: string
}

export type DocumentsResponse = {
  success: boolean
  statusCode: number
  data: Document[]
  timeStamp: string
  path: string
}

export type DocumentResponse = {
  success: boolean
  statusCode: number
  data: Document
  timeStamp: string
  path: string
}

export type DocumentState = {
  documents: Document[]
  isLoading: boolean
  error: string | null
  setDocuments: (documents: Document[]) => void
  addDocument: (document: Document) => void
  updateDocument: (document: Document) => void
  removeDocument: (documentId: number) => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  clearDocuments: () => void
}
