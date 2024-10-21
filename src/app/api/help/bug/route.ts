import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import nodemailer from "nodemailer"
import { env } from "@/env"
import { promises as fs } from "fs"
import path from "path"
import { generateBugReportEmailTemplate } from "./template"

// Bug report schema for non-file fields
const bugReportSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  description: z.string().min(1, "Bug description is required"),
  stepsToReproduce: z.string().min(1, "Steps to reproduce are required"),
  severity: z.enum(["low", "medium", "high"], {
    message: "Severity must be low, medium, or high",
  }),
})

// Define accepted image MIME types
const acceptedImageTypes = ["image/jpeg", "image/png"]

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
    const image = formData.get("image") as File | null
    let imageBuffer: Buffer | undefined

    if (image) {
      // Validate the image file
      if (!acceptedImageTypes.includes(image.type)) {
        throw new Error(
          "Invalid file type. Only JPEG and PNG images are allowed."
        )
      }
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
        subject: "Recibimos tu reporte de error!",
      }),
    ]

    await Promise.all(emailPromises)

    return NextResponse.json("Se ha enviado el reporte de error correctamente")
  } catch (error) {
    console.error(error)
    return NextResponse.json(error, { status: 400 })
  }
}
