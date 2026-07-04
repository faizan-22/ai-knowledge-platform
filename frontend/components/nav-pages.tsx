"use client"

import { APP_CONSTANTS } from "@/constants/app.constants"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { type LucideIcon } from "lucide-react"

export function NavPages({
  items,
}: {
  items: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const pathname = usePathname()

  function isActivePage(url: string) {
    if (url === APP_CONSTANTS.LINKS.PLACEHOLDER) {
      return false
    }

    return pathname === url || pathname.startsWith(`${url}/`)
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Pages</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = isActivePage(item.url)

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={isActive}>
                <Link
                  href={item.url}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
