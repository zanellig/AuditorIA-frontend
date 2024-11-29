"use client"

import React from "react"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { AnimatePresence, motion } from "framer-motion"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  function switchTheme() {
    if (theme === "dark") setTheme("light")
    if (theme === "light") setTheme("dark")
  }
  return (
    <Button
      variant='outline'
      size='icon'
      className='bg-popover shadow-md relative overflow-hidden'
      onClick={switchTheme}
    >
      <AnimatePresence mode='wait'>
        {theme === "dark" ? (
          <motion.div
            key='moon'
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 180, opacity: 0 }}
            transition={{ duration: 0.2, type: "spring" }}
          >
            <MoonIcon className='h-[1.2rem] w-[1.2rem]' />
          </motion.div>
        ) : (
          <motion.div
            key='sun'
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2, type: "spring" }}
          >
            <SunIcon className='h-[1.2rem] w-[1.2rem]' />
          </motion.div>
        )}
      </AnimatePresence>
      <span className='sr-only'>Cambiar tema</span>
    </Button>
  )
}
