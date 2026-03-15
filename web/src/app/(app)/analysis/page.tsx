'use client'

import { useState } from 'react'
import { CheckCircle2, AlertCircle, Lightbulb, Target, Loader2 } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// MOCK DATA for Results
const mockResults = {
  score: 78,
  matchingSkills: [
    'React',
    'TypeScript',
    'Next.js',
    'Tailwind CSS',
    'REST APIs',
    'Git',
  ],
  missingSkills: [
    'GraphQL',
    'AWS / Cloud',
    'Docker',
    'CI/CD Pipelines',
  ],
  suggestions: [
    'Add a bullet point showing experience with cloud deployment or AWS.',
    'Mention your testing strategy (Jest/Cypress) as it was heavily emphasized in the JD.',
    'Highlight your leadership experience; the JD asks for mentoring juniors.',
  ]
}

export default function JobMatchAnalysisPage() {
  const [jobDescription, setJobDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return

    setIsAnalyzing(true)
    setShowResults(false)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsAnalyzing(false)
    setShowResults(true)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Match Analysis</h1>
        <p className="mt-1 text-muted-foreground">
          Paste a job description below to see how well your default resume matches it.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
          <CardDescription>
            Copy and paste the full job description text from LinkedIn, Indeed, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g. We are looking for a Senior Frontend Engineer with 5+ years of React experience..."
            className="min-h-[200px] resize-y font-mono text-sm"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAnalyze}
              disabled={!jobDescription.trim() || isAnalyzing}
              className="gap-2"
            >
              {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin" />}
              {isAnalyzing ? 'Analyzing Match...' : 'Analyze Resume vs Job'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {showResults && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
          
          <h2 className="text-2xl font-semibold tracking-tight">Analysis Results</h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Main Score Card */}
            <Card className="md:col-span-1 shadow-sm border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" /> Match Score
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
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
                        mockResults.score >= 80 ? "text-green-500" : mockResults.score >= 60 ? "text-yellow-500" : "text-red-500"
                      )}
                      strokeWidth="8"
                      strokeDasharray={40 * 2 * Math.PI}
                      strokeDashoffset={40 * 2 * Math.PI - (mockResults.score / 100) * 40 * 2 * Math.PI}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold tracking-tighter">{mockResults.score}</span>
                    <span className="text-[10px] font-medium uppercase text-muted-foreground">Match</span>
                  </div>
                </div>
                <Badge variant={mockResults.score >= 80 ? "default" : "secondary"}>
                  {mockResults.score >= 80 ? "Excellent Fit" : mockResults.score >= 60 ? "Good Fit" : "Low Fit"}
                </Badge>
              </CardContent>
            </Card>

            <div className="md:col-span-2 grid gap-6 sm:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Matching Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mockResults.matchingSkills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Missing Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mockResults.missingSkills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="sm:col-span-2 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Suggestions to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {mockResults.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            
          </div>
        </div>
      )}
    </div>
  )
}
