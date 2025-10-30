import { Image as ImageIcon } from 'lucide-react'

export function GalleryPlaceholder() {
  return (
    <div className="flex min-h-[calc(100dvh-20rem)] flex-col items-center justify-evenly">
      <ImageIcon size={250} className="opacity-20" />
      <p className="text-center text-lg opacity-90">
        Click on the <Btn /> button and select photos you want to transfer.
      </p>
    </div>
  )
}

function Btn() {
  return (
    <span className="inline-block px-2">
      <span className="flex items-center gap-1 rounded-lg bg-black px-3 py-1.5 text-base text-white">
        <ImageIcon size={20} />
        <span>Choose Photos</span>
      </span>
    </span>
  )
}
