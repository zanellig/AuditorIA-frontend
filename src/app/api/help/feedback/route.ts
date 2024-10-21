import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import nodemailer from "nodemailer"
import { env } from "@/env"
import { generateFeedbackEmailTemplate } from "./template"
import { feedbackSchema } from "@/lib/forms"
import { transporter } from "@/lib/mailer"

export async function POST(req: Request) {
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
      return NextResponse.json({
        title: "Muchas gracias por tu feedback! 💃🏼",
        variant: "success",
      })
    } else {
      return NextResponse.json({
        title: "Recibimos tu feedback",
        description: "¡Trabajaremos para mejorar!",
      })
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json(error, { status: 400 })
  }
}
