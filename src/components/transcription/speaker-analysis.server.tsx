import { URL_API_MAIN, URL_API_CANARY } from "@/lib/consts"
import { Button } from "../ui/button"
import SpeakerAnalysisCard from "./speaker-analysis-card.client"
import { getAnalysis } from "@/lib/actions"

export default function SpeakerAnalysis() {
  async function GETAnalysis(id: string): Promise<boolean> {
    const analysis = await getAnalysis([URL_API_CANARY, "spkanalysis"], id)
    console.log(analysis)
    if (analysis.processed_result) {
      return true
    }
    return false
  }
  return (
    <SpeakerAnalysisCard getAnalysisSv={GETAnalysis}>
      <div>{}</div>
    </SpeakerAnalysisCard>
  )
}
