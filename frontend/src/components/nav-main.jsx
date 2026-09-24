"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  label,
  items,
}) {
  const pathname = usePathname()

  // Check if any subitem is active to determine if parent should be open
  const shouldBeOpen = (item) => {
    if (item.isActive) return true
    return item.items?.some(subItem => pathname === subItem.url) || false
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            render={<SidebarMenuItem />}
            defaultOpen={shouldBeOpen(item)}
            className="group/collapsible"
          >
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger render={
                    <SidebarMenuButton tooltip={item.title} className="cursor-pointer" />
                  }>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton render={<Link href={subItem.url} className="flex items-center gap-2" />} className="cursor-pointer" isActive={pathname === subItem.url}>
                              {subItem.icon && <subItem.icon className="h-4 w-4" />}
                              <span>{subItem.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : (
                <SidebarMenuButton render={<Link href={item.url} />} tooltip={item.title} className="cursor-pointer" isActive={pathname === item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                </SidebarMenuButton>
              )}
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
