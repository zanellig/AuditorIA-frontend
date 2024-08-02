import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function obtenerMesLocale(mes: number): string {
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]
  return meses[mes]
}

export function secondsToHMS(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  return { hours, minutes, seconds: remainingSeconds }
}

export function formatTimestamp(
  {
    hours,
    minutes,
    seconds,
  }: {
    hours: number
    minutes: number
    seconds: number
  },
  concat: boolean
) {
  let formattedTime = ""
  if (hours > 0) {
    formattedTime += `${hours}h `
  }
  if (minutes > 0) {
    formattedTime += `${minutes}m `
  }
  if (Number(seconds.toFixed(0)) > 0) {
    formattedTime += `${concat ? seconds.toFixed(0) : seconds.toFixed(2)}s`
  }
  return formattedTime.trim()
}
