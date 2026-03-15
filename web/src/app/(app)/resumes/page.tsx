import { Metadata } from 'next'
import Link from 'next/link'
import { FileText, MoreHorizontal, Eye, RefreshCw } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'My Resumes — ResumeIQ',
  description: 'Manage and review your uploaded resumes.',
}

// MOCK DATA
const resumes = [
  {
    id: '1',
    name: 'Frontend_Dev_Resume_v2.pdf',
    uploadDate: 'Today, 2:30 PM',
    targetRole: 'Senior React Developer',
    score: 85,
    status: 'Analyzed',
  },
  {
    id: '2',
    name: 'Software_Engineer_Google.pdf',
    uploadDate: 'Yesterday, 10:15 AM',
    targetRole: 'Software Engineer II',
    score: 62,
    status: 'Analyzed',
  },
  {
    id: '3',
    name: 'Fullstack_Resume_2023.pdf',
    uploadDate: 'Oct 12, 2023',
    targetRole: 'Full Stack Developer',
    score: 74,
    status: 'Analyzed',
  },
  {
    id: '4',
    name: 'Product_Manager_CV_Draft.pdf',
    uploadDate: 'Sep 28, 2023',
    targetRole: 'Product Manager',
    score: 0,
    status: 'Processing',
  },
  {
    id: '5',
    name: 'Backend_Engineer_AWS.pdf',
    uploadDate: 'Sep 15, 2023',
    targetRole: 'Senior Backend Engineer',
    score: 91,
    status: 'Analyzed',
  },
]

export default function ResumesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Resumes</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your uploaded resumes and review their match scores.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
          <CardDescription>
            A list of all resumes you have uploaded to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resume Name</TableHead>
                  <TableHead>Target Role</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resumes.map((resume) => (
                  <TableRow key={resume.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {resume.name}
                      </div>
                    </TableCell>
                    <TableCell>{resume.targetRole}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {resume.uploadDate}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={resume.status === 'Analyzed' ? 'default' : 'secondary'}
                        className={cn(
                          resume.status === 'Processing' && 'animate-pulse'
                        )}
                      >
                        {resume.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {resume.score > 0 ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                              resume.score >= 80
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : resume.score >= 70
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            )}
                          >
                            {resume.score}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Link href={`/analysis/${resume.id}`} className="flex w-full cursor-pointer items-center">
                              <Eye className="mr-2 h-4 w-4" />
                              View Analysis
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href="/analysis" className="flex w-full cursor-pointer items-center">
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Run JD Match again
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
