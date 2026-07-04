"use client"

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import {
  FileTextIcon,
  LoaderCircleIcon,
  MessageSquareTextIcon,
  RefreshCwIcon,
  SendIcon,
  UploadIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { APP_CONSTANTS } from "@/constants/app.constants"
import { sendChatMessageController } from "@/controllers/chat.controller"
import {
  loadDocumentsController,
  uploadDocumentController,
} from "@/controllers/document.controller"
import { cn } from "@/lib/utils"
import { useDocumentStore } from "@/stores/document.store"
import type { ChatMessage, ChatResponse, Sources } from "@/types/chat.types"
import type { Document } from "@/types/document.types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function formatFileSize(size: number) {
  if (!size) {
    return "0 KB"
  }

  const units = ["B", "KB", "MB", "GB"]
  const unitIndex = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1
  )
  const value = size / 1024 ** unitIndex

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function getTitleFromFileName(fileName: string) {
  return fileName.replace(/\.pdf$/i, "")
}

function getStatusBadgeClassName(status: string) {
  switch (status) {
    case "READY":
      return "border-green-200 bg-green-50 text-green-700 dark:border-green-900/60 dark:bg-green-950/50 dark:text-green-300"
    case "PROCESSING":
      return "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/60 dark:bg-yellow-950/50 dark:text-yellow-300"
    case "FAILED":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300"
    default:
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-300"
  }
}

function createMessage(
  role: ChatMessage["role"],
  content: string,
  sources: Sources[]
): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
    sources,
  }
}

function formatSourceLabel(source: Sources) {
  return `[${source.id}] Page ${source.pageNumber}`
}

function getChatPlaceholder(selectedDocument: Document | null, canChat: boolean) {
  if (!selectedDocument) {
    return "Choose a document before asking"
  }

  if (!canChat) {
    return "Selected document is not ready for chat"
  }

  return "Ask a question about this document"
}

function getEmptyStateTitle(selectedDocument: Document | null, canChat: boolean) {
  if (!selectedDocument) {
    return "Choose a document to start"
  }

  if (!canChat) {
    return "Selected document is not ready for chat"
  }

  return `Ready to chat with ${selectedDocument.title}`
}

export function Chat({
  initialDocumentId,
}: {
  initialDocumentId?: number | null
}) {
  const documents = useDocumentStore((state) => state.documents)
  const isLoadingDocuments = useDocumentStore((state) => state.isLoading)
  const documentError = useDocumentStore((state) => state.error)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  )
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [query, setQuery] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [uploadTitle, setUploadTitle] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const uploadFileInputRef = useRef<HTMLInputElement>(null)
  const queryInputRef = useRef<HTMLInputElement>(null)
  const messageListRef = useRef<HTMLDivElement>(null)

  const readyDocuments = useMemo(
    () => documents.filter((document) => document.status === "READY"),
    [documents]
  )
  const canChat = selectedDocument?.status === "READY"
  const chatPlaceholder = getChatPlaceholder(selectedDocument, canChat)
  const emptyStateTitle = getEmptyStateTitle(selectedDocument, canChat)
  const sourceReferences = useMemo(() => {
    const seenSources = new Set<string>()

    return messages
      .filter((message) => message.role === "assistant")
      .flatMap((message) => message.sources)
      .filter((source) => {
        const sourceKey = `${source.id}-${source.pageNumber}`

        if (seenSources.has(sourceKey)) {
          return false
        }

        seenSources.add(sourceKey)
        return true
      })
      .slice(0, 6)
  }, [messages])

  useEffect(() => {
    loadDocumentsController().catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!initialDocumentId || documents.length === 0) {
      return
    }

    const requestedDocument = documents.find(
      (document) => document.id === initialDocumentId
    )

    if (!requestedDocument || selectedDocument?.id === requestedDocument.id) {
      return
    }

    setSelectedDocument(requestedDocument)
    setMessages([])
    setQuery("")
    setIsDocumentDialogOpen(false)
  }, [documents, initialDocumentId, selectedDocument?.id])

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages])

  useEffect(() => {
    if (!isSending && canChat) {
      queryInputRef.current?.focus()
    }
  }, [canChat, isSending])

  function resetUploadForm() {
    setUploadTitle("")
    setUploadFile(null)

    if (uploadFileInputRef.current) {
      uploadFileInputRef.current.value = ""
    }
  }

  function handleUploadFileChange(file: File | null) {
    setUploadFile(file)
    setUploadTitle(file ? getTitleFromFileName(file.name) : "")
  }

  function handleSelectDocument(document: Document) {
    setSelectedDocument(document)
    setMessages([])
    setQuery("")
    setIsDocumentDialogOpen(false)
  }

  async function handleUploadDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!uploadFile) {
      toast.error(APP_CONSTANTS.MESSAGES.DOCUMENT_FILE_REQUIRED)
      return
    }

    setIsUploading(true)

    const uploadPromise = uploadDocumentController(uploadFile, uploadTitle)

    toast.promise(uploadPromise, {
      loading: APP_CONSTANTS.MESSAGES.DOCUMENT_UPLOAD_LOADING,
      success: APP_CONSTANTS.MESSAGES.DOCUMENT_UPLOAD_SUCCESS,
      error: APP_CONSTANTS.MESSAGES.DOCUMENT_UPLOAD_ERROR,
    })

    try {
      const response = await uploadPromise
      resetUploadForm()

      if (response.data.status === "READY") {
        handleSelectDocument(response.data)
        return
      }

      toast.info(APP_CONSTANTS.MESSAGES.CHAT_DOCUMENT_NOT_READY)
      await loadDocumentsController().catch(() => undefined)
    } catch {
      return
    } finally {
      setIsUploading(false)
    }
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canChat || !selectedDocument) {
      setIsDocumentDialogOpen(true)
      return
    }

    const nextQuery = query.trim()

    if (!nextQuery) {
      toast.error(APP_CONSTANTS.MESSAGES.CHAT_QUERY_REQUIRED)
      return
    }

    const userMessage = createMessage("user", nextQuery, [])
    setMessages((currentMessages) => [...currentMessages, userMessage])
    setQuery("")
    setIsSending(true)

    try {
      const response: ChatResponse = await sendChatMessageController(
        selectedDocument.id,
        nextQuery
      )
      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage("assistant", response.data.answer, response.data.sources),
      ])
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : APP_CONSTANTS.MESSAGES.CHAT_SEND_ERROR

      toast.error(message)
      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage("assistant", APP_CONSTANTS.MESSAGES.CHAT_SEND_ERROR, []),
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border bg-background shadow-sm">
      <Dialog
        open={isDocumentDialogOpen}
        onOpenChange={(open) => {
          if (isUploading) {
            return
          }

          setIsDocumentDialogOpen(Boolean(open || !selectedDocument))
        }}
      >
        <DialogContent
          className="sm:max-w-2xl"
          showCloseButton={Boolean(selectedDocument)}
        >
          <DialogHeader>
            <DialogTitle>
              {APP_CONSTANTS.MESSAGES.CHAT_DOCUMENT_DIALOG_TITLE}
            </DialogTitle>
            <DialogDescription>
              {APP_CONSTANTS.MESSAGES.CHAT_DOCUMENT_DIALOG_DESCRIPTION}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="uploaded">
            <TabsList>
              <TabsTrigger value="uploaded">Uploaded</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="uploaded" className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {readyDocuments.length} ready document
                  {readyDocuments.length === 1 ? "" : "s"}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => loadDocumentsController().catch(() => undefined)}
                  disabled={isLoadingDocuments}
                >
                  <RefreshCwIcon
                    className={isLoadingDocuments ? "animate-spin" : ""}
                  />
                  Refresh
                </Button>
              </div>

              {documentError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {documentError}
                </div>
              ) : null}

              <div className="max-h-80 overflow-y-auto rounded-lg border">
                {documents.length === 0 && !isLoadingDocuments ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No uploaded documents yet.
                  </div>
                ) : null}

                {isLoadingDocuments && documents.length === 0 ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
                    <LoaderCircleIcon className="size-4 animate-spin" />
                    Loading documents...
                  </div>
                ) : null}

                {documents.map((document) => {
                  const isReady = document.status === "READY"

                  return (
                    <button
                      key={document.id}
                      type="button"
                      disabled={!isReady}
                      onClick={() => handleSelectDocument(document)}
                      className={cn(
                        "flex w-full items-center gap-3 border-b px-4 py-3 text-left last:border-b-0 hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60",
                        selectedDocument?.id === document.id && "bg-muted/60"
                      )}
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300">
                        <FileTextIcon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {document.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {document.originalFileName}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={getStatusBadgeClassName(document.status)}
                      >
                        {formatStatus(document.status)}
                      </Badge>
                    </button>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="upload">
              <form onSubmit={handleUploadDocument} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="chat-document-file">
                    {APP_CONSTANTS.MESSAGES.DOCUMENT_UPLOAD_FILE_LABEL}
                  </Label>
                  <div className="rounded-lg border border-dashed bg-muted/20 p-3">
                    <Input
                      ref={uploadFileInputRef}
                      id="chat-document-file"
                      type="file"
                      accept="application/pdf"
                      disabled={isUploading}
                      required
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null

                        handleUploadFileChange(file)
                      }}
                    />
                    <div className="flex flex-col gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-fit"
                        disabled={isUploading}
                        onClick={() => uploadFileInputRef.current?.click()}
                      >
                        <UploadIcon />
                        {
                          APP_CONSTANTS.MESSAGES
                            .DOCUMENT_UPLOAD_CHOOSE_FILE_BUTTON
                        }
                      </Button>

                      {uploadFile ? (
                        <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-2">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300">
                            <FileTextIcon className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {uploadFile.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(uploadFile.size)}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={
                              APP_CONSTANTS.MESSAGES
                                .DOCUMENT_UPLOAD_REMOVE_FILE_LABEL
                            }
                            disabled={isUploading}
                            onClick={() => {
                              handleUploadFileChange(null)

                              if (uploadFileInputRef.current) {
                                uploadFileInputRef.current.value = ""
                              }
                            }}
                          >
                            <XIcon />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {APP_CONSTANTS.MESSAGES.DOCUMENT_UPLOAD_FILE_HELP}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="chat-document-title">
                    {APP_CONSTANTS.MESSAGES.DOCUMENT_UPLOAD_TITLE_LABEL}
                  </Label>
                  <Input
                    id="chat-document-title"
                    value={uploadTitle}
                    onChange={(event) => setUploadTitle(event.target.value)}
                    disabled={isUploading}
                    required
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={isUploading}
                    className="sm:ml-auto"
                  >
                    {isUploading ? (
                      <LoaderCircleIcon className="animate-spin" />
                    ) : (
                      <UploadIcon />
                    )}
                    {isUploading
                      ? APP_CONSTANTS.MESSAGES.DOCUMENT_UPLOAD_BUTTON_LOADING
                      : APP_CONSTANTS.MESSAGES.DOCUMENT_UPLOAD_BUTTON}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b bg-background/95 px-5 py-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            Document Chat
          </h3>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {selectedDocument
              ? `Ask anything about ${selectedDocument.title}`
              : "Choose a document to start a focused research session."}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsDocumentDialogOpen(true)}
          className="shrink-0"
        >
          <FileTextIcon />
          {selectedDocument ? "Change document" : "Choose document"}
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-h-0 flex-col overflow-hidden bg-background">
          <div
            ref={messageListRef}
            className="min-h-0 flex-1 overflow-y-auto bg-muted/15 px-4 py-8"
          >
            <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-7">
              {messages.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-lg border bg-background text-muted-foreground shadow-xs">
                    <MessageSquareTextIcon className="size-5" />
                  </div>
                  <p className="text-base font-medium">{emptyStateTitle}</p>
                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    Questions are sent to the current document only. Responses
                    will include source citations when the document provides
                    them.
                  </p>
                </div>
              ) : null}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" && "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "text-sm leading-7",
                      message.role === "user"
                        ? "max-w-[76%] rounded-2xl bg-primary px-4 py-2.5 text-primary-foreground shadow-xs"
                        : "w-full text-foreground"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.role === "assistant" &&
                    message.sources.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {message.sources.map((source) => (
                          <Badge
                            key={`${message.id}-${source.id}-${source.pageNumber}-${source.chunkIndex}`}
                            variant="outline"
                            className="h-5 rounded-md border-border bg-background px-2 font-mono text-[0.625rem] font-medium text-muted-foreground shadow-xs"
                          >
                            {formatSourceLabel(source)}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}

              {isSending ? (
                <div className="flex">
                  <div
                    aria-label={APP_CONSTANTS.MESSAGES.CHAT_SEND_LOADING}
                    className="flex items-center gap-1 py-2"
                  >
                    <span className="size-1 animate-bounce bounce rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
                    <span className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
                    <span className="size-1 animate-bounce rounded-full bg-muted-foreground" />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <form
            onSubmit={handleSendMessage}
            className="shrink-0 bg-background px-4 py-4"
          >
            <div className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-xl border bg-card p-2 shadow-sm">
              <Input
                ref={queryInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={chatPlaceholder}
                disabled={!canChat || isSending}
                className="h-10 flex-1 border-0 bg-transparent px-2 shadow-none focus-visible:ring-0"
              />
              <Button
                type="submit"
                disabled={!canChat || isSending || !query.trim()}
                aria-label="Send message"
                size="icon"
                className="size-9 rounded-lg shadow-xs"
              >
                {isSending ? (
                  <LoaderCircleIcon className="animate-spin" />
                ) : (
                  <SendIcon className="size-5" />
                )}
              </Button>
            </div>
          </form>
        </div>

        <aside className="min-h-0 overflow-y-auto border-t bg-card p-5 lg:border-t-0 lg:border-l">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300">
              <FileTextIcon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Current document
              </p>
              <p className="mt-1 truncate text-sm font-semibold">
                {selectedDocument?.title ?? "No document selected"}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {selectedDocument?.originalFileName ??
                  "Select or upload a document to begin."}
              </p>
            </div>
          </div>

          {selectedDocument ? (
            <div className="mt-6 grid gap-6">
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    variant="outline"
                    className={getStatusBadgeClassName(selectedDocument.status)}
                  >
                    {formatStatus(selectedDocument.status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Type</span>
                  <span className="truncate text-right">
                    {selectedDocument.mimeType}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Size</span>
                  <span>{formatFileSize(selectedDocument.size)}</span>
                </div>
              </div>

              {sourceReferences.length > 0 ? (
                <div className="border-t pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">Sources</p>
                    <span className="text-xs text-muted-foreground">
                      {sourceReferences.length}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {sourceReferences.map((source) => (
                      <Badge
                        key={`rail-${source.id}-${source.pageNumber}-${source.chunkIndex}`}
                        variant="outline"
                        className="h-6 rounded-md bg-background font-mono text-[0.625rem] text-muted-foreground"
                      >
                        {formatSourceLabel(source)}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-dashed bg-muted/20 px-3 py-8 text-center text-sm text-muted-foreground">
              The attached document details will appear here.
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
