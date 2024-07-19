import React from "react"
export default function TableContainer({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='container flex flex-col w-full h-full px-2 pt-4 max-w-[1440px]'>
      {children}
    </div>
  )
}
