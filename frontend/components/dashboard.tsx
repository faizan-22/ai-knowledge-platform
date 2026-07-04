"use client"

import { useEffect, useRef, useState } from "react"
import {
  EllipsisIcon,
  EyeIcon,
  FileTextIcon,
  MessageSquareTextIcon,
  PencilIcon,
  RefreshCwIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { APP_CONSTANTS } from "@/constants/app.constants"
import { ROUTES } from "@/constants/routes"
import {
  deleteDocumentController,
  loadDocumentsController,
  renameDocumentController,
  uploadDocumentController,
} from "@/controllers/document.controller"
import { useDocumentStore } from "@/stores/document.store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Document } from "@/types/document.types"

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

function formatMimeType(mimeType: string) {
  return mimeType === "application/pdf" ? "PDF" : mimeType
}

function getTitleFromFileName(fileName: string) {
  return fileName.replace(/\.pdf$/i, "")
}

function getStatusBadgeClassName(status: string) {
  switch (status) {
    case "UPLOADED":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-300"
    case "PROCESSING":
      return "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/60 dark:bg-yellow-950/50 dark:text-yellow-300"
    case "READY":
      return "border-green-200 bg-green-50 text-green-700 dark:border-green-900/60 dark:bg-green-950/50 dark:text-green-300"
    case "FAILED":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300"
    default:
      return ""
  }
}

export function Dashboard() {
  const router = useRouter()
  const documents = useDocumentStore((state) => state.documents)
  const isLoading = useDocumentStore((state) => state.isLoading)
  const error = useDocumentStore((state) => state.error)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploadTitle, setUploadTitle] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const uploadFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadDocumentsController().catch(() => undefined)
  }, [])

  function resetUploadForm() {
    setUploadTitle("")
    setUploadFile(null)

    if (uploadFileInputRef.current) {
      uploadFileInputRef.current.value = ""
    }
  }

  function handleUploadFileChange(file: File | null) {
    if (file && file.size > APP_CONSTANTS.DOCUMENTS.MAX_UPLOAD_FILE_SIZE_BYTES) {
      toast.error(APP_CONSTANTS.MESSAGES.DOCUMENT_FILE_SIZE_ERROR)

      if (uploadFileInputRef.current) {
        uploadFileInputRef.current.value = ""
      }

      return
    }

    setUploadFile(file)
    setUploadTitle(file ? getTitleFromFileName(file.name) : "")
  }

  async function handleUploadDocument(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!uploadFile) {
      toast.error(APP_CONSTANTS.MESSAGES.DOCUMENT_FILE_REQUIRED)
      return
    }

    if (uploadFile.type !== "application/pdf") {
      toast.error(APP_CONSTANTS.MESSAGES.DOCUMENT_FILE_TYPE_ERROR)
      return
    }

    if (uploadFile.size > APP_CONSTANTS.DOCUMENTS.MAX_UPLOAD_FILE_SIZE_BYTES) {
      toast.error(APP_CONSTANTS.MESSAGES.DOCUMENT_FILE_SIZE_ERROR)
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
      await uploadPromise
      resetUploadForm()
      setIsUploadDialogOpen(false)
    } catch {
      return
    } finally {
      setIsUploading(false)
    }
  }

  function handleRenameDocument(document: Document) {
    const nextTitle = window.prompt(
      APP_CONSTANTS.MESSAGES.DOCUMENT_RENAME_PROMPT,
      document.title
    )

    if (nextTitle === null || nextTitle.trim() === document.title) {
      return
    }

    toast.promise(renameDocumentController(document.id, nextTitle), {
      loading: APP_CONSTANTS.MESSAGES.DOCUMENT_RENAME_LOADING,
      success: APP_CONSTANTS.MESSAGES.DOCUMENT_RENAME_SUCCESS,
      error: APP_CONSTANTS.MESSAGES.DOCUMENT_RENAME_ERROR,
    })
  }

  function handleDeleteDocument(document: Document) {
    const shouldDelete = window.confirm(
      APP_CONSTANTS.MESSAGES.DOCUMENT_DELETE_CONFIRM(document.title)
    )

    if (!shouldDelete) {
      return
    }

    toast.promise(deleteDocumentController(document.id), {
      loading: APP_CONSTANTS.MESSAGES.DOCUMENT_DELETE_LOADING,
      success: APP_CONSTANTS.MESSAGES.DOCUMENT_DELETE_SUCCESS,
      error: APP_CONSTANTS.MESSAGES.DOCUMENT_DELETE_ERROR,
    })
  }

  function handleOpenInChat(document: Document) {
    router.push(`${ROUTES.CHAT}?documentId=${document.id}`)
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Documents</h3>
          <p className="text-sm text-muted-foreground">
            {documents.length} uploaded document
            {documents.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={(open) => {
              if (isUploading) {
                return
              }

              setIsUploadDialogOpen(open)

              if (!open) {
                resetUploadForm()
              }
            }}
          >
            <DialogTrigger asChild>
              <Button type="button" size="sm">
                <UploadIcon />
                {APP_CONSTANTS.MESSAGES.DOCUMENT_UPLOAD_BUTTON}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleUploadDocument} className="grid gap-4">
                <DialogHeader>
                  <DialogTitle>
                    {APP_CONSTANTS.MESSAGES.DOCUMENT_UPLOAD_DIALOG_TITLE}
                  </DialogTitle>
                  <DialogDescription>
                    {APP_CONSTANTS.MESSAGES.DOCUMENT_UPLOAD_DIALOG_DESCRIPTION}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-2">
                  <Label htmlFor="document-file">
                    {APP_CONSTANTS.MESSAGES.DOCUMENT_UPLOAD_FILE_LABEL}
                  </Label>
                  <div className="rounded-lg border border-dashed bg-muted/20 p-3">
                    <Input
                      ref={uploadFileInputRef}
                      id="document-file"
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
                  <Label htmlFor="document-title">
                    {APP_CONSTANTS.MESSAGES.DOCUMENT_UPLOAD_TITLE_LABEL}
                  </Label>
                  <Input
                    id="document-title"
                    value={uploadTitle}
                    onChange={(event) => setUploadTitle(event.target.value)}
                    disabled={isUploading}
                    required
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUploadDialogOpen(false)}
                    disabled={isUploading}
                  >
                    {APP_CONSTANTS.MESSAGES.DOCUMENT_UPLOAD_CANCEL_BUTTON}
                  </Button>
                  <Button type="submit" disabled={isUploading}>
                    {isUploading
                      ? APP_CONSTANTS.MESSAGES.DOCUMENT_UPLOAD_BUTTON_LOADING
                      : APP_CONSTANTS.MESSAGES.DOCUMENT_UPLOAD_BUTTON}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => loadDocumentsController().catch(() => undefined)}
            disabled={isLoading}
          >
            <RefreshCwIcon className={isLoading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {isLoading && documents.length === 0 ? (
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table className="table-fixed">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[24%] px-4">Document</TableHead>
                <TableHead className="w-[28%]">File Name</TableHead>
                <TableHead className="w-[10%]">Type</TableHead>
                <TableHead className="w-[10%]">Size</TableHead>
                <TableHead className="w-[12%]">Status</TableHead>
                <TableHead className="w-[12%]">Chat</TableHead>
                <TableHead className="w-20 pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index} className="h-14">
                  {Array.from({ length: 7 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex} className="px-4">
                      <div className="h-4 w-full max-w-36 animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {!isLoading && documents.length === 0 ? (
        <div className="rounded-lg border border-dashed px-6 py-10 text-center">
          <FileTextIcon className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="font-medium">No documents uploaded yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Uploaded documents will appear here.
          </p>
        </div>
      ) : null}

      {documents.length > 0 ? (
        <div className="overflow-hidden rounded-lg border bg-card shadow-xs">
          <Table className="table-fixed">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[24%] px-4">Document</TableHead>
                <TableHead className="w-[28%]">File Name</TableHead>
                <TableHead className="w-[10%]">Type</TableHead>
                <TableHead className="w-[10%]">Size</TableHead>
                <TableHead className="w-[10%]">Status</TableHead>
                <TableHead className="w-[14%]">Chat</TableHead>
                <TableHead className="w-20 pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id} className="h-14">
                  <TableCell className="px-4 font-medium">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300">
                        <FileTextIcon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate">{document.title}</span>
                        <span className="block truncate text-xs font-normal text-muted-foreground">
                          PDF document
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <span className="block truncate">
                      {document.originalFileName}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatMimeType(document.mimeType)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatFileSize(document.size)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusBadgeClassName(document.status)}
                    >
                      {formatStatus(document.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenInChat(document)}
                    >
                      <MessageSquareTextIcon />
                      Open in chat
                    </Button>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`More actions for ${document.title}`}
                        >
                          <EllipsisIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <EyeIcon />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRenameDocument(document)}
                        >
                          <PencilIcon />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDeleteDocument(document)}
                        >
                          <Trash2Icon />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </section>
  )
}
