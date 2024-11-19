import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { env } from "@/env"
import { generateFeedbackEmailTemplate } from "./template"
import { feedbackSchema } from "@/lib/forms"
import { transporter } from "@/lib/mailer"
import { getHeaders } from "@/lib/get-headers"
import { isAuthenticated } from "@/lib/auth"

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, {
    status: 200,
    headers: await getHeaders(request),
  })
}

export async function POST(req: NextRequest) {
  const headers = await getHeaders(req)
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json(
      {
        title: "Error",
        description: "La sesión ha caducado",
      },
      {
        status: 401,
        headers,
      }
    )
  }
  if (headers instanceof NextResponse) return headers
  try {
    const formData = await req.formData()
    const name: string = formData.get("name")?.toString() || ""
    const email: string = formData.get("email")?.toString() || ""
    const message: string = formData.get("message")?.toString() || ""
    const rating: number = Number(formData.get("rating")?.toString()) || 1
    const validatedData = feedbackSchema.parse({
      name,
      email,
      message,
      rating,
    })

    // Prepare the email options
    const mailOptions: nodemailer.SendMailOptions = {
      from: env.MAIL_FROM,
      subject: "AuditorIA | New Feedback Submission!",
      text: `Nombre: ${validatedData.name}\nCorreo: ${validatedData.email}\nMensaje: ${validatedData.message}\nCalificación: ${validatedData.rating}`,
      html: generateFeedbackEmailTemplate(validatedData),
    }

    // Send emails in parallel
    const emailPromises = [
      transporter.sendMail({ ...mailOptions, to: env.MAIL_TO }),
      transporter.sendMail({
        ...mailOptions,
        to: validatedData.email,
        subject: "Gracias por tu feedback!",
      }),
    ]

    await Promise.all(emailPromises)
    if (rating >= 4) {
      return NextResponse.json(
        {
          title: "Muchas gracias por tu feedback! 💃🏼",
          variant: "success",
        },
        { headers }
      )
    } else {
      return NextResponse.json(
        {
          title: "Recibimos tu feedback",
          description: "¡Trabajaremos para mejorar!",
        },
        { headers }
      )
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json(error, { status: 400, headers })
  }
}
