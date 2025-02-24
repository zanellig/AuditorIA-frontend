"use client"

import * as React from "react"
import { cn, getColorForEmotion } from "@/lib/utils"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import type { SegmentAnalysis } from "@/lib/types"

import { Info } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Label, Pie, PieChart, Sector } from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"

const mockSegmentAnalysis: SegmentAnalysis = {
  segment: "Mock Segment",
  start: 0,
  joy: 0.2,
  fear: 0.1,
  anger: 0.15,
  others: 0.05,
  disgust: 0.1,
  sadness: 0.2,
  surprise: 0.2,
  NEG: 0.3,
  NEU: 0.4,
  POS: 0.3,
  hateful: 0.1,
  targeted: 0.2,
  aggressive: 0.7,
}

interface SegmentAnalysisCardProps {
  segmentAnalysis?: SegmentAnalysis | null
  triggerClassName?: string
}

const emotionChartConfig = {
  joy: {
    label: "Disfrute",
    color: `var(--${getColorForEmotion("joy")})`,
  },
  fear: {
    label: "Miedo",
    color: `var(--${getColorForEmotion("fear")})`,
  },
  anger: {
    label: "Enojo",
    color: `var(--${getColorForEmotion("anger")})`,
  },
  others: {
    label: "Otros",
    color: `var(--${getColorForEmotion("others")})`,
  },
  disgust: {
    label: "Disgusto",
    color: `var(--${getColorForEmotion("disgust")})`,
  },
  sadness: {
    label: "Tristeza",
    color: `var(--${getColorForEmotion("sadness")})`,
  },
  surprise: {
    label: "Sorpresa",
    color: `var(--${getColorForEmotion("surprise")})`,
  },
} satisfies ChartConfig

const sentimentChartConfig = {
  NEG: {
    label: "Negativo",
    color: "var(--red-500)",
  },
  NEU: {
    label: "Neutral",
    color: "var(--yellow-500)",
  },
  POS: {
    label: "Positivo",
    color: "var(--green-500)",
  },
} satisfies ChartConfig

const hateChartConfig = {
  hateful: {
    label: "Odioso",
    color: "var(--red-500)",
  },
  targeted: {
    label: "Dirigido",
    color: "var(--orange-500)",
  },
  aggressive: {
    label: "Agresivo",
    color: "var(--red-600)",
  },
} satisfies ChartConfig

export default function SegmentAnalysisCard({
  segmentAnalysis = mockSegmentAnalysis,
  triggerClassName,
}: SegmentAnalysisCardProps) {
  const { emotionData, sentimentData, hateData } = mapSegmentAnalysis(
    segmentAnalysis!
  )

  return (
    <HoverCard>
      <HoverCardTrigger asChild className={cn(triggerClassName)}>
        <Info size={GLOBAL_ICON_SIZE} />
      </HoverCardTrigger>
      <HoverCardContent
        alignOffset={-10}
        align='end'
        className='w-full max-w-3xl p-4'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <EmotionPieChart emotionData={emotionData} />
          <SentimentPieChart sentimentData={sentimentData} />
          <HatePieChart hateData={hateData} />
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

function EmotionPieChart({ emotionData }: { emotionData: any[] }) {
  const id = "emotion-pie-chart"
  const maxIndex = emotionData.reduce(
    (maxIdx, item, index, arr) =>
      item.value > arr[maxIdx].value ? index : maxIdx,
    0
  )
  const [activeEmotion, setActiveEmotion] = React.useState(
    emotionData[maxIndex].emotion
  )

  const activeIndex = React.useMemo(
    () => emotionData.findIndex(item => item.emotion === activeEmotion),
    [activeEmotion, emotionData]
  )
  const emotions = React.useMemo(
    () => emotionData.map(item => item.emotion),
    [emotionData]
  )

  return (
    <Card data-chart={id} className='flex flex-col'>
      <ChartStyle id={id} config={emotionChartConfig} />
      <CardHeader className='flex-row items-start space-y-0 pb-0'>
        <Select value={activeEmotion} onValueChange={setActiveEmotion}>
          <SelectTrigger
            className='mx-auto h-7 pl-2.5'
            aria-label='Select an emotion'
          >
            <SelectValue placeholder='Select emotion' />
          </SelectTrigger>
          <SelectContent align='end'>
            {emotions.map(key => {
              const config =
                emotionChartConfig[key as keyof typeof emotionChartConfig]
              if (!config) return null

              return (
                <SelectItem key={key} value={key} className='[&_span]:flex'>
                  <div className='flex items-center gap-2 text-xs'>
                    <span
                      className='flex h-3 w-3 shrink-0 rounded-sm'
                      style={{
                        backgroundColor: `var(--${getColorForEmotion(key)})`,
                      }}
                    />
                    {config.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className='flex flex-1 justify-center pb-0'>
        <ChartContainer
          id={id}
          config={emotionChartConfig}
          className='w-full h-[200px] md:h-[250px] lg:h-[300px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={emotionData}
              dataKey='value'
              nameKey='emotion'
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const current = emotionData[activeIndex]
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold'
                        >
                          {current.value.toFixed(2)}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground text-xs sm:text-sm'
                        >
                          {
                            emotionChartConfig[
                              current.emotion as keyof typeof emotionChartConfig
                            ].label
                          }
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function SentimentPieChart({ sentimentData }: { sentimentData: any[] }) {
  const id = "sentiment-pie-chart"
  const maxIndex = sentimentData.reduce(
    (maxIdx, item, index, arr) =>
      item.value > arr[maxIdx].value ? index : maxIdx,
    0
  )
  const [activeSentiment, setActiveSentiment] = React.useState(
    sentimentData[maxIndex].sentiment
  )

  const activeIndex = React.useMemo(
    () => sentimentData.findIndex(item => item.sentiment === activeSentiment),
    [activeSentiment, sentimentData]
  )
  const sentiments = React.useMemo(
    () => sentimentData.map(item => item.sentiment),
    [sentimentData]
  )

  return (
    <Card data-chart={id} className='flex flex-col'>
      <ChartStyle id={id} config={sentimentChartConfig} />
      <CardHeader className='flex-row items-start space-y-0 pb-0'>
        <Select value={activeSentiment} onValueChange={setActiveSentiment}>
          <SelectTrigger
            className='mx-auto h-7 w-[130px] pl-2.5'
            aria-label='Select a sentiment'
          >
            <SelectValue placeholder='Select sentiment' />
          </SelectTrigger>
          <SelectContent align='end'>
            {sentiments.map(key => {
              const config =
                sentimentChartConfig[key as keyof typeof sentimentChartConfig]
              if (!config) return null

              return (
                <SelectItem key={key} value={key} className='[&_span]:flex'>
                  <div className='flex items-center gap-2 text-xs'>
                    <span
                      className='flex h-3 w-3 shrink-0 rounded-sm'
                      style={{
                        backgroundColor: config.color,
                      }}
                    />
                    {config.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className='flex flex-1 justify-center pb-0'>
        <ChartContainer
          id={id}
          config={sentimentChartConfig}
          className='w-full h-[200px] md:h-[250px] lg:h-[300px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={sentimentData}
              dataKey='value'
              nameKey='sentiment'
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const current = sentimentData[activeIndex]
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold'
                        >
                          {current.value.toFixed(2)}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className='fill-muted-foreground text-xs sm:text-sm'
                        >
                          {
                            sentimentChartConfig[
                              current.sentiment as keyof typeof sentimentChartConfig
                            ].label
                          }
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function HatePieChart({ hateData }: { hateData: any[] }) {
  const id = "hate-pie-chart"
  const maxIndex = hateData.reduce(
    (maxIdx, item, index, arr) =>
      item.value > arr[maxIdx].value ? index : maxIdx,
    0
  )
  const [activeHate, setActiveHate] = React.useState(hateData[maxIndex].hate)

  const activeIndex = React.useMemo(
    () => hateData.findIndex(item => item.hate === activeHate),
    [activeHate, hateData]
  )
  const hateTypes = React.useMemo(
    () => hateData.map(item => item.hate),
    [hateData]
  )

  return (
    <Card data-chart={id} className='flex flex-col'>
      <ChartStyle id={id} config={hateChartConfig} />
      <CardHeader className='flex-row items-start space-y-0 pb-0'>
        <Select value={activeHate} onValueChange={setActiveHate}>
          <SelectTrigger
            className='mx-auto h-7 w-[130px] pl-2.5'
            aria-label='Select a hate type'
          >
            <SelectValue placeholder='Select hate type' />
          </SelectTrigger>
          <SelectContent align='end'>
            {hateTypes.map(key => {
              const config =
                hateChartConfig[key as keyof typeof hateChartConfig]
              if (!config) return null

              return (
                <SelectItem key={key} value={key} className='[&_span]:flex'>
                  <div className='flex items-center gap-2 text-xs'>
                    <span
                      className='flex h-3 w-3 shrink-0 rounded-sm'
                      style={{
                        backgroundColor: config.color,
                      }}
                    />
                    {config.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className='flex flex-1 justify-center pb-0'>
        <ChartContainer
          id={id}
          config={hateChartConfig}
          className='w-full h-[200px] md:h-[250px] lg:h-[300px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={hateData}
              dataKey='value'
              nameKey='hate'
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const current = hateData[activeIndex]
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold'
                        >
                          {current.value.toFixed(2)}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className='fill-muted-foreground text-xs sm:text-sm'
                        >
                          {
                            hateChartConfig[
                              current.hate as keyof typeof hateChartConfig
                            ].label
                          }
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

const mapSegmentAnalysis = (segmentAnalysis: SegmentAnalysis) => {
  // Define groups by their keys
  const sentimentKeys = ["NEU", "POS", "NEG"]
  const hateKeys = ["hateful", "targeted", "aggressive"]
  // Filter out keys that should not be mapped as emotions.
  // We're excluding "segment" (as required) and "start" (if not needed in charts).
  const emotionKeys = Object.keys(segmentAnalysis).filter(
    key =>
      key !== "segment" &&
      key !== "start" &&
      !sentimentKeys.includes(key) &&
      !hateKeys.includes(key)
  )
  // Map each key to the structure { emotion, value }
  const sentimentData = sentimentKeys.map(key => ({
    sentiment: key,
    value: segmentAnalysis[key as keyof SegmentAnalysis] * 100,
    fill: sentimentChartConfig[key as keyof typeof sentimentChartConfig].color,
  }))
  const hateData = hateKeys.map(key => ({
    hate: key,
    value: segmentAnalysis[key as keyof SegmentAnalysis] * 100,
    fill: hateChartConfig[key as keyof typeof hateChartConfig].color,
  }))
  const emotionData = emotionKeys.map(key => ({
    emotion: key,
    value: segmentAnalysis[key as keyof SegmentAnalysis] * 100,
    fill: `var(--${getColorForEmotion(key)})`,
  }))
  return { sentimentData, hateData, emotionData }
}
