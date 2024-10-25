import React from "react"

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  strokeWidth?: number | string
}

export const SurpriseIcon: React.FC<IconProps> = ({
  size = 24,
  strokeWidth = 2,
  ...props
}) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={strokeWidth}
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    <circle cx='12' cy='12' r='10' />
    <circle cx='12' cy='15' r='2' />
    <line x1='9' y1='9' x2='9.01' y2='9' />
    <line x1='15' y1='9' x2='15.01' y2='9' />
  </svg>
)
