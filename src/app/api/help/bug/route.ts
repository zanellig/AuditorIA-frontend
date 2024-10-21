import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import nodemailer from "nodemailer"
import { env } from "@/env"
import { promises as fs } from "fs"
import path from "path"
import { generateBugReportEmailTemplate } from "./template"
import { bugReportSchema } from "@/lib/forms"
import { transporter } from "@/lib/mailer"

// Max file size (e.g., 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    // Extract fields from the form
    const name = formData.get("name")?.toString() || ""
    const email = formData.get("email")?.toString() || ""
    const description = formData.get("description")?.toString() || ""
    const stepsToReproduce = formData.get("stepsToReproduce")?.toString() || ""
    const severity = formData.get("severity")?.toString() || "low"

    // Validate non-file fields using Zod
    const validatedData = bugReportSchema.parse({
      name,
      email,
      description,
      stepsToReproduce,
      severity,
    })

    // Handle image file
    const image = formData.get("file") as File | null
    let imageBuffer: Buffer | undefined

    if (image) {
      // Validate the image file
      if (image.size > MAX_FILE_SIZE) {
        throw new Error("Image size exceeds the 5MB limit.")
      }

      // Convert image to a Buffer
      imageBuffer = Buffer.from(await image.arrayBuffer())

      // Save the image to a temporary location (optional, if needed)
      const tempDir = path.join(process.cwd(), "temp")
      await fs.mkdir(tempDir, { recursive: true })
      const imagePath = path.join(tempDir, image.name)
      await fs.writeFile(imagePath, imageBuffer)
    }

    // Prepare the email options
    const mailOptions: nodemailer.SendMailOptions = {
      from: env.MAIL_FROM,
      subject: "AuditorIA | New Bug Report",
      html: generateBugReportEmailTemplate(validatedData),
    }

    // Attach image if present
    if (imageBuffer && image) {
      mailOptions.attachments = [
        {
          filename: image.name,
          content: imageBuffer,
        },
      ]
    }

    // Send emails in parallel
    const emailPromises = [
      transporter.sendMail({ ...mailOptions, to: env.MAIL_TO }),
      transporter.sendMail({
        ...mailOptions,
        to: validatedData.email,
        subject: "Recibimos tu reporte de error.",
      }),
    ]

    await Promise.all(emailPromises)

    return NextResponse.json({
      title: "Se ha enviado el reporte de error correctamente",
      description: "Trabajaremos para solucionarlo lo más pronto posible!",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(error, { status: 400 })
  }
}
