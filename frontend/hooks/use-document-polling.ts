"use client"

import { useEffect, useMemo, useRef } from "react"

import { APP_CONSTANTS } from "@/constants/app.constants"
import { loadDocumentsController } from "@/controllers/document.controller"
import { useDocumentStore } from "@/stores/document.store"

export function useDocumentPolling() {
  const documents = useDocumentStore((state) => state.documents)
  const isPollingRef = useRef(false)

  const shouldPollDocuments = useMemo(
    () =>
      documents.some((document) =>
        APP_CONSTANTS.DOCUMENTS.POLLING_STATUSES.some(
          (status) => status === document.status
        )
      ),
    [documents]
  )

  useEffect(() => {
    if (!shouldPollDocuments) {
      return
    }

    const pollDocuments = async () => {
      if (isPollingRef.current) {
        return
      }

      isPollingRef.current = true

      try {
        await loadDocumentsController({ showLoading: false })
      } catch {
        return
      } finally {
        isPollingRef.current = false
      }
    }

    const intervalId = window.setInterval(
      pollDocuments,
      APP_CONSTANTS.DOCUMENTS.POLLING_INTERVAL_MS
    )

    return () => window.clearInterval(intervalId)
  }, [shouldPollDocuments])
}
