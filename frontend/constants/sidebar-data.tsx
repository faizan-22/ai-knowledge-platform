import { ROUTES } from "@/constants/routes"
import {
  LayoutDashboardIcon,
  MessageSquareText,
  type LucideIcon,
} from "lucide-react"

export type SidebarPage = {
  name: string
  url: string
  icon: LucideIcon
}

export const SIDEBAR_DATA = {
  pages: [
    {
      name: "Dashboard",
      url: ROUTES.DASHBOARD,
      icon: LayoutDashboardIcon,
    },
    {
      name: "Chat",
      url: ROUTES.CHAT,
      icon: MessageSquareText,
    },
  ],
} satisfies {
  pages: SidebarPage[]
}
