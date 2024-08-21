import LoadingScreen from "@/components/loading-screen"

export default function Loading() {
  return (
    <LoadingScreen
      className='self-center'
      words={["dashboard", "panel de control"]}
      usingAI={false}
    />
  )
}
