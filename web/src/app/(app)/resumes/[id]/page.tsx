import type { Metadata } from 'next'

interface ResumeDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ResumeDetailPageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Resume ${id} — ResumeIQ`,
  }
}

export default async function ResumeDetailPage({ params }: ResumeDetailPageProps) {
  const { id } = await params

  // const resume = null

  // if (!resume) {
  //   return null;
  // }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resume Detail</h1>
        <p className="text-muted-foreground text-sm">ID: {id}</p>
      </div>

      <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
        Resume content — coming soon
      </div>
    </div>
  )
}
