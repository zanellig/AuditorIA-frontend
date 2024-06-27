import NavElements from "@/components/NavElements"

export default function Navbar() {
  return (
    <div className="p-4 w-full flex flex-row justify-between">
      <a href="/" className="text-xl font-italic font-bold">
        AuditorIA
      </a>
      <NavElements />
    </div>
  )
}
