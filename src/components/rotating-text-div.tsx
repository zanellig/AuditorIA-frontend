"use client"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

const RotatingTextDiv = ({
  className,
  rotatingTexts = [""],
}: {
  className?: string
  rotatingTexts?: string[]
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex(prevIndex => (prevIndex + 1) % rotatingTexts.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [rotatingTexts.length])

  return (
    <div
      className={cn(
        "flex items-center justify-center w-full h-full",
        className
      )}
    >
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentTextIndex}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {rotatingTexts[currentTextIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default RotatingTextDiv
