import { useClientContext } from '@/context/client-context'
import { Gallery } from './gallery'

export function DisplayFiles() {
  const { sharedFiles } = useClientContext()

  return (
    <div className="mb-20 mt-5 xl:px-[10%]">
      <Gallery files={sharedFiles} />
    </div>
  )
}
