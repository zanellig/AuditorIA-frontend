import TitleH1 from "@/components/typography/titleH1"

export default function BasicDashboard() {
  return (
    <>
      <TitleH1>Hola, {"[nombre]"}</TitleH1>
      <div className='grid gap-2 md:grid-cols-3  sm:grid-cols-2 text-center w-full h-full justify-center items-center'>
        <div className='border bg-popover w-[300px] h-[150px]'>Hola</div>
        <div className='border bg-popover w-[300px] h-[150px]'>Hola</div>
        <div className='border bg-popover w-[300px] h-[150px]'>Hola</div>
        <div className='border bg-popover w-[300px] h-[150px]'>Hola</div>
        <div className='border bg-popover w-[300px] h-[150px]'>Hola</div>
        <div className='border bg-popover w-[300px] h-[150px]'>Hola</div>
      </div>
    </>
  )
}
