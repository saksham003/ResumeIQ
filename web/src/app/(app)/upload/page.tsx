'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { UploadCloud, File, AlertCircle, CheckCircle2, FileText, Loader2, X } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

type UploadState = 'IDLE' | 'DRAGGING' | 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'ERROR'

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>('IDLE')
  const [progress, setProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState<
    'Queued' | 'Processing' | 'Completed' | null
  >(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const validateAndSetFile = useCallback((selectedFile: File) => {
    setErrorMsg(null)

    if (selectedFile.type !== 'application/pdf') {
      setErrorMsg('Please upload a valid PDF file.')
      setUploadState('IDLE')
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 5MB limit.')
      setUploadState('IDLE')
      return
    }

    setFile(selectedFile)
    setUploadState('IDLE')
  }, [])

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (uploadState === 'IDLE' || uploadState === 'DRAGGING') {
        setUploadState('DRAGGING')
      }
    },
    [uploadState]
  )

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (uploadState === 'DRAGGING') {
        setUploadState('IDLE')
      }
    },
    [uploadState]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (uploadState !== 'IDLE' && uploadState !== 'DRAGGING') return

      const droppedFile = e.dataTransfer.files[0]
      validateAndSetFile(droppedFile)
    },
    [uploadState, validateAndSetFile]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        validateAndSetFile(e.target.files[0])
      }
    },
    [validateAndSetFile]
  )

  const clearFile = () => {
    setFile(null)
    setUploadState('IDLE')
    setProgress(0)
    setProcessingStatus(null)
    setErrorMsg(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploadState('UPLOADING')
    setProcessingStatus('Queued')
    setProgress(0)
    setErrorMsg(null)

    try {
      const uploadUrlResponse = await fetch('/api/resume/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: file.name }),
      })

      if (!uploadUrlResponse.ok) {
        const error = await uploadUrlResponse.json()
        throw new Error(error.error || 'Failed to get upload URL')
      }

      const { uploadUrl, key } = await uploadUrlResponse.json()

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100)
            setProgress(percentComplete)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            resolve()
          } else {
            reject(new Error('Upload failed'))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'))
        })

        xhr.open('PUT', uploadUrl, true)
        xhr.setRequestHeader('Content-Type', 'application/pdf')
        xhr.send(file)
      })

      const confirmResponse = await fetch('/api/resume/confirm-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
      })

      if (!confirmResponse.ok) {
        const error = await confirmResponse.json()
        throw new Error(error.error || 'Failed to confirm upload')
      }

      const { resumeId } = await confirmResponse.json()

      setUploadState('COMPLETED')
      setProcessingStatus('Completed')

      setTimeout(() => {
        router.push(`/resumes/${resumeId}`)
      }, 1500)
    } catch (error) {
      console.error('Upload error:', error)
      setErrorMsg(error instanceof Error ? error.message : 'Upload failed')
      setUploadState('ERROR')
    }
  }

  const renderDropzone = () => (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        'bg-muted/20 hover:bg-muted/50 relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 transition-all',
        uploadState === 'DRAGGING' && 'border-primary bg-primary/5',
        errorMsg && 'border-destructive bg-destructive/5'
      )}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="application/pdf"
        className="hidden"
      />
      <div className="bg-background ring-border/50 flex h-16 w-16 items-center justify-center rounded-full shadow-sm ring-1">
        <UploadCloud className="text-muted-foreground h-8 w-8" />
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-foreground text-sm font-semibold">Click or drag and drop</h3>
        <p className="text-muted-foreground mt-1 text-xs">PDF resumes only (max 5MB)</p>
      </div>
    </div>
  )

  const renderFilePreview = () => (
    <div className="bg-background flex items-center justify-between rounded-lg border p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <FileText className="text-primary h-5 w-5" />
        </div>
        <div className="overflow-hidden">
          <p className="truncate text-sm leading-none font-medium">{file?.name}</p>
          <p className="text-muted-foreground mt-1.5 text-xs">
            {(file!.size / 1024 / 1024).toFixed(2)} MB • PDF
          </p>
        </div>
      </div>

      {uploadState === 'IDLE' && (
        <Button
          variant="ghost"
          size="icon"
          onClick={clearFile}
          className="text-muted-foreground hover:text-destructive shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )

  const renderProgress = () => (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground font-medium">
          {uploadState === 'UPLOADING' && 'Uploading document...'}
          {uploadState === 'COMPLETED' && 'Resume uploaded successfully!'}
        </span>
        <span className="text-muted-foreground">
          {uploadState === 'UPLOADING'
            ? `${progress}%`
            : uploadState === 'COMPLETED'
              ? 'Redirecting...'
              : processingStatus}
        </span>
      </div>

      <Progress
        value={uploadState === 'UPLOADING' ? progress : 100}
        className={cn('h-2', uploadState === 'COMPLETED' && 'bg-primary')}
      />

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div
          className={cn(
            'flex items-center gap-2 text-xs',
            uploadState === 'UPLOADING' || uploadState === 'COMPLETED'
              ? 'text-foreground'
              : 'text-muted-foreground'
          )}
        >
          {uploadState === 'UPLOADING' ? (
            <Loader2 className="text-primary h-3 w-3 animate-spin" />
          ) : uploadState === 'COMPLETED' ? (
            <CheckCircle2 className="text-primary h-3 w-3" />
          ) : (
            <div className="h-3 w-3 rounded-full border border-current opacity-50" />
          )}
          Upload to S3
        </div>
        <div
          className={cn(
            'flex items-center justify-end gap-2 text-xs',
            uploadState === 'COMPLETED' ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {uploadState === 'COMPLETED' ? (
            <CheckCircle2 className="text-primary h-3 w-3" />
          ) : (
            <div className="h-3 w-3 rounded-full border border-current opacity-50" />
          )}
          Database Record
        </div>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-2xl space-y-6 lg:py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Resume</h1>
        <p className="text-muted-foreground mt-1">
          Upload your resume in PDF format to receive instant AI feedback.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Select Document</CardTitle>
          <CardDescription>
            We will securely process your resume against latest industry standards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMsg && (
            <div className="bg-destructive/15 text-destructive mb-6 flex items-start gap-3 rounded-lg p-4 text-sm">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          {!file ? renderDropzone() : renderFilePreview()}

          {(uploadState === 'UPLOADING' ||
            uploadState === 'PROCESSING' ||
            uploadState === 'COMPLETED' ||
            uploadState === 'ERROR') &&
            renderProgress()}
        </CardContent>
        {file && uploadState === 'IDLE' && (
          <CardFooter className="bg-muted/30 pt-6">
            <Button className="w-full gap-2" onClick={handleUpload}>
              <UploadCloud className="h-4 w-4" />
              Upload Resume
            </Button>
          </CardFooter>
        )}
      </Card>

      {uploadState === 'IDLE' && (
        <p className="text-muted-foreground text-center text-xs">
          By uploading, you agree to our Terms of Service. Your data is not used to train global AI
          models.
        </p>
      )}
    </div>
  )
}
