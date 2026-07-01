"use client"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Brain } from "lucide-react"
import { useRouter } from "next/navigation"

export function DashboardKey() {
  const router = useRouter()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={() => router.push('/dashboard')}
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-mauve-700 text-sidebar-primary-foreground">
            <Brain className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-medium">AI Knowledge Platform</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
