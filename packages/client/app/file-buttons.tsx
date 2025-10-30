import { CheckCheck, Copy, Download } from 'lucide-react'
import { ReactNode, useCallback, useState } from 'react'
import { motion } from 'motion/react'
import { debounce } from '@/utils/debounce'
import { clsx } from 'clsx'

type BtnProps = {
  file: File
}

const iconSize = 19

export function CopyBtn({ file }: BtnProps) {
  const [isCopied, setIsCopied] = useState(false)

  const resetIcon = useCallback(
    debounce(() => setIsCopied(false), 1500),
    [],
  )

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
    setIsCopied(true)
    resetIcon()
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
    <BtnContainer handleClick={handleCopy}>
      {isCopied ? <CheckCheck size={iconSize} /> : <Copy size={iconSize} />}
    </BtnContainer>
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
    a.download = `snapshift_${currentId}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <BtnContainer handleClick={handleDownload} className="download-btn">
      <Download size={iconSize} />
    </BtnContainer>
  )
}

type BtnContainerProps = {
  handleClick: () => void
  children: ReactNode
  className?: string
}

function BtnContainer({ handleClick, children, className }: BtnContainerProps) {
  return (
    <motion.button
      whileTap={{
        y: 1,
      }}
      whileHover={{
        y: -1,
      }}
      onClick={handleClick}
      className={clsx(
        'copy-btn cursor-pointer rounded bg-white p-1',
        className,
      )}
    >
      {children}
    </motion.button>
  )
}
