"use client"
import React from "react"
import type { Averages, TranscriptionType } from "@/lib/types.d"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { calculateAverages } from "@/lib/actions"
import {
  ANGER_EMOTION_COLOR,
  DISGUST_EMOTION_COLOR,
  FEAR_EMOTION_COLOR,
  JOY_EMOTION_COLOR,
  OTHERS_EMOTION_COLOR,
} from "@/lib/consts"
import AverageEmotionChart from "@/components/transcription/average-emotion-chart"
import { Card, CardContent } from "@/components/ui/card"
import { getUniqueWords } from "@/lib/utils"

export default function Analysis({
  transcription,
}: {
  transcription: TranscriptionType
}) {
  const { toast } = useToast()
  const [averages, setAverages] = React.useState<Averages | null>(null)
  const [averageChartData, setAverageChartData] = React.useState<any>(null)
  const words = getUniqueWords(transcription?.result?.segments)

  const [allLoaded, setAllLoaded] = React.useState<boolean>(false)
  return (
    <Card className='items-center justify-center w-full flex'>
      {!averages && (
        <Button
          onClick={async () => {
            if (
              !transcription.result.segments[0].analysis ||
              !transcription.result
            ) {
              toast({
                title: "Error",
                description: "Esta transcripción aún no fue analizada",
                variant: "destructive",
              })
            }
            const calculation = await calculateAverages(
              transcription.result.segments
            )

            setAverages(calculation)
            const averageChartDataValues = [
              {
                name: "joy",
                probas: calculation?.sentimentAverage.joy,
                fill: JOY_EMOTION_COLOR,
              },
              {
                name: "fear",
                probas: calculation?.sentimentAverage.fear,
                fill: FEAR_EMOTION_COLOR,
              },
              {
                name: "anger",
                probas: calculation?.sentimentAverage.anger,
                fill: ANGER_EMOTION_COLOR,
              },
              {
                name: "others",
                probas: calculation?.sentimentAverage.others,
                fill: OTHERS_EMOTION_COLOR,
              },
              {
                name: "disgust",
                probas: calculation?.sentimentAverage.disgust,
                fill: DISGUST_EMOTION_COLOR,
              },
            ]
            setAverageChartData(averageChartDataValues)
            setAllLoaded(true)
          }}
          variant='outline'
          className='w-full'
        >
          Más detalles...
        </Button>
      )}
      {allLoaded && (
        <CardContent className='items-center justify-center'>
          <AverageEmotionChart chartData={averageChartData} />
        </CardContent>
      )}
    </Card>
  )
}
