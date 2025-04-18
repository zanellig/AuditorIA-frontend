"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

const FormSchema = z.object({
  datetime: z.date({
    required_error: "Fecha y hora requeridas.",
  }),
})

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24 // Milliseconds in one day
const MAX_FUTURE_SELECTION = 60 // Maximum future selection in days
const today = Date.now()
const earliestSelectableDate = today - ONE_DAY_IN_MS // Yesterday
const latestSelectableDate = today + ONE_DAY_IN_MS * MAX_FUTURE_SELECTION // 30 days from now

export function DateTimePicker({
  onSubmit,
}: {
  onSubmit: (data: z.infer<typeof FormSchema>) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [time, setTime] = useState<string>("05:00")
  const [date, setDate] = useState<Date | null>(null)
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <div className='flex w-full gap-4'>
            <FormField
              control={form.control}
              name='datetime'
              render={({ field }) => (
                <FormItem className='flex flex-col w-full'>
                  <FormLabel>Fecha</FormLabel>
                  <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            `${format(field.value, "PPP")}, ${time}`
                          ) : (
                            <span>Seleccione una fecha</span>
                          )}
                          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        captionLayout='dropdown'
                        selected={date || field.value}
                        onSelect={selectedDate => {
                          const [hours, minutes] = time?.split(":") || [
                            "00",
                            "00",
                          ]
                          if (selectedDate) {
                            selectedDate.setHours(
                              parseInt(hours),
                              parseInt(minutes)
                            )
                            setDate(selectedDate)
                            field.onChange(selectedDate)
                          }
                        }}
                        onDayClick={() => setIsOpen(false)}
                        fromYear={2000}
                        toYear={new Date().getFullYear()}
                        disabled={date =>
                          Number(date) < earliestSelectableDate ||
                          Number(date) > latestSelectableDate
                        }
                        defaultMonth={field.value}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Establezca su fecha y hora.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='datetime'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Hora</FormLabel>
                  <FormControl>
                    <Select
                      defaultValue={time}
                      onValueChange={e => {
                        setTime(e)
                        if (date) {
                          const [hours, minutes] = e.split(":")
                          const newDate = new Date(date.getTime())
                          newDate.setHours(parseInt(hours), parseInt(minutes))
                          setDate(newDate)
                          field.onChange(newDate)
                        }
                      }}
                    >
                      <SelectTrigger className='font-normal focus:ring-0 w-[120px]'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className='h-[15rem]'>
                          {Array.from({ length: 96 }).map((_, i) => {
                            const hour = Math.floor(i / 4)
                              .toString()
                              .padStart(2, "0")
                            const minute = ((i % 4) * 15)
                              .toString()
                              .padStart(2, "0")
                            return (
                              <SelectItem key={i} value={`${hour}:${minute}`}>
                                {hour}:{minute}
                              </SelectItem>
                            )
                          })}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type='submit'>Enviar</Button>
        </form>
      </Form>
    </>
  )
}
