'use client'

import { useState, useCallback } from 'react'

function useXhrUpload(): UseXhrUploadReturn {
  const [progress, setProgress] = useState(0)

  const uploadFile = useCallback((uploadUrl: string, file: File): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100))
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
  }, [])

  return { progress, uploadFile }
}

type UseXhrUploadReturn = {
  progress: number
  uploadFile: (uploadUrl: string, file: File) => Promise<void>
};

export { useXhrUpload };