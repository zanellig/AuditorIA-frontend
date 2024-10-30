import { NextRequest, NextResponse } from "next/server"
import { env } from "@/env"
import { generateFeatureSuggestionEmailTemplate } from "./template"
import { featureSuggestionSchema } from "@/lib/forms"
import { transporter } from "@/lib/mailer"
import { getHeaders } from "@/lib/get-headers"

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, {
    status: 204,
    headers: await getHeaders(request),
  })
}

export async function POST(req: NextRequest) {
  const headers = await getHeaders(req)
  if (headers instanceof NextResponse) return headers
  try {
    const formData = await req.formData()
    const name: string = formData.get("name")?.toString() || ""
    const email: string = formData.get("email")?.toString() || ""
    const suggestion: string = formData.get("suggestion")?.toString() || ""
    const benefit: string = formData.get("benefit")?.toString() || ""
    const validatedData = featureSuggestionSchema.parse({
      name,
      email,
      suggestion,
      benefit,
    })

    // Prepare the email options
    const mailOptions = {
      from: env.MAIL_FROM,
      subject: "AuditorIA | New Feature Suggestion",
      html: generateFeatureSuggestionEmailTemplate(validatedData),
    }

    const emailPromises = [
      transporter.sendMail({
        ...mailOptions,
        to: env.MAIL_TO,
      }),
      transporter.sendMail({
        ...mailOptions,
        to: validatedData.email,
        subject: "Recibimos tu sugerencia! 🫡",
      }),
    ]
    await Promise.all(emailPromises)

    return NextResponse.json(
      { title: "Recibimos tu sugerencia! 🫡" },
      { headers }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(error, { status: 400, headers })
  }
}
