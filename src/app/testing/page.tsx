"use client"
import { useForm } from "react-hook-form"
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { createTask } from "@/lib/actions"
import { handleCopyToClipboard } from "@/lib/utils"
import { Select, SelectTrigger } from "@/components/ui/select"

export default function TestingPage() {
  return (
    <form method='post' action={createTask} className='flex flex-col h-screen'>
      <input type='text' name='language' placeholder='Language' />
      <input type='text' name='task_type' placeholder='Task type' />
      <input type='text' name='model' placeholder='Model' />
      <input type='text' name='device' placeholder='Device' />
      <input type='file' name='file' />
      <button type='submit'>Submit</button>
    </form>
  )
}

function SelectControlledField({ triggerText }: { triggerText: string }) {
  return (
    <Select>
      <SelectTrigger asChild aria-label={triggerText}>
        <span>{triggerText}</span>
      </SelectTrigger>
    </Select>
  )
}
