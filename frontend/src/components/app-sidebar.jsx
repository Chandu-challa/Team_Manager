"use client";

import * as React from "react";
import { 
  LayoutDashboard,
  Users,
  MapPin,
  Map as MapIcon,
  Settings, Map } from "lucide-react";
import Link from "next/link";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/AuthContext";

export function AppSidebar(props) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const navGroups = [
    {
      label: "Main Menu",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Persons",
          url: "/persons",
          icon: Users,
        },
      ],
    },
    {
      label: "Configuration",
      items: [
        {
          title: "Teams",
          url: "/teams",
          icon: MapPin,
        },
        {
          title: "Team Types",
          url: "/team-types",
          icon: MapIcon,
        },
        ...(user?.role === "ADMIN" ? [{
          title: "Users",
          url: "/users",
          icon: Users,
        }] : []),
      ],
    },
  ];

  const userData = {
    name: user?.full_name || "User",
    email: user?.email || "",
    avatar: "",
  };

  return (
    <Sidebar
      className="bg-slate-50/75 dark:bg-slate-950/80 backdrop-blur-xl border-r border-slate-200/40 dark:border-slate-800/40 *:data-[sidebar=sidebar]:bg-transparent"
      {...props}
    >
      <SidebarHeader className="border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="transition-all hover:bg-sidebar-accent/50 p-2 h-auto"
              render={<Link href="/dashboard" className="flex items-center gap-3 w-full" />}
            >
                <div className="relative flex h-9 w-9 items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105 bg-blue-600 rounded-lg text-white font-bold text-sm">
                  PM
                </div>
                <div className="flex flex-col text-left leading-none min-w-0 transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
                  <span className="truncate text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                    Person Mgmt
                  </span>
                  <span className="text-[10px] font-semibold text-sky-500 dark:text-sky-400 mt-0.5 tracking-wider uppercase">
                    Dashboard
                  </span>
                </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} onLogout={handleLogout} />
      </SidebarFooter>
    </Sidebar>
  );
}



