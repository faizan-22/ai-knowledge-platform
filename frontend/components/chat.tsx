"use client"

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import {
  BotIcon,
  FileTextIcon,
  LoaderCircleIcon,
  MessageSquareTextIcon,
  RefreshCwIcon,
  SendIcon,
  UploadIcon,
  UserIcon,
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
import type { ChatMessage } from "@/types/chat.types"
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

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
  }
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

export function Chat() {
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
  const messageListRef = useRef<HTMLDivElement>(null)

  const readyDocuments = useMemo(
    () => documents.filter((document) => document.status === "READY"),
    [documents]
  )
  const canChat = selectedDocument?.status === "READY"
  const chatPlaceholder = getChatPlaceholder(selectedDocument, canChat)
  const emptyStateTitle = getEmptyStateTitle(selectedDocument, canChat)

  useEffect(() => {
    loadDocumentsController().catch(() => undefined)
  }, [])

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages])

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

    const userMessage = createMessage("user", nextQuery)
    setMessages((currentMessages) => [...currentMessages, userMessage])
    setQuery("")
    setIsSending(true)

    try {
      const response = await sendChatMessageController(
        selectedDocument.id,
        nextQuery
      )
      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage("assistant", response.data),
      ])
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : APP_CONSTANTS.MESSAGES.CHAT_SEND_ERROR

      toast.error(message)
      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage("assistant", APP_CONSTANTS.MESSAGES.CHAT_SEND_ERROR),
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-var(--header-height)-2rem)] flex-1 flex-col gap-4">
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            Document Chat
          </h3>
          <p className="text-sm text-muted-foreground">
            Ask questions against one selected document.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsDocumentDialogOpen(true)}
        >
          <FileTextIcon />
          {selectedDocument ? "Change document" : "Choose document"}
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="relative flex min-h-[32rem] flex-col overflow-hidden rounded-lg border bg-card">
          <div
            ref={messageListRef}
            className="flex-1 space-y-4 overflow-y-auto p-4 pb-24"
          >
            {messages.length === 0 ? (
              <div className="flex h-full min-h-80 flex-col items-center justify-center text-center">
                <div className="mb-3 flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <MessageSquareTextIcon className="size-5" />
                </div>
                <p className="font-medium">{emptyStateTitle}</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Questions are sent to the current document only. Chat history
                  is kept on this screen for now.
                </p>
              </div>
            ) : null}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" && "justify-end"
                )}
              >
                {message.role === "assistant" ? (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <BotIcon className="size-4" />
                  </div>
                ) : null}
                <div
                  className={cn(
                    "max-w-[82%] rounded-lg border px-3 py-2 text-sm leading-6",
                    message.role === "user"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" ? (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <UserIcon className="size-4" />
                  </div>
                ) : null}
              </div>
            ))}

            {isSending ? (
              <div className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <BotIcon className="size-4" />
                </div>
                <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground">
                  <LoaderCircleIcon className="size-4 animate-spin" />
                  {APP_CONSTANTS.MESSAGES.CHAT_SEND_LOADING}
                </div>
              </div>
            ) : null}
          </div>

          <form
            onSubmit={handleSendMessage}
            className="absolute inset-x-4 bottom-4 rounded-lg border bg-background/95 p-2 shadow-lg backdrop-blur"
          >
            <div className="flex items-center gap-2">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={chatPlaceholder}
                disabled={!canChat || isSending}
                className="h-9 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!canChat || isSending || !query.trim()}
                aria-label="Send message"
              >
                {isSending ? (
                  <LoaderCircleIcon className="animate-spin" />
                ) : (
                  <SendIcon />
                )}
              </Button>
            </div>
          </form>
        </div>

        <aside className="rounded-lg border bg-card p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300">
              <FileTextIcon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {selectedDocument?.title ?? "No document selected"}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {selectedDocument?.originalFileName ??
                  "Select or upload a document to begin."}
              </p>
            </div>
          </div>

          {selectedDocument ? (
            <div className="mt-5 grid gap-3 text-sm">
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
                <span>{selectedDocument.mimeType}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Size</span>
                <span>{formatFileSize(selectedDocument.size)}</span>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-md border border-dashed px-3 py-8 text-center text-sm text-muted-foreground">
              The attached document details will appear here.
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
