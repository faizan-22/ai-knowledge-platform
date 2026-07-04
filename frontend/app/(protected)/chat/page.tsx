import { Chat } from "@/components/chat"
import { SiteHeader } from "@/components/site-header"

type ChatPageProps = {
  searchParams?: Promise<{
    documentId?: string | string[]
  }>
}

export default async function Page({ searchParams }: ChatPageProps) {
  const params = await searchParams
  const documentIdParam = Array.isArray(params?.documentId)
    ? params?.documentId[0]
    : params?.documentId
  const parsedDocumentId = documentIdParam ? Number(documentIdParam) : null
  const initialDocumentId =
    parsedDocumentId && Number.isInteger(parsedDocumentId)
      ? parsedDocumentId
      : null

  return (
    <>
      <SiteHeader siteName="Chat" />
      <div className="flex h-[calc(100svh-var(--header-height))] min-h-0 flex-col overflow-hidden md:h-[calc(100svh-var(--header-height)-1rem)]">
        <div className="@container/main flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex min-h-0 flex-1 flex-col px-4 py-4 lg:px-6">
            <Chat initialDocumentId={initialDocumentId} />
          </div>
        </div>
      </div>
    </>
  )
}
