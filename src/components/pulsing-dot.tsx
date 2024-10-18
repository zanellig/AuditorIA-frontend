import { cn } from "@/lib/utils"

interface PulsingDotProps {
  size?: number
  className?: string
}

export default function PulsingDot({ size = 16, className }: PulsingDotProps) {
  const centerSize = size / 4
  const maxSize = size - 2 // Subtracting 2 to keep it within the viewBox

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("text-primary", className)}
      aria-hidden='true'
    >
      <circle cx={size / 2} cy={size / 2} r={centerSize} fill='currentColor' />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={centerSize}
        fill='currentColor'
        opacity='0.75'
      >
        <animate
          attributeName='r'
          from={centerSize}
          to={maxSize / 2}
          dur='1.5s'
          begin='0s'
          repeatCount='indefinite'
        />
        <animate
          attributeName='opacity'
          from='0.75'
          to='0'
          dur='1.5s'
          begin='0s'
          repeatCount='indefinite'
        />
      </circle>
    </svg>
  )
}
