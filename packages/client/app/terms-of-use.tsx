'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

export function TermsOfUse() {
  const [isOpen, setIsOpen] = useState(false)
  const [terms, setTerms] = useState('')

  useEffect(() => {
    fetch('/TERMS.md')
      .then((res) => res.text())
      .then((text) => setTerms(text))
  }, [])

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="cursor-pointer">
        Terms of Use
      </button>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            exit={{
              opacity: 0,
            }}
            hidden={!isOpen}
            className="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black/20"
          >
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="w-11/12 max-w-xl rounded-lg bg-white px-8 py-6"
            >
              <p className="text-center opacity-80">Terms of Use</p>
              <div className="prose prose-h1:hidden mt-4 h-[60vh] w-full overflow-auto px-2">
                <ReactMarkdown>{terms}</ReactMarkdown>
              </div>
              <button
                className="ml-auto mt-10 block rounded bg-black px-6 py-1 text-white"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
