import { allowedFileTypes } from '@/utils/allowed-file-types'
import JSZip from 'jszip'
import { Download } from 'lucide-react'
import { motion } from 'motion/react'

type DownloadAllBtnProps = {
  files: File[]
}

export function DownloadAllBtn({ files }: DownloadAllBtnProps) {
  function getFileExtension(mime: string): string {
    return allowedFileTypes[mime] || ''
  }

  async function downloadFilesAsZip() {
    if (!files || files.length === 0) {
      console.warn('No files provided')
      return
    }

    const zip = new JSZip()

    // Add files to the zip
    files.forEach((file, i) => {
      const fileName = `snapshift_${i + 1}${getFileExtension(file.type)}`
      zip.file(fileName, file)
    })

    // Generate the zip
    const content = await zip.generateAsync({ type: 'blob' })

    // Create a temporary URL and trigger download
    const zipName = 'snapshift.zip'
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = zipName
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.button
      onClick={downloadFilesAsZip}
      whileTap={{
        y: 1,
      }}
      whileHover={{
        y: -1,
      }}
      className="flex cursor-pointer items-center gap-2 rounded bg-black px-3 py-1.5 text-sm font-semibold text-white"
    >
      <Download size={18} strokeWidth={3} />
      <span>Download All</span>
    </motion.button>
  )
}
