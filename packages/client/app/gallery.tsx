import { DownloadAllBtn } from './download-all-btn'
import { FilePreview } from './file-preview'

type GalleryProps = {
  files: File[]
}

export function Gallery({ files }: GalleryProps) {
  return (
    <div className="py-4">
      <div className="flex justify-end pb-4">
        <DownloadAllBtn files={files} />
      </div>
      <div
        id="gallery"
        className="flex w-full flex-wrap items-start justify-center gap-x-0 gap-y-12 py-8"
      >
        {files.map((file) => (
          <FilePreview
            file={file}
            key={`${file.name}-${file.lastModified}-${file.size}`}
          />
        ))}
      </div>
    </div>
  )
}
