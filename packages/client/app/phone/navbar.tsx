import Image from 'next/image'

export function Navbar() {
  return (
    <nav className="flex h-20 items-center px-[10%]">
      <h1 className="flex items-center gap-0.5 text-lg">
        <span>Snapshift</span>
        <Image src={'/logo.png'} height={16} width={16} alt="Logo" />
      </h1>
    </nav>
  )
}
