'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Upload, FileText, BrainCircuit, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Upload Resume', href: '/upload', icon: Upload },
  { label: 'My Resumes', href: '/resumes', icon: FileText },
  { label: 'Job Match Analysis', href: '/analysis', icon: BrainCircuit },
]

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 px-4">
        <BrainCircuit className="h-6 w-6 text-primary" />
        <span className="text-base font-semibold tracking-tight">ResumeIQ</span>
      </div>

      <Separator />

      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main navigation">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Tooltip key={href}>
              <TooltipTrigger
                id={`nav-tooltip-${label.toLowerCase().replace(/\s+/g, '-')}`}
                render={
                  <Link
                    id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{label}</span>
                    {active && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />}
                  </Link>
                }
              />
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          )
        })}
      </nav>

      <Separator />

      <div className="p-4 text-xs text-muted-foreground">
        ResumeIQ &copy; {new Date().getFullYear()}
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-background lg:flex">
      <SidebarContent />
    </aside>
  )
}
