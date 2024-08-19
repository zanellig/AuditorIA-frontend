"use client"
import React from "react"
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion"
import { Cover } from "@/components/ui/cover"
import Image from "next/image"
import Link from "next/link"
import { SparklesCore } from "@/components/ui/sparkles"
import TitleH1 from "../typography/titleH1"
import ParagraphP from "../typography/paragraphP"

export const HeroParallax = ({
  products,
}: {
  products: {
    title: string
    link: string
    thumbnail: string
  }[]
}) => {
  const ref = React.useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const springConfig = { stiffness: 300, damping: 30 }

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  )
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  )
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  )
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  )
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  )
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-500, 500]),
    springConfig
  )

  return (
    <div
      ref={ref}
      className='h-[220vh] py-40 overflow-hidden antialiased relative flex flex-col [perspective:1000px] [transform-style:preserve-3d]'
    >
      <Header />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className='space-y-20'
      >
        <ProductRow
          products={products.slice(0, 5)}
          translate={translateX}
          reverse
        />
        <ProductRow
          products={products.slice(5, 10)}
          translate={translateXReverse}
        />
      </motion.div>
    </div>
  )
}

export const Header = () => {
  return (
    <div className='max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full left-0 top-0'>
      <div className='relative inline-block'>
        <h1 className='text-2xl md:text-7xl font-bold dark:text-white'>
          AuditorIA
        </h1>
        <div className='absolute inset-0 flex items-center justify-center'>
          <SparklesCore
            background='transparent'
            minSize={0.4}
            maxSize={1}
            particleDensity={500}
            className='w-full h-full'
            particleColor='#FFFFFF'
          />
        </div>
        <div
          className='absolute inset-0 pointer-events-none'
          style={{
            boxShadow: "0 0 15px 5px rgba(255, 255, 255, 0.5)",
            borderRadius: "15px",
            maskImage: "radial-gradient(circle, white 50%, transparent 70%)",
          }}
        ></div>
      </div>
      <p className='max-w-2xl text-base md:text-xl mt-8 dark:text-neutral-200'>
        Servicio de auditoría revolucionario impulsado por inteligencia
        artificial.
      </p>
      <Cover>
        <div>Powered By LinkSolution</div>
      </Cover>
    </div>
  )
}

const ProductRow = ({
  products,
  translate,
  reverse = false,
}: {
  products: {
    title: string
    link: string
    thumbnail: string
  }[]
  translate: MotionValue<number>
  reverse?: boolean
}) => {
  return (
    <motion.div
      className={`flex ${
        reverse ? "flex-row-reverse space-x-reverse" : "flex-row"
      } space-x-20`}
    >
      {products.map(product => (
        <ProductCard
          product={product}
          translate={translate}
          key={product.title}
        />
      ))}
    </motion.div>
  )
}

export const ProductCard = ({
  product,
  translate,
}: {
  product: {
    title: string
    link: string
    thumbnail: string
  }
  translate: MotionValue<number>
}) => {
  return (
    <motion.div
      style={{ x: translate }}
      whileHover={{ y: -20 }}
      className='group/product h-96 w-[35rem] relative flex-shrink-0'
    >
      <Link
        href={product.link}
        className='block group-hover/product:shadow-2xl '
      >
        <Image
          src={product.thumbnail}
          height={600}
          width={600}
          className='object-cover object-left-top absolute h-full w-full inset-0'
          alt={`Imagen de ${product.title}`}
        />
      </Link>
      <div className='absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-black pointer-events-none'></div>
      <h2 className='absolute bottom-4 left-4 opacity-0 group-hover/product:opacity-100 text-white'>
        {product.title}
      </h2>
    </motion.div>
  )
}
