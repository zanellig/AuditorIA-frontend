import ErrorScreen from "@/components/error/error-screen"

export default function NotFoundPage() {
  return <ErrorScreen redirectUrl='/dashboard' id='not-found-page' />
}
