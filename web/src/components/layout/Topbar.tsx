'use client'

import { useState } from 'react'
import { Menu, BrainCircuit, Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { SidebarContent } from '@/components/layout/Sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'

interface TopbarProps {
  user?: {
    name: string
    email: string
    avatarUrl?: string
  }
}

export function Topbar({ user }: TopbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const displayName = user?.name ?? 'User'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
        <button
          id="mobile-sidebar-toggle"
          aria-label="Open navigation menu"
          onClick={() => setMobileOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-1.5 lg:hidden">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold tracking-tight">ResumeIQ</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          <button
            id="notifications-btn"
            aria-label="Notifications"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Bell className="h-4 w-4" />
          </button>

          <Separator orientation="vertical" className="h-6" />

          <DropdownMenu>
            <DropdownMenuTrigger
              id="user-menu-trigger"
              aria-label="Open user menu"
              className="flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent focus-visible:outline-none"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatarUrl} alt={displayName} />
                <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[140px] truncate font-medium sm:inline">
                {displayName}
              </span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                {user?.email && (
                  <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem id="menu-profile">Profile</DropdownMenuItem>
              <DropdownMenuItem id="menu-settings">Settings</DropdownMenuItem>
              <DropdownMenuItem id="menu-billing">Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                id="menu-sign-out"
                className="text-destructive focus:text-destructive"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  )
}
