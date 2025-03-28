"use client"
import * as React from "react"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AudioProvider } from "./AudioProvider"
import { ScrollProvider } from "./ScrollProvider"
import { TranscriptionProvider } from "./TranscriptionProvider"

import { UserContextProvider } from "./UserProvider"
import { RecordingProvider } from "./RecordingProvider"
import { SegmentsAnalysisProvider } from "./SegmentsAnalysisProvider"
import { IdentifiedPageView } from "./IdentifiedPageView"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserContextProvider>
      <AudioProvider>
        <ScrollProvider>
          <TooltipProvider>
            <TranscriptionProvider>
              <RecordingProvider>
                <SegmentsAnalysisProvider>
                  {children}
                  <ReactQueryDevtools
                    initialIsOpen={false}
                    position={"left"}
                    buttonPosition={"bottom-left"}
                  />
                </SegmentsAnalysisProvider>
              </RecordingProvider>
            </TranscriptionProvider>
          </TooltipProvider>
        </ScrollProvider>
      </AudioProvider>
      <IdentifiedPageView />
    </UserContextProvider>
  )
}
