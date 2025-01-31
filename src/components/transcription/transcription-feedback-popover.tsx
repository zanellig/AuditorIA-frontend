"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const SHOW_PROBABILITY = 0.3 // 30% chance to show
const MIN_DELAY = 2000 // Minimum delay in milliseconds
const MAX_DELAY = 5000 // Maximum delay in milliseconds

interface FloatingFeedbackPopoverProps {
  feedbackHandler: (feedback: "up" | "down") => void
  text?: string
}

export const FloatingFeedbackPopover: React.FC<
  FloatingFeedbackPopoverProps
> = ({ feedbackHandler, text }) => {
  const [isVisible, setIsVisible] = React.useState<boolean>(false)
  const effectRan = React.useRef(false)

  React.useEffect(() => {
    if (effectRan.current) return // Guard against strict mode double execution
    effectRan.current = true

    const shouldShow = Math.random() < SHOW_PROBABILITY
    if (shouldShow) {
      // Random delay between MIN_DELAY and MAX_DELAY
      const delay = Math.floor(
        Math.random() * (MAX_DELAY - MIN_DELAY + 1) + MIN_DELAY
      )
      const timer = setTimeout(() => setIsVisible(true), delay)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleFeedback = (feedback: "up" | "down") => {
    setIsVisible(false)
    feedbackHandler(feedback)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className='fixed left-1/2 bottom-4 -translate-x-1/2 bg-background shadow-lg rounded-lg p-2 flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-2 text-xs z-50 pointer-events-auto'
        >
          <p className='text-center lg:text-left select-none lg:whitespace-nowrap'>
            {text || "¿Qué te pareció esta transcripción?"}
          </p>
          <div className='flex space-x-2'>
            <Button
              size='icon'
              variant='ghost'
              onClick={() => handleFeedback("up")}
              aria-label='Thumbs up'
            >
              <ThumbsUp size={16} />
            </Button>
            <Button
              size='icon'
              variant='ghost'
              onClick={() => handleFeedback("down")}
              aria-label='Thumbs down'
            >
              <ThumbsDown size={16} />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
