"use client"

import * as React from "react"

import { NavPages } from "@/components/nav-pages"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, Brain, MessageSquareText } from "lucide-react"
import { useUserStore } from "@/stores/user.store"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useUserStore((state)=>state.user)
  console.log(`User = ${user}`)
  const data = {
    pages: [
      {
        name: "Dashboard",
        url: "#",
        icon: <LayoutDashboardIcon />,
      },
      {
        name: "Chat",
        url: "#",
        icon: <MessageSquareText />,
      },
    ],
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <Brain className="size-5!" />
                <span className="text-base font-semibold">
                  AI Knowledge Platform
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavPages items={data.pages} />
      </SidebarContent>
      <SidebarFooter>
        {user ? <NavUser {...user} /> : null}
      </SidebarFooter>
    </Sidebar>
  )
}
