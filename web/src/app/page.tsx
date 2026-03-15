import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/lib/button-variants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BrainCircuit,
  Sparkles,
  Target,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Github,
  Twitter,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const FEATURES = [
  {
    icon: BrainCircuit,
    title: 'AI Resume Analysis',
    description:
      'Our AI instantly scans your resume and identifies gaps, formatting issues, and missed opportunities — giving you a detailed score with actionable feedback.',
    bullets: ['ATS compatibility check', 'Section-by-section breakdown', 'Instant scoring'],
  },
  {
    icon: Target,
    title: 'Job Description Matching',
    description:
      'Paste any job description and watch our AI calculate your match score, highlight missing keywords, and show exactly what recruiters are looking for.',
    bullets: ['Keyword gap analysis', 'Relevance scoring', 'Role-specific tips'],
  },
  {
    icon: Lightbulb,
    title: 'Improvement Suggestions',
    description:
      'Get concrete, rewrite-ready suggestions for every section of your resume — from the summary to your bullet points — so you can apply with confidence.',
    bullets: ['Rewrite suggestions', 'Power-word recommendations', 'Before / after examples'],
  },
]

const SOCIAL_PROOF = ['No account required to try', 'Results in under 30 seconds', 'Free to start']

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <span className="tracking-tight">ResumeIQ</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="#features"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Features
            </Link>
            <Link
              id="nav-upload-btn"
              href="/upload"
              className={cn(buttonVariants({ size: 'sm' }))}
            >
              Upload Resume
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section
          aria-labelledby="hero-headline"
          className="relative overflow-hidden px-4 py-24 text-center sm:px-6 sm:py-32 lg:py-40"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 flex items-center justify-center"
          >
            <div className="h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
          </div>

          <div className="mx-auto max-w-3xl">
            <Badge
              id="hero-badge"
              variant="secondary"
              className="mb-6 gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            >
              <Sparkles className="h-3 w-3" />
              AI-Powered Resume Feedback
            </Badge>

            <h1
              id="hero-headline"
              className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Land more interviews with{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                smarter resume feedback
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Upload your resume and get instant, AI-powered analysis — including keyword matching,
              ATS scoring, and personalized improvement tips tailored to any job.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                id="hero-cta-primary"
                href="/upload"
                className={cn(buttonVariants({ size: 'lg' }), 'gap-2 px-8 text-base')}
              >
                Upload Resume <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                id="hero-cta-secondary"
                href="#features"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'gap-2 px-8 text-base'
                )}
              >
                See how it works
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {SOCIAL_PROOF.map((item) => (
                <li key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="features"
          aria-labelledby="features-heading"
          className="border-t bg-muted/30 px-4 py-24 sm:px-6"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <Badge
                variant="outline"
                className="mb-4 rounded-full px-3 py-1 text-xs font-medium"
              >
                Features
              </Badge>
              <h2
                id="features-heading"
                className="text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Everything you need to ace your job search
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Stop guessing what recruiters want. Let our AI tell you exactly what to fix and
                why.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, description, bullets }) => (
                <Card
                  key={title}
                  className="group relative overflow-hidden border-border/50 bg-background transition-shadow hover:shadow-lg"
                >
                  <CardHeader className="pb-3">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 transition-colors group-hover:bg-primary/20">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                    <ul className="space-y-1.5">
                      {bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section aria-label="Call to action" className="px-4 py-24 text-center sm:px-6">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to level up your resume?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join thousands of job seekers who use ResumeIQ to get more interviews.
            </p>
            <Link
              id="bottom-cta-btn"
              href="/upload"
              className={cn(buttonVariants({ size: 'lg' }), 'mt-8 gap-2 px-10 text-base')}
            >
              Analyze My Resume <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <BrainCircuit className="h-4 w-4 text-primary" />
              <span className="text-sm tracking-tight">ResumeIQ</span>
            </Link>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link href="#features" className="hover:text-foreground">Features</Link>
              <Link href="/upload" className="hover:text-foreground">Get Started</Link>
              <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            </nav>

            <div className="flex items-center gap-3 text-muted-foreground">
              <Link
                href="https://github.com"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                <Github className="h-4 w-4" />
              </Link>
              <Link
                href="https://twitter.com"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                <Twitter className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ResumeIQ. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
