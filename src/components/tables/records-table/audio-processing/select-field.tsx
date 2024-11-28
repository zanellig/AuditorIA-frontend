import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Path, UseFormReturn } from "react-hook-form"

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}
/* eslint @typescript-eslint/no-explicit-any: "off" */
interface SelectFieldProps<TFormValues extends Record<string, any>> {
  name: Path<TFormValues>
  label: string
  options: SelectOption[]
  form: UseFormReturn<TFormValues>
  disabled?: boolean
}

export function SelectField<TFormValues extends Record<string, any>>({
  name,
  label,
  options,
  form,
  disabled = false,
}: SelectFieldProps<TFormValues>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className='w-full'>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={disabled}
            >
              <SelectTrigger className='w-full'>
                <SelectValue
                  placeholder={`Seleccione ${label.toLowerCase()}`}
                />
              </SelectTrigger>
              <SelectContent className='max-h-44 h-fit'>
                <SelectGroup>
                  {options.map(option => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.label.includes("<span") ? (
                        <span
                          dangerouslySetInnerHTML={{ __html: option.label }}
                        />
                      ) : (
                        option.label
                      )}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
