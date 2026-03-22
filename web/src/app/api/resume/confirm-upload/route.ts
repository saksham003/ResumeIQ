import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { addJob, JobType } from '@/lib/queue'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { key } = body

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }

    const bucket = process.env.AWS_S3_BUCKET!
    const fileUrl = `https://${bucket}.s3.amazonaws.com/${key}`

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        fileUrl,
        status: 'UPLOADED',
      },
    })

    await addJob(JobType.PROCESS_RESUME, {
      resumeId: resume.id,
      userId: session.user.id,
      fileUrl,
    })

    return NextResponse.json({
      success: true,
      resumeId: resume.id,
    })
  } catch (error) {
    console.error('Error confirming upload:', error)
    return NextResponse.json(
      { error: 'Failed to confirm upload' },
      { status: 500 }
    )
  }
}

