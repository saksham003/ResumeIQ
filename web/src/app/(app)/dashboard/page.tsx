import type { Metadata } from 'next'
import Link from 'next/link'
import { PlusCircle, FileText, CheckCircle, Clock } from 'lucide-react'
import { auth } from '@/lib/auth'

import { buttonVariants } from '@/lib/button-variants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Dashboard — ResumeIQ',
  description: 'Overview of your resumes and AI analysis results.',
}

// MOCK DATA
const stats = [
  {
    title: 'Total Analyzed',
    value: '12',
    description: '+2 from last week',
    icon: FileText,
  },
  {
    title: 'Average Score',
    value: '78%',
    description: '+4% from last month',
    icon: CheckCircle,
  },
  {
    title: 'Last Analysis',
    value: '2h ago',
    description: 'Software Engineer CV',
    icon: Clock,
  },
]

const recentAnalyses = [
  {
    id: '1',
    resumeName: 'Frontend_Dev_Resume_v2.pdf',
    jobRole: 'Senior React Developer',
    score: 85,
    date: 'Today, 2:30 PM',
    status: 'Excellent',
  },
  {
    id: '2',
    resumeName: 'Software_Engineer_Google.pdf',
    jobRole: 'Software Engineer II',
    score: 62,
    date: 'Yesterday',
    status: 'Needs Work',
  },
  {
    id: '3',
    resumeName: 'Fullstack_Resume_2023.pdf',
    jobRole: 'Full Stack Developer',
    score: 74,
    date: 'Oct 12, 2023',
    status: 'Good',
  },
  {
    id: '4',
    resumeName: 'Product_Manager_CV.pdf',
    jobRole: 'Product Manager',
    score: 91,
    date: 'Sep 28, 2023',
    status: 'Excellent',
  },
]

export default async function DashboardPage() {
  const session = await auth()
  const userName = session?.user?.name || session?.user?.email || 'User'

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userName}! 👋</h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s an overview of your recent resume analyses.
          </p>
        </div>
        <Link href="/upload" className={cn(buttonVariants({ size: 'default' }), 'shrink-0 gap-2')}>
          <PlusCircle className="h-4 w-4" />
          Upload Resume
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-muted-foreground mt-1 text-xs">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Analyses</CardTitle>
          <CardDescription>Your latest resume uploads and their match scores.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resume</TableHead>
                <TableHead>Target Role</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAnalyses.map((analysis) => (
                <TableRow key={analysis.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center justify-start gap-2">
                      <FileText className="text-muted-foreground h-4 w-4" />
                      {analysis.resumeName}
                    </div>
                  </TableCell>
                  <TableCell>{analysis.jobRole}</TableCell>
                  <TableCell className="text-muted-foreground">{analysis.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="bg-secondary h-2 w-12 overflow-hidden rounded-full">
                        <div
                          className={cn(
                            'h-full',
                            analysis.score >= 80
                              ? 'bg-green-500'
                              : analysis.score >= 70
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          )}
                          style={{ width: `${analysis.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{analysis.score}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/analysis/${analysis.id}`}
                      className="text-primary text-sm font-medium hover:underline hover:underline-offset-4"
                    >
                      View Report
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
