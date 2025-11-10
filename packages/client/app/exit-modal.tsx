'use client'

import { motion } from 'motion/react'

type ExitModalProps = {
  confirm: () => void
  close: () => void
}

export default function ExitModal({ confirm, close }: ExitModalProps) {
  return (
    <div className="fixed left-0 top-0 z-40 flex h-full w-full items-center justify-center bg-black/20">
      <motion.div role="dialog" aria-modal="true"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        id="exit-modal"
        className="z-50 max-w-md rounded-lg bg-white px-8 py-6 text-center"
      >
        <p className="mb-2 text-lg font-semibold">
          Are you sure you want to leave?
        </p>
        <p>You will lose your current images.</p>
        <div className="mt-8 flex items-center justify-end gap-4">
          <button
            id="exit-btn-no"
            onClick={close}
            className="cursor-pointer rounded border border-black px-4 py-0.5"
          >
            No
          </button>
          <button
            id="exit-btn-yes"
            onClick={confirm}
            className="cursor-pointer rounded border border-black bg-black px-4 py-0.5 text-white"
          >
            Yes
          </button>
        </div>
      </motion.div>
    </div>
  )
}
