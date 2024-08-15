import { Bar, BarChart, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { type ChartConfig } from "@/components/ui/chart"
import {
  ANGER_EMOTION_COLOR,
  DISGUST_EMOTION_COLOR,
  FEAR_EMOTION_COLOR,
  GLOBAL_ICON_SIZE,
  JOY_EMOTION_COLOR,
  OTHERS_EMOTION_COLOR,
} from "@/lib/consts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

export default function AverageEmotionChart({
  chartData,
  className,
}: {
  chartData: any
  className?: string
}) {
  const chartConfig = {
    probas: {
      label: "Probabilidad",
    },
    joy: {
      label: "Disfrute",
      color: JOY_EMOTION_COLOR,
    },
    fear: {
      label: "Miedo",
      color: FEAR_EMOTION_COLOR,
    },
    anger: {
      label: "Enojo",
      color: ANGER_EMOTION_COLOR,
    },
    others: {
      label: "Otros",
      color: OTHERS_EMOTION_COLOR,
    },
    disgust: {
      label: "Disgust",
      color: DISGUST_EMOTION_COLOR,
    },
  } satisfies ChartConfig

  let strongestEmotion = ""
  let highestEmotionProba = 0
  for (const dataObj of chartData) {
    if (dataObj.probas > highestEmotionProba) {
      highestEmotionProba = dataObj.probas
      strongestEmotion = dataObj.name
    }
  }
  highestEmotionProba = highestEmotionProba * 100

  return (
    <>
      {chartData && (
        <Card className='w-[350px] bg-transparent border-none'>
          <CardHeader>
            <CardDescription>Promedio de emoción</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className='min-h-[300px] h-[300px] w-full'
            >
              <BarChart
                accessibilityLayer
                data={chartData}
                layout='vertical'
                margin={{
                  left: 0,
                }}
              >
                <YAxis
                  dataKey='name'
                  type='category'
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={value =>
                    chartConfig[value as keyof typeof chartConfig]?.label
                  }
                />
                <XAxis dataKey='probas' type='number' hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey='probas' layout='vertical' radius={5} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className='flex-col items-start gap-2 text-sm'>
            <div className='flex gap-2 font-medium leading-none'>
              La emoción predominante fue {getSpanishEmotion(strongestEmotion)}{" "}
              con una probabilidad del {highestEmotionProba.toFixed(1)}%{" "}
              <TrendingUp size={GLOBAL_ICON_SIZE} />
            </div>
          </CardFooter>
        </Card>
      )}
    </>
  )
}

function getSpanishEmotion(emotion: string) {
  switch (emotion) {
    case "joy":
      return "disfrute"
    case "fear":
      return "miedo"
    case "anger":
      return "enojo"
    case "others":
      return "otros"
    case "disgust":
      return "disgust"
    default:
      return "desconocido"
  }
}
