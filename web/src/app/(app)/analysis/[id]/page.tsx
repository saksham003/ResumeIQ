import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, AlertCircle, Lightbulb, Key, Target } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Analysis Report — ResumeIQ',
  description: 'Detailed analysis of your resume match.',
}

// MOCK DATA
const mockReport = {
  id: '1',
  resumeName: 'Frontend_Dev_Resume_v2.pdf',
  targetRole: 'Senior React Developer',
  score: 85,
  summary:
    "Your resume is a strong match for the Senior React Developer role! You have excellent coverage of core frontend technologies, but you could improve how you quantify your achievements and add a few missing cloud-related keywords.",
  strengths: [
    "Strong emphasis on React and modern frontend ecosystem (Redux, Hooks, Next.js).",
    "Clear career progression demonstrated in work history.",
    "Good use of action verbs at the start of bullet points.",
  ],
  weaknesses: [
    "Lacking quantifiable metrics (e.g., 'improved performance by X%').",
    "Some bullet points are too long and hard to scan.",
    "Education section takes up too much space for a senior role.",
  ],
  suggestions: [
    "Rewrite the second bullet under your last role to include the impact of your work.",
    "Move the Education section to the bottom of the resume.",
    "Consider adding a 'Projects' or 'Open Source' section to highlight leadership.",
  ],
  missingKeywords: [
    "AWS",
    "CI/CD",
    "Micro-frontends",
    "GraphQL",
    "Jest / Testing",
  ],
}

export default async function AnalysisPage({ params: _params }: { params: { id: string } }) {
  const report = mockReport

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="mb-2 flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Analysis Report</h1>
          <p className="mt-1 text-muted-foreground">
            Report for <span className="font-medium text-foreground">{report.resumeName}</span> targeting{' '}
            <span className="font-medium text-foreground">{report.targetRole}</span>
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-primary/20 shadow-sm">
        <div className="flex flex-col md:flex-row">
          <div className="flex shrink-0 flex-col items-center justify-center bg-primary/5 p-8 md:w-72 md:border-r">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  className="text-muted/20"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className={cn(
                    "transition-all duration-1000 ease-in-out",
                    report.score >= 80 ? "text-green-500" : report.score >= 60 ? "text-yellow-500" : "text-red-500"
                  )}
                  strokeWidth="8"
                  strokeDasharray={40 * 2 * Math.PI}
                  strokeDashoffset={40 * 2 * Math.PI - (report.score / 100) * 40 * 2 * Math.PI}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold tracking-tighter">{report.score}</span>
                <span className="text-[10px] font-medium uppercase text-muted-foreground">Out of 100</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Badge variant={report.score >= 80 ? "default" : "secondary"}>
                {report.score >= 80 ? "Excellent Match" : report.score >= 60 ? "Good Match" : "Needs Work"}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
            <h3 className="mb-2 flex items-center gap-2 text-xl font-semibold">
              <Target className="h-5 w-5 text-primary" />
              Overall Summary
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {report.summary}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Strengths
            </CardTitle>
            <CardDescription>What you did well in your resume.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {report.strengths.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Weaknesses & Gaps
            </CardTitle>
            <CardDescription>Areas that are hurting your match score.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {report.weaknesses.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-sm md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Actionable Suggestions
            </CardTitle>
            <CardDescription>Step-by-step advice to improve your resume.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {report.suggestions.map((item, index) => (
                <div key={index} className="rounded-lg border bg-muted/20 p-4">
                  <div className="mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </div>
                  <p className="text-sm text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Key className="h-5 w-5 text-primary" />
              Missing Keywords
            </CardTitle>
            <CardDescription>Keywords from the job description not found in your resume.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {report.missingKeywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1 font-normal">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
