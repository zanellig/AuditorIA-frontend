import React, { useState, useCallback, useRef, useEffect } from "react"

interface DialProps {
  initialGain?: number
  size?: number
  onChange?: (gain: number) => void
}

const Dial: React.FC<DialProps> = ({
  initialGain = 0.5,
  size = 40, // Reduced default size to fit the audio player
  onChange,
}) => {
  const [gain, setGain] = useState<number>(initialGain)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const dialRef = useRef<HTMLDivElement>(null)

  const angle = gain * 270 - 135 // Convert gain (0 to 1) to angle (-135 to 135 degrees)

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (isDragging && dialRef.current) {
        const rect = dialRef.current.getBoundingClientRect()
        const centerY = rect.top + rect.height / 2
        const movement = (centerY - event.clientY) * 0.0025

        setGain(prevGain => {
          const newGain = Math.max(0, Math.min(1, prevGain + movement))
          onChange && onChange(newGain)
          return newGain
        })
      }
    },
    [isDragging, onChange]
  )

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        event.preventDefault()
        handleMouseMove(event)
      }
    }

    document.addEventListener("mouseup", handleGlobalMouseUp)
    document.addEventListener("mousemove", handleGlobalMouseMove)

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp)
      document.removeEventListener("mousemove", handleGlobalMouseMove)
    }
  }, [isDragging, handleMouseMove])

  return (
    <div
      className='inline-block cursor-pointer select-none'
      ref={dialRef}
      onMouseDown={handleMouseDown}
    >
      <svg
        viewBox='0 0 100 100'
        width={size}
        height={size}
        className='text-muted-foreground hover:text-accent-foreground transition-colors duration-200'
      >
        {/* Outer circle */}
        <circle
          cx='50'
          cy='50'
          r='45'
          fill='none'
          stroke='currentColor'
          strokeWidth='4'
        />

        {/* Gain indicator line */}
        <line
          x1='50'
          y1='50'
          x2='50'
          y2='15'
          stroke='currentColor'
          strokeWidth='4'
          strokeLinecap='round'
          transform={`rotate(${angle} 50 50)`}
        />
      </svg>
    </div>
  )
}

export default Dial
