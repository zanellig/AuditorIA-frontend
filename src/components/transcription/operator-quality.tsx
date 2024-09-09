// "use client"
// import * as React from "react"
// import { useQuery } from "@tanstack/react-query"
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion"
// import { useTranscription } from "../context/TranscriptionProvider"
// import { getOperatorQuality } from "@/lib/actions"
// export default function OperatorQuality() {
//   const { transcription, isLoading, error, fetchTranscription } =
//     useTranscription()

//   const { data: operatorQuality, isLoading: isOperatorQualityLoading } =
//     useQuery({
//       queryKey: ["operatorQuality", transcription?.identifier],
//       queryFn: getOperatorQuality,
//       enabled: false, // This ensures the query doesn't run automatically
//       retry: false,
//     })
// }
