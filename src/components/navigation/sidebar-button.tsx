import React, { Key } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, type LucideProps } from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { motion, AnimatePresence } from "framer-motion"
import { VariantProps } from "class-variance-authority"
import { useSidebarStore } from "@/lib/stores/use-sidebar-store"

// We should store the state of the buttons in the server because we are getting a hydration error when loading the page and accessing the local storage.

export interface SidebarButtonProps {
  className?: string
  customKey: Key
  href?: string
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >
  title: string
  clickOptions?: {
    redirect?: boolean
    onClick?: () => void
  }
  disabled?: boolean
  children?: React.ReactNode
  variant?: VariantProps<typeof buttonVariants>["variant"]
}

export function SidebarButton({
  className,
  customKey,
  href,
  Icon,
  title,
  clickOptions,
  disabled = false,
  children,
  Achildren,
  variant = "ghost",
}: SidebarButtonProps & { Achildren?: SidebarButtonProps[] }) {
  const pathname = usePathname()
  const isActive = pathname === href
  const selectedClassAttributes =
    "text-accent-foreground shadow-md shadow-accent-foreground/50 dark:shadow-accent-foreground/80 dark:bg-accent"

  // Generate a unique ID for this sidebar button
  const buttonId = React.useMemo(
    () =>
      `sidebar-${title.toLowerCase().replace(/ /g, "-")}-${String(customKey)}`,
    [title, customKey]
  )

  // Use zustand store instead of local state
  const isOpen = useSidebarStore(state => state.isOpen(buttonId))
  const toggleOpen = useSidebarStore(state => state.toggleOpen)

  // Memoize the mapped children to avoid unnecessary re-renders
  const renderedChildren = React.useMemo(
    () => (
      <div className='flex flex-col ml-4'>
        {Achildren?.map((child, index) => {
          const { customKey, ...props } = child
          return (
            <SidebarButton
              key={`${customKey}-child-${index}`}
              customKey={`${customKey}-child-${index}`}
              variant={variant}
              {...props}
            />
          )
        })}
        {React.Children.map(children, (child, index) =>
          React.isValidElement(child)
            ? React.cloneElement(child, { key: `${customKey}-child-${index}` })
            : null
        )}
      </div>
    ),
    [Achildren, children, customKey, variant]
  )

  const hasChildren =
    (children && Array.isArray(children) && children.length > 0) ||
    (Achildren && Achildren.length > 0)
  const hasChildrenAndNoHref = !!hasChildren && !!href

  return (
    <section
      id={`sidebar-${hasChildren ? "expandable" : "normal"}-${title
        .toLowerCase()
        .replace(/ /g, "-")}-button`}
      key={customKey}
      className='flex flex-col pr-2 pl-2 w-full'
    >
      <div
        className={cn(
          className,
          "flex flex-row justify-between items-center space-x-2 mb-1"
        )}
      >
        <Link
          href={href && !disabled ? href : "#"}
          key={customKey + "-link"}
          className={cn(
            "w-full h-full",
            disabled && "cursor-default",
            hasChildrenAndNoHref && "cursor-default"
          )}
          onClick={() => {
            document.getElementById("menu-drawer-close-button")?.click()
          }}
        >
          <SidebarButtonWrapper
            className={cn(
              isActive && selectedClassAttributes,
              "flex justify-between items-center w-full",
              hasChildrenAndNoHref &&
                "cursor-default hover:bg-transparent shadow-none hover:shadow-none hover:text-muted-foreground"
            )}
            onClick={clickOptions?.onClick ? clickOptions.onClick : () => null}
            key={customKey + "-wrapper"}
            disabled={disabled}
            variant={variant}
          >
            <div className='flex flex-row space-x-4 justify-start items-center'>
              <div key={customKey + "-icon"}>
                {<Icon size={GLOBAL_ICON_SIZE} />}
              </div>
              <div
                key={customKey + "-title"}
                className={cn(
                  "text-sm"
                  // isOpen && "underline underline-offset-4"
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
            className={cn("w-fit h-fit rounded-full p-1")}
            onClick={() => toggleOpen(buttonId)}
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
  variant = "ghost",
}: {
  children: React.ReactNode
  className?: string | boolean
  onClick?: () => void
  disabled?: boolean
  variant?: VariantProps<typeof buttonVariants>["variant"]
}) {
  return (
    <Button
      className={cn(
        "flex bg-popover w-full min-w-full items-center justify-start py-2 px-4",
        className,
        disabled && "cursor-not-allowed hover:bg-background hover:shadow-none"
      )}
      onClick={onClick}
      disabled={disabled}
      variant={variant}
    >
      {children}
    </Button>
  )
}
