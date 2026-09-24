"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  MapPin,
  Map as MapIcon,
} from "lucide-react";

const routeMap = {
  "/dashboard": {
    title: "Dashboard",
    description: "Overview and analytics of your organization.",
    icon: LayoutDashboard,
    bg: "bg-sky-50 dark:bg-sky-950/40 text-sky-500 border border-sky-100/50 dark:border-sky-900/20",
    glow: "bg-sky-500",
  },
  "/persons": {
    title: "Persons",
    description: "Manage people, contacts, and assignments.",
    icon: Users,
    bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 border border-emerald-100/50 dark:border-emerald-900/20",
    glow: "bg-emerald-500",
  },
  "/persons/add": {
    title: "Add Person",
    description: "Add a new person to the system.",
    icon: Users,
    bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 border border-emerald-100/50 dark:border-emerald-900/20",
    glow: "bg-emerald-500",
  },
  "/teams": {
    title: "Team Master",
    description: "Manage teams and their types.",
    icon: MapPin,
    bg: "bg-violet-50 dark:bg-violet-950/40 text-violet-500 border border-violet-100/50 dark:border-violet-900/20",
    glow: "bg-violet-500",
  },
  "/team-types": {
    title: "Team Type Master",
    description: "Manage your organization's team types and hierarchy levels.",
    icon: MapIcon,
    bg: "bg-orange-50 dark:bg-orange-950/40 text-orange-500 border border-orange-100/50 dark:border-orange-900/20",
    glow: "bg-orange-500",
  },
  "/users": {
    title: "Users",
    description: "Manage system access and roles.",
    icon: Users,
    bg: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 border border-indigo-100/50 dark:border-indigo-900/20",
    glow: "bg-indigo-500",
  },
};

export function SiteHeader() {
  const pathname = usePathname() || "";
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const currentRoute = React.useMemo(() => {
    if (pathname === "/" || pathname === "/dashboard") {
      return routeMap["/dashboard"];
    }
    const exactMatch = routeMap[pathname];
    if (exactMatch) return exactMatch;

    const matched = Object.entries(routeMap).find(([key]) =>
      pathname.startsWith(key),
    );
    return matched
      ? matched[1]
      : {
          title: "Person Management",
          icon: Users,
          bg: "bg-slate-50 dark:bg-slate-950/40 text-slate-500 border border-slate-100/50 dark:border-slate-900/20",
          glow: "bg-slate-500",
        };
  }, [pathname]);

  const IconComponent = currentRoute.icon;

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full shrink-0 items-center border-b transition-all duration-300 backdrop-blur-xl bg-white/60 dark:bg-slate-950/65 border-slate-200/40 dark:border-slate-800/40">
      <div className="flex w-full items-center gap-2 px-4 md:px-6 relative h-full">
        <SidebarTrigger className="-ml-1 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 rounded-lg p-1.5 transition-colors duration-200 cursor-pointer" />

        <Separator
          orientation="vertical"
          className="mx-1.5 h-4 bg-slate-200/60 dark:bg-slate-800/50"
        />

        {/* Unified, Responsive Dynamic Route Heading & Icon */}
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <div
            className={cn(
              "flex items-center justify-center rounded-lg transition-all duration-300 shrink-0",
              "h-9 w-9 md:h-10 md:w-10",
              currentRoute.bg,
            )}
          >
            <motion.div
              key={pathname}
              initial={{ scale: 0.8, rotate: -15, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 350, damping: 15 }}
            >
              <IconComponent className="h-4.5 w-4.5 md:h-5 md:w-5 shrink-0" />
            </motion.div>
          </div>

          <div className="flex flex-col text-left justify-center min-w-0">
            <h1 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight truncate leading-none md:leading-tight">
              {currentRoute.title}
            </h1>
            <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 tracking-wide truncate mt-0.5 md:mt-0 leading-none">
              {currentRoute.description || "Dashboard"}
            </span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ModeToggle variant="ghost" />
        </div>

        {/* Dynamic Route color border glow line */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-[1.5px] opacity-75 dark:opacity-50 blur-[0.5px] transition-all duration-500",
            currentRoute.glow,
          )}
        />
      </div>
    </header>
  );
}
