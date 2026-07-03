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
import { APP_CONSTANTS } from "@/constants/app.constants"
import { ROUTES } from "@/constants/routes"
import { SIDEBAR_DATA } from "@/constants/sidebar-data"
import { Brain } from "lucide-react"
import { useUserStore } from "@/stores/user.store"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useUserStore((state) => state.user)

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href={ROUTES.DASHBOARD}>
                <Brain className="size-5!" />
                <span className="text-base font-semibold">
                  {APP_CONSTANTS.APP_NAME}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavPages items={SIDEBAR_DATA.pages} />
      </SidebarContent>
      <SidebarFooter>
        {user ? <NavUser {...user} /> : null}
      </SidebarFooter>
    </Sidebar>
  )
}
