import logo from "../../public/logo.png"
import Image from "next/image"

export default function Logo({
  ...props
}: Partial<React.ComponentProps<typeof Image>>) {
  return <Image {...props} src={logo} alt='AuditorIA' loading='lazy' />
}
