import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import nodemailer from "nodemailer"
import { env } from "@/env"
import { generateFeedbackEmailTemplate } from "./template"

const feedbackSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required"),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log(body)
    const validatedData = feedbackSchema.parse(body)

    // Setup Nodemailer
    const transporter = nodemailer.createTransport({
      host: env.MAIL_HOST,
      port: Number(env.MAIL_PORT),
      auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASS,
      },
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
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

    return NextResponse.json("Recibimos tu feedback! 💃🏼")
  } catch (error) {
    console.error(error)
    return NextResponse.json(error, { status: 400 })
  }
}
