import { Chat } from "@/components/chat"
import { SiteHeader } from "@/components/site-header"

export default function Page() {
  return (
    <>
      <SiteHeader siteName="Chat" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-1 flex-col px-4 py-4 lg:px-6">
            <Chat />
          </div>
        </div>
      </div>
    </>
  )
}
