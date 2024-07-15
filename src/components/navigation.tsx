"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import { ModeToggle } from "./ModeToggle"

export default function NavigationButtons() {
  /**
   * TODO: dynamic render the back to dashboard button when NOT in dashboard
   *https://tasks.office.com/linksolution.com.ar/Home/Task/NJ_2S_7cj0qHo9Bzv0OyEWUAMyX3?Type=TaskLink&Channel=Link&CreatedTime=638566708070090000
   */

  return (
    <>
      <div className='fixed top-0 left-0 p-4'>
        <Link href='/dashboard'>
          <Button variant='outline' className='p-2'>
            {"<-"} Volver al dashboard
          </Button>
        </Link>
      </div>
      <div className='fixed top-0 right-0 p-4'>
        <ModeToggle />
      </div>
    </>
  )
}
