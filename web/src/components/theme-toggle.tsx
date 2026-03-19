"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted ? resolvedTheme === "dark" : false

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  return (
    <div className="flex items-center gap-2">
      <Sun className="text-muted-foreground h-4 w-4" aria-hidden="true" />
      <Switch
        id="theme-toggle"
        aria-label="Toggle dark mode"
        checked={isDark}
        onCheckedChange={handleToggle}
      />
      <Moon className="text-muted-foreground h-4 w-4" aria-hidden="true" />
    </div>
  )
}
