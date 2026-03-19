'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Menu, BrainCircuit, LogOut, LogIn } from 'lucide-react'
import { useCurrentUser } from '@/hooks/use-current-user'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import { buttonVariants } from '@/components/ui/button'

export function Topbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, isLoading, isAuthenticated } = useCurrentUser()

  const displayName = user?.name ?? ''
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <header className="bg-background flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <button
          id="mobile-sidebar-toggle"
          aria-label="Open navigation menu"
          onClick={() => setMobileOpen(true)}
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex h-8 w-8 items-center justify-center rounded-md transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-1.5 lg:hidden">
          <BrainCircuit className="text-primary h-5 w-5" />
          <span className="text-sm font-semibold tracking-tight">ResumeIQ</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          <Separator orientation="vertical" className="h-6" />

          {!isLoading && !isAuthenticated && (
            <Link
              id="login-button"
              href="/login"
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              <LogIn className="mr-1.5 h-4 w-4" />
              Log in
            </Link>
          )}

          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger
                id="user-menu-trigger"
                aria-label="Open user menu"
                className="hover:bg-accent flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors focus-visible:outline-none"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.image || undefined} alt={displayName || 'User'} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[140px] truncate font-medium sm:inline">
                  {displayName || user?.email}
                </span>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm leading-none font-medium">{displayName || user?.email}</p>
                    {user?.email && displayName && (
                      <p className="text-muted-foreground mt-1 truncate text-xs">{user.email}</p>
                    )}
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem id="menu-profile">Profile</DropdownMenuItem>
                <DropdownMenuItem id="menu-settings">Settings</DropdownMenuItem>
                <DropdownMenuItem id="menu-billing">Billing</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  id="menu-sign-out"
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
    </>
  )
}
