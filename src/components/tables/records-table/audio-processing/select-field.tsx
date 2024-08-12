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
import { UseFormReturn } from "react-hook-form"

type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

type SelectFieldProps<TFormValues extends Record<string, any>> = {
  name: string
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
      // @ts-ignore
      name={name}
      render={({ field }) => (
        <FormItem>
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
              <SelectContent>
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
