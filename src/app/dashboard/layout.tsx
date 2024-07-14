import NavigationButtons from "@/components/navigation"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div id='main' className='flex flex-col mt-10'>
        <NavigationButtons />
        <div className='container ml-auto mr-auto py-10'>{children}</div>
      </div>
    </>
  )
}
