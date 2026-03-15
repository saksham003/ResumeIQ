export interface Resume {
  id: string
  userId: string
  fileName: string
  fileUrl: string
  extractedText: string
  uploadedAt: string
}

export interface Analysis {
  id: string
  resumeId: string
  jobDescription?: string
  score: number
  summary: string
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  createdAt: string
}

export interface ParseResumeResponse {
  text: string
}

export interface AnalyzeRequest {
  resumeText: string
  jobDescription?: string
}

export interface AnalyzeResponse {
  score: number
  summary: string
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'
