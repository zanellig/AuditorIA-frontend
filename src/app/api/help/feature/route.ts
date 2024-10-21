import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import nodemailer from "nodemailer"
import { env } from "@/env"
import { generateFeatureSuggestionEmailTemplate } from "./template"

const featureSuggestionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  suggestion: z.string().min(1, "Feature suggestion is required"),
  benefit: z
    .string()
    .min(1, "Please describe how this feature would be beneficial"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log(body)
    const validatedData = featureSuggestionSchema.parse(body)

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
        subject: "Recibimos tu sugerencia!",
      }),
    ]
    await Promise.all(emailPromises)

    return NextResponse.json({
      success: true,
      data: JSON.stringify(validatedData),
      error: null,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(error, { status: 400 })
  }
}
