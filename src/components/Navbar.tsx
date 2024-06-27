"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { ModeToggle } from "./ModeToggle"

import PerfilDeUsuario from "@/components/PerfilDeUsuario"
import { DialogProvider } from "@/contexts/dialog-context"

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Audios Neotel",
    href: "/",
    description: "Pendiente de documentación por Ing. Bouzon.",
  },
  {
    title: "Transcripción Manual",
    href: "/",
    description:
      "Desde este módulo podrá transcribir cualquier audio que posea en su computadora.",
  },
  {
    title: "Tareas",
    href: "/",
    description: "Visualice la lista de transcripciones pendientes.",
  },
  {
    title: "Vistas",
    href: "/",
    description: "Pendiente de documentación por Ing. Bouzon.",
  },
]

export default function Navbar() {
  return (
    <NavigationMenu>
      <NavigationMenuList className="flex w-full max-w-screen-lg mx-auto gap-3">
        <NavigationMenuItem>
          <NavigationMenuTrigger>¿Qué podés hacer?</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <span className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
                    <div className="mb-2 text-lg font-medium">AuditorIA</div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Web app para visualizar transcripciones y análisis de
                      sentimiento.
                    </p>
                  </span>
                </NavigationMenuLink>
              </li>
              <ListItem href="/" title="Proximamente...">
                Descripción pendiente.
              </ListItem>
              <ListItem href="/" title="Proximamente...">
                Descripción pendiente.
              </ListItem>
              <ListItem href="/" title="Proximamente...">
                Descripción pendiente.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Utilidades</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Contactanos
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <ModeToggle />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <DialogProvider>
            <PerfilDeUsuario />
          </DialogProvider>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
