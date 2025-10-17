import { Copy, Download } from 'lucide-react'
import { useState } from 'react'

type BtnProps = {
  file: File
}

export function CopyBtn({ file }: BtnProps) {
  async function svgToPngBlob(file: File): Promise<Blob> {
    const text = await file.text()
    const svgUrl =
      'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(text)

    const img = document.createElement('img')
    img.src = svgUrl
    await img.decode()

    const canvas = document.createElement('canvas')
    canvas.width = img.width || 512
    canvas.height = img.height || 512
    const ctx = canvas.getContext('2d')
    ctx?.drawImage(img, 0, 0)

    return new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b as Blob), 'image/png'),
    )
  }

  async function handleCopy() {
    try {
      let blob: Blob

      if (file.type === 'image/svg+xml') {
        blob = await svgToPngBlob(file)
      } else {
        const bitmap = await createImageBitmap(file)
        const canvas = document.createElement('canvas')
        canvas.width = bitmap.width
        canvas.height = bitmap.height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(bitmap, 0, 0)

        blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b as Blob), 'image/png'),
        )
      }

      const item = new ClipboardItem({ 'image/png': blob })
      await navigator.clipboard.write([item])
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="cursor-pointer rounded-lg border border-gray-400 bg-white p-1"
    >
      <Copy size={22} />
    </button>
  )
}

export function DownloadBtn({ file }: BtnProps) {
  const [id, setId] = useState<number | null>(null)

  function handleDownload() {
    let currentId = id

    if (!currentId) {
      const newId = Number(sessionStorage.getItem('noOfDownloads')) || 1
      sessionStorage.setItem('noOfDownloads', (newId + 1).toString())
      setId(newId)
      currentId = newId
    }

    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = `sharesnap_${currentId}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleDownload}
      className="cursor-pointer rounded-lg border border-gray-400 bg-white p-1"
    >
      <Download size={22} />
    </button>
  )
}
