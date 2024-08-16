"use client"
import type { Averages, Recording, TranscriptionType } from "@/lib/types.d"
import { ReactNode, useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { calculateAverages, getRecord } from "@/lib/actions"
import {
  ALL_RECORDS_PATH,
  ANGER_EMOTION_COLOR,
  DISGUST_EMOTION_COLOR,
  FEAR_EMOTION_COLOR,
  JOY_EMOTION_COLOR,
  OTHERS_EMOTION_COLOR,
  URL_API_CANARY,
  URL_API_MAIN,
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
  const [averages, setAverages] = useState<Averages | null>(null)
  const [averageChartData, setAverageChartData] = useState<any>(null)
  const words = getUniqueWords(transcription.result?.segments)
  console.log(words)

  // const [record, setRecord] = useState<Recording | null>(null)
  // const record = await getRecord(
  //   [URL_API_CANARY, ALL_RECORDS_PATH],
  //   transcription.metadata.file_name
  // )
  // setRecord(record)

  const [allLoaded, setAllLoaded] = useState<boolean>(false)
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
          {/* <code>{JSON.stringify(record, null, 2)}</code> */}
        </CardContent>
      )}
    </Card>
  )
}
