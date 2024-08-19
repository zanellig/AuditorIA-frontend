"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import { HeroParallax } from "@/components/ui/hero-parallax"
import { AnimatedTooltip } from "@/components/ui/animated-tooltip"

export default function Home() {
  return (
    <main className='scroll-smooth' id='home'>
      <Parallax />
      <AnimatedTooltipPreview />
    </main>
  )
}

export function Parallax() {
  return <HeroParallax products={products} />
}

export const products = [
  {
    title: "CallCenter",
    link: "dashboard",
    thumbnail:
      "https://linksolution.com.ar/wp-content/uploads/2022/09/cropped-linksolution-operadores.jpg",
  },
  {
    title: "GPTW",
    link: "dashboard",
    thumbnail:
      "https://linksolution.com.ar/wp-content/uploads/2024/05/equipo-mujeres-linksolution.jpg",
  },
  {
    title: "CallCenter",
    link: "dashboard",
    thumbnail:
      "https://linksolution.com.ar/wp-content/uploads/2020/03/team-enjoy.jpg",
  },
  {
    title: "Editorially",
    link: "dashboard",
    thumbnail:
      "https://linksolution.com.ar/wp-content/uploads/2022/12/LinkSolution-Directivos.jpg",
  },
  {
    title: "Editrix AI",
    link: "dashboard",
    thumbnail:
      "https://linksolution.com.ar/wp-content/uploads/2022/09/cropped-linksolution-callcenter.jpg",
  },
  {
    title: "Pixel Perfect",
    link: "dashboard",
    thumbnail:
      "https://linksolution.com.ar/wp-content/uploads/2024/04/cropped-staff.jpg",
  },
  {
    title: "CallCenter",
    link: "dashboard",
    thumbnail:
      "https://linksolution.com.ar/wp-content/uploads/2022/09/cropped-linksolution-operadores.jpg",
  },
  {
    title: "GPTW",
    link: "dashboard",
    thumbnail:
      "https://linksolution.com.ar/wp-content/uploads/2024/05/equipo-mujeres-linksolution.jpg",
  },
  {
    title: "CallCenter",
    link: "dashboard",
    thumbnail:
      "https://linksolution.com.ar/wp-content/uploads/2020/03/team-enjoy.jpg",
  },
  {
    title: "Editorially",
    link: "dashboard",
    thumbnail:
      "https://linksolution.com.ar/wp-content/uploads/2022/12/LinkSolution-Directivos.jpg",
  },
  {
    title: "Editrix AI",
    link: "dashboard",
    thumbnail:
      "https://linksolution.com.ar/wp-content/uploads/2022/09/cropped-linksolution-callcenter.jpg",
  },
  {
    title: "Pixel Perfect",
    link: "dashboard",
    thumbnail:
      "https://linksolution.com.ar/wp-content/uploads/2024/04/cropped-staff.jpg",
  },
]
const people = [
  {
    id: 1,
    name: "Agustin Bouzon",
    designation: "Developer",
    image: "https://github.com/AgustinBouzonn.png",
  },
  {
    id: 2,
    name: "Gonzalo Zanelli",
    designation: "Developer",
    image: "https://github.com/zanellig.png",
  },
]

export function AnimatedTooltipPreview() {
  return (
    <div className='flex flex-row items-center justify-center mb-10 w-full'>
      <AnimatedTooltip items={people} />
    </div>
  )
}
