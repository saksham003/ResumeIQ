'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { UploadCloud, File, AlertCircle, CheckCircle2, FileText, Loader2, X } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
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
  const [processingStatus, setProcessingStatus] = useState<'Queued' | 'Processing' | 'Completed' | null>(null)
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

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (uploadState === 'IDLE' || uploadState === 'DRAGGING') {
      setUploadState('DRAGGING')
    }
  }, [uploadState])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (uploadState === 'DRAGGING') {
      setUploadState('IDLE')
    }
  }, [uploadState])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (uploadState !== 'IDLE' && uploadState !== 'DRAGGING') return

    const droppedFile = e.dataTransfer.files[0]
    validateAndSetFile(droppedFile)
  }, [uploadState, validateAndSetFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0])
    }
  }, [validateAndSetFile])

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

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 150))
      setProgress(i)
    }

    setUploadState('PROCESSING')
    setProcessingStatus('Processing')
    
    await new Promise(r => setTimeout(r, 2000))
    
    setProcessingStatus('Completed')
    setUploadState('COMPLETED')
    
    setTimeout(() => {
      router.push('/analysis/1')
    }, 1500)
  }

  const renderDropzone = () => (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/20 px-6 py-12 transition-all hover:bg-muted/50",
        uploadState === 'DRAGGING' && "border-primary bg-primary/5",
        errorMsg && "border-destructive bg-destructive/5"
      )}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="application/pdf"
        className="hidden"
      />
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border/50">
        <UploadCloud className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-sm font-semibold text-foreground">Click or drag and drop</h3>
        <p className="mt-1 text-xs text-muted-foreground">PDF resumes only (max 5MB)</p>
      </div>
    </div>
  )

  const renderFilePreview = () => (
    <div className="flex items-center justify-between rounded-lg border bg-background p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div className="overflow-hidden">
          <p className="truncate text-sm font-medium leading-none">{file?.name}</p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {(file!.size / 1024 / 1024).toFixed(2)} MB • PDF
          </p>
        </div>
      </div>
      
      {uploadState === 'IDLE' && (
        <Button variant="ghost" size="icon" onClick={clearFile} className="shrink-0 text-muted-foreground hover:text-destructive">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )

  const renderProgress = () => (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">
          {processingStatus === 'Queued' && 'Uploading document...'}
          {processingStatus === 'Processing' && 'Analyzing with AI...'}
          {processingStatus === 'Completed' && 'Analysis complete!'}
        </span>
        <span className="text-muted-foreground">{uploadState === 'UPLOADING' ? `${progress}%` : processingStatus}</span>
      </div>
      
      <Progress 
        value={uploadState === 'UPLOADING' ? progress : 100} 
        className={cn(
          "h-2",
          uploadState === 'PROCESSING' && "animate-pulse" 
        )} 
      />

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className={cn("flex items-center gap-2 text-xs", processingStatus !== null ? "text-foreground" : "text-muted-foreground")}>
          {processingStatus !== null ? <CheckCircle2 className="h-3 w-3 text-primary" /> : <div className="h-3 w-3 rounded-full border border-current opacity-50" />}
          Queued
        </div>
        <div className={cn("flex items-center gap-2 text-xs justify-center", processingStatus === 'Processing' || processingStatus === 'Completed' ? "text-foreground" : "text-muted-foreground")}>
          {processingStatus === 'Processing' ? <Loader2 className="h-3 w-3 animate-spin text-primary" /> : processingStatus === 'Completed' ? <CheckCircle2 className="h-3 w-3 text-primary" /> : <div className="h-3 w-3 rounded-full border border-current opacity-50" />}
          Processing
        </div>
        <div className={cn("flex items-center gap-2 text-xs justify-end", processingStatus === 'Completed' ? "text-foreground" : "text-muted-foreground")}>
          {processingStatus === 'Completed' ? <CheckCircle2 className="h-3 w-3 text-primary" /> : <div className="h-3 w-3 rounded-full border border-current opacity-50" />}
          Completed
        </div>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-2xl space-y-6 lg:py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Resume</h1>
        <p className="mt-1 text-muted-foreground">Upload your resume in PDF format to receive instant AI feedback.</p>
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
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-destructive/15 p-4 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          {!file ? renderDropzone() : renderFilePreview()}

          {(uploadState === 'UPLOADING' || uploadState === 'PROCESSING' || uploadState === 'COMPLETED') && renderProgress()}
        </CardContent>
        {file && uploadState === 'IDLE' && (
          <CardFooter className="bg-muted/30 pt-6">
            <Button className="w-full gap-2" onClick={handleUpload}>
              <UploadCloud className="h-4 w-4" />
              Start Analysis
            </Button>
          </CardFooter>
        )}
      </Card>
      
      {uploadState === 'IDLE' && (
        <p className="text-center text-xs text-muted-foreground">
          By uploading, you agree to our Terms of Service. Your data is not used to train global AI models.
        </p>
      )}
    </div>
  )
}
