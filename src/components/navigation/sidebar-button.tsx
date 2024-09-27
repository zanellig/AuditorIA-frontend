import React, { Key, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { motion, AnimatePresence } from "framer-motion"

export interface SidebarButtonProps {
  className?: string
  key: Key
  href?: string
  icon: React.JSX.Element
  title: string
  clickOptions?: {
    redirect?: boolean
    onClick?: () => void
  }
  disabled?: boolean
  children?: React.ReactNode
}

export function SidebarButton({
  className,
  key,
  href,
  icon,
  title,
  clickOptions,
  disabled = false,
  children,
  Achildren,
}: SidebarButtonProps & { Achildren?: SidebarButtonProps[] }) {
  const pathname = usePathname()
  const isActive = pathname === href
  const selectedClassAttributes =
    "text-accent-foreground shadow-md shadow-accent-foreground/50 dark:shadow-accent-foreground/80 dark:bg-accent"
  const [isOpen, setIsOpen] = useState(false)

  // Memoize the mapped children to avoid unnecessary re-renders
  const renderedChildren = React.useMemo(() => {
    return (
      <div className='flex flex-col ml-4'>
        {Achildren?.map((child, index) => {
          const { key, ...props } = child
          return (
            <SidebarButton key={`${child.key}-child-${index}`} {...props} />
          )
        })}
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement<SidebarButtonProps>(child)) {
            return React.cloneElement(child, {
              key: child.key ?? `${key}-react-child-${index}`,
            })
          }
          return null
        })}
      </div>
    )
  }, [Achildren, children, key])

  const hasChildren =
    (children && Array.isArray(children) && children.length > 0) ||
    (Achildren && Achildren.length > 0)

  return (
    <section
      id={`sidebar-${hasChildren ? "expandable" : "normal"}-${title
        .toLowerCase()
        .replace(/ /g, "-")}-button`}
      key={key}
      className='flex flex-col pr-4 pl-2 w-full'
    >
      <div
        className={cn(className, "flex flex-row justify-between items-center space-x-2")}
      >
        <Link
          href={href && !disabled ? href : "#"}
          key={key + "-link"}
          className={cn("w-full h-full", disabled && "cursor-not-allowed")}
        >
          <SidebarButtonWrapper
            className={cn(
              isActive && selectedClassAttributes,
              "flex justify-between items-center w-full"
            )}
            onClick={clickOptions?.onClick ? clickOptions.onClick : () => null}
            key={key + "-wrapper"}
            disabled={disabled}
          >
            <div className='flex flex-row space-x-4 justify-start items-center'>
              <div key={key + "-icon"}>{icon}</div>
              <div
                key={key + "-title"}
                className={cn(
                  "text-sm",
                  isOpen && "underline underline-offset-4"
                )}
              >
                {title}
              </div>
            </div>
          </SidebarButtonWrapper>
        </Link>
        {hasChildren && (
          <Button
            variant='ghost'
            size='icon'
            className='w-fit h-fit rounded-full p-1'
            onClick={() => setIsOpen(!isOpen)}
          >
            {!isOpen ? (
              <ChevronDown size={GLOBAL_ICON_SIZE} />
            ) : (
              <ChevronUp size={GLOBAL_ICON_SIZE} />
            )}
          </Button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            {renderedChildren}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function SidebarButtonWrapper({
  children,
  className,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode
  className?: string | boolean
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <Button
      variant={"ghost"}
      className={cn(
        "flex bg-popover w-full min-w-full items-center justify-start py-2 px-4",
        className,
        disabled && "cursor-not-allowed hover:bg-background hover:shadow-none"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  )
}
