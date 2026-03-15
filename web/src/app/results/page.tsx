import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Results — ResumeIQ',
  description: 'Your AI resume review results.',
}

export default function ResultsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Your Resume Review</h1>
      <p className="mt-2 text-muted-foreground">
        Here&apos;s what our AI found about your resume.
      </p>

      <div className="mt-8 rounded-lg border p-8 text-center text-sm text-muted-foreground">
        Analysis results — coming soon
      </div>
    </main>
  )
}
