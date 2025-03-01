"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { handleCopyToClipboard, localizeSpeaker } from "@/lib/utils"
import { Check, Copy } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SpkAnalysis({
  speakers,
  LLMAnalysis,
}: {
  speakers?: string[]
  LLMAnalysis?: Record<string, string | null>
}) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = React.useState(
    (speakers && speakers[0]) ?? ""
  )
  const [copiedSpeaker, setCopiedSpeaker] = React.useState<string | null>(null)
  const copyToClipboard = (speaker: string, feedback: string) => {
    const message = `${localizeSpeaker(speaker)}: ${feedback}`
    handleCopyToClipboard(message)
    setCopiedSpeaker(speaker)
    toast({ title: "Copiado al portapapeles", variant: "success" })
    setTimeout(() => {
      setCopiedSpeaker(null)
    }, 2000)
  }
  return (
    <>
      {LLMAnalysis && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList>
            {speakers &&
              speakers.map(speaker => (
                <TabsTrigger key={speaker} value={speaker}>
                  {localizeSpeaker(speaker)}
                </TabsTrigger>
              ))}
          </TabsList>
          {LLMAnalysis &&
            typeof LLMAnalysis === "object" &&
            Object.entries(LLMAnalysis).map(([speaker, feedback]) => (
              <TabsContent key={speaker} value={speaker}>
                <div className='p-4 rounded-lg bg-muted'>
                  <div className='flex justify-between items-start mb-2'>
                    <h3 className='font-semibold text-lg'>
                      {localizeSpeaker(speaker)}
                    </h3>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        copyToClipboard(speaker, feedback as string)
                      }
                      className='ml-2'
                    >
                      {copiedSpeaker === speaker ? (
                        <Check className='h-4 w-4' />
                      ) : (
                        <Copy className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                  <p className='text-sm'>{feedback as string}</p>
                </div>
              </TabsContent>
            ))}
        </Tabs>
      )}
    </>
  )
}
