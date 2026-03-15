import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analyze Resume — ResumeIQ',
  description: 'Upload your resume and paste a job description for AI-powered feedback.',
}

export default function AnalyzePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Analyze Your Resume</h1>
      <p className="mt-2 text-muted-foreground">
        Upload a PDF resume and optionally paste a job description.
      </p>

      <div className="mt-8 rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
        Resume upload form — coming soon
      </div>
    </main>
  )
}
