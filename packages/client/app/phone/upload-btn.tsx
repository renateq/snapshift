import { useClientContext } from '@/context/client-context'
import { Check, Images, Loader } from 'lucide-react'
import { ChangeEvent, useRef, useState } from 'react'

const allowedTypesExtensions = [
  '.png',
  '.jpeg',
  '.jpg',
  '.gif',
  '.heic',
  '.webp',
  '.heif',
  '.svg',
]
const allowedTypes = [
  'image/png',
  'image/svg+xml',
  'image/jpeg', // covers .jpeg and .jpg
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
]

export function UploadBtn() {
  const { sendFiles } = useClientContext()
  const imageInputRef = useRef<HTMLInputElement | null>(null)

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    const fileArray = Array.from(files)

    const validFiles = fileArray.filter((file) =>
      allowedTypes.includes(file.type),
    )

    if (validFiles.length > 0) {
      sendFiles(validFiles)
    }

    e.target.value = ''
  }

  return (
    <button
      id="upload-btn"
      onClick={() => {
        imageInputRef.current?.click()
      }}
      className="h-13 flex w-full items-center justify-center gap-4 rounded-lg bg-black text-xl font-medium text-white"
    >
      <Images size={30} />
      <span>Choose photos</span>

      <input
        type="file"
        ref={imageInputRef}
        accept={allowedTypesExtensions.join(',')}
        multiple
        className="hidden"
        onChange={handleInput}
      />
    </button>
  )
}
