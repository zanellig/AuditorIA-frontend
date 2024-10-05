"use client"

import React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function DatePickerWithPresets({
  onDateChange,
}: {
  onDateChange?: (date: Date) => void
}) {
  const [date, setDate] = React.useState<Date>()
  // pass the value to the parent component
  React.useEffect(() => {
    if (date) {
      onDateChange(date)
    }
  }, [date])
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {date ? format(date, "PPP") : <span>Seleccione una fecha</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='flex w-auto flex-col space-y-2 p-2'>
        <Select
          onValueChange={value => setDate(addDays(new Date(), parseInt(value)))}
        >
          <SelectTrigger>
            <SelectValue placeholder='Seleccionar' />
          </SelectTrigger>
          <SelectContent position='popper'>
            <SelectItem value='0'>Hoy</SelectItem>
            <SelectItem value='-1'>Ayer</SelectItem>
            <SelectItem value='-3'>Hace 3 días</SelectItem>
            <SelectItem value='-7'>Hace una semana</SelectItem>
          </SelectContent>
        </Select>
        <div className='rounded-md border'>
          <Calendar mode='single' selected={date} onSelect={setDate} />
        </div>
      </PopoverContent>
    </Popover>
  )
}
