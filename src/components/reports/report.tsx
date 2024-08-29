"use client"

import ReportHateMonth from "./report-hate-month"
import { ReportEmotionCall } from "./report-emotion-call"
import { Component } from "./report-call-ponderation"
import { Components } from "./report-total-tasks"
import Example from "./report-word-cloud"

export default function Report() {
  return (
    <>
      <div className='flex flex-col gap-2'>
        <ReportRowContainer>
          <ReportHateMonth />
          <ReportEmotionCall />
        </ReportRowContainer>
        <ReportRowContainer>
          <Component className='w-full' />
        </ReportRowContainer>
        <ReportRowContainer>
          <Components />
          <Example width={600} height={400} />
        </ReportRowContainer>
      </div>
    </>
  )
}

function ReportRowContainer({ children }: { children: React.ReactNode }) {
  return <div className='flex flex-row gap-2 w-full h-full'>{children}</div>
}
