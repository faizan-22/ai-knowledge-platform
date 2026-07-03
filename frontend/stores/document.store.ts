import type { DocumentState } from "@/types/document.types"
import { create } from "zustand"

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  isLoading: false,
  error: null,

  setDocuments: (documents) => set({ documents }),
  addDocument: (document) =>
    set((state) => ({ documents: [document, ...state.documents] })),
  updateDocument: (document) =>
    set((state) => ({
      documents: state.documents.map((existingDocument) =>
        existingDocument.id === document.id ? document : existingDocument
      ),
    })),
  removeDocument: (documentId) =>
    set((state) => ({
      documents: state.documents.filter(
        (document) => document.id !== documentId
      ),
    })),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearDocuments: () => set({ documents: [], isLoading: false, error: null }),
}))
