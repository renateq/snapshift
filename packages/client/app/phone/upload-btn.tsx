import { useClientContext } from '@/context/client-context'
import { allowedFileTypes } from '@/utils/allowed-file-types'
import { Images, Loader2 } from 'lucide-react'
import { ChangeEvent, useRef } from 'react'

const MAX_FILE_SIZE_MB = 30
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export function UploadBtn() {
  const { sendFiles, isSending } = useClientContext()
  const imageInputRef = useRef<HTMLInputElement | null>(null)

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    const fileArray = Array.from(files)

    const validFiles = fileArray.filter((file) => {
      if (!Object.keys(allowedFileTypes).includes(file.type)) {
        return false
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return false
      }

      return true
    })

    if (validFiles.length > 0) {
      sendFiles(validFiles)
    }

    e.target.value = ''
  }

  return (
    <button
      id="upload-btn"
      disabled={isSending}
      onClick={() => {
        imageInputRef.current?.click()
      }}
      className="h-13 flex w-full items-center justify-center gap-4 rounded-lg bg-black text-xl font-medium text-white"
    >
      {isSending ? (
        <Loader2 size={30} className="animate-spin" />
      ) : (
        <>
          <Images size={30} />
          <span>Choose photos</span>

          <input
            type="file"
            ref={imageInputRef}
            accept={Object.values(allowedFileTypes).join(',')}
            multiple
            className="hidden"
            onChange={handleInput}
          />
        </>
      )}
    </button>
  )
}
