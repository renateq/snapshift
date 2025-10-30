import { useClientContext } from '@/context/client-context'
import { Gallery } from './gallery'
import { GalleryPlaceholder } from './gallery-placeholder'

export function DisplayFiles() {
  const { sharedFiles } = useClientContext()

  return (
    <div className="mb-20 mt-5 xl:px-[10%]">
      {sharedFiles.length > 0 ? (
        <Gallery files={sharedFiles} />
      ) : (
        <GalleryPlaceholder />
      )}
    </div>
  )
}
