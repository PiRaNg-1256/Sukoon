import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

const variants = {
  initial: { opacity: 0, x: 18 },
  in:      { opacity: 1, x: 0  },
  out:     { opacity: 0, x: -18 },
}

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={variants}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="pb-20 min-h-screen"
    >
      {children}
    </motion.div>
  )
}
