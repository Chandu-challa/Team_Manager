"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ModeToggle({ variant = "outline" }) {
  const [isDarkMode, setIsDarkMode] = React.useState(false)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDarkMode(document.documentElement.classList.contains("dark"))
  }, [])

  const handleToggle = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark")
      setIsDarkMode(false)
    } else {
      document.documentElement.classList.add("dark")
      setIsDarkMode(true)
    }
  }

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={handleToggle}
      className="cursor-pointer"
    >
      {isDarkMode ? (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-transform" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-transform" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
