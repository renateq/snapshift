import Image from 'next/image'
import { useEffect, useState } from 'react'
import { CopyBtn, DownloadBtn } from './file-buttons'

type FilePreviewProps = {
  file: File
}

const MAX_RATIO = 5 / 4

export function FilePreview({ file }: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [dimensions, setDimensions] = useState<{
    width: number
    height: number
  }>()

  useEffect(() => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    let isMounted = true

    if (file.type.startsWith('image/')) {
      setPreviewUrl(url)

      img.onload = () => {
        if (isMounted) {
          setDimensions({ width: img.width, height: img.height })
        }
      }

      img.src = url
    }

    return () => {
      isMounted = false
      img.onload = null // clean up handler
      URL.revokeObjectURL(url)
    }
  }, [file])

  if (previewUrl && dimensions) {
    const aspectRatio = dimensions.width / dimensions.height
    const isTooWide = aspectRatio > MAX_RATIO

    return (
      <div className="relative w-fit overflow-hidden rounded-xl border border-gray-200 bg-white p-2">
        <div
          className="h-80 overflow-hidden rounded-lg"
          style={{ aspectRatio: isTooWide ? MAX_RATIO : aspectRatio }}
        >
          <Image
            src={previewUrl}
            alt={file.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute left-0 top-0 h-full w-full bg-black/5 opacity-0 hover:opacity-100">
          <div className="absolute bottom-5 right-5 flex items-center gap-2">
            <DownloadBtn file={file} />
            <CopyBtn file={file} />
          </div>
        </div>
      </div>
    )
  }

  return null
}
