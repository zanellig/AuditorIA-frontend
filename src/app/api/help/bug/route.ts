import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { env } from "@/env"
import { promises as fs } from "fs"
import path from "path"
import { generateBugReportEmailTemplate } from "./template"
import { bugReportSchema } from "@/lib/forms"
import { transporter } from "@/lib/mailer"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getHeaders } from "@/lib/get-headers"
import { isAuthenticated } from "@/lib/auth"

// Max file size (e.g., 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

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
        throw new Error(
          JSON.stringify({
            title: "Error",
            description: "El tamaño de imagen no debe superar los 5MB.",
            variant: "destructive",
          })
        )
      }

      // Convert image to a Buffer
      imageBuffer = Buffer.from(await image.arrayBuffer())

      // Save the image to a temporary location (optional, if needed)
      const tempDir = path.join(process.cwd(), "temp-")
      const tempPath = await fs.mkdtemp(tempDir)
      const imagePath = path.join(tempPath, image.name)
      await fs.writeFile(imagePath, imageBuffer.toString())
    }

    // Prepare the email options
    const mailOptions: nodemailer.SendMailOptions = {
      from: env.MAIL_FROM,
    }
    // Generate a unique CID
    const cid =
      new Date().getTime().toString() + Math.random().toString(36) + image?.name
    // Attach image if present
    if (imageBuffer && image) {
      mailOptions.attachments = [
        {
          filename: image.name,
          content: imageBuffer,
          cid,
        },
      ]
    }

    const now = format(Date.now(), "PPPP, pppp", { locale: es })
    const clientData = {
      geo: JSON.stringify(req.geo),
      referrer: req.referrer,
      ip: req.ip,
      integrity: req.integrity,
      headers: JSON.stringify(req.headers),
      date: now,
    }
    // Send emails in parallel
    const emailPromises = [
      transporter.sendMail({
        ...mailOptions,
        to: env.MAIL_TO,
        subject: "New Bug Report",
        html: generateBugReportEmailTemplate({
          data: { ...validatedData, date: now, cid },
          isDevMail: true,
          clientData: { ...clientData },
        }),
      }),
      transporter.sendMail({
        ...mailOptions,
        to: validatedData.email,
        subject: `Reporte de error del día ${now}`,
        html: generateBugReportEmailTemplate({
          data: validatedData,
        }),
      }),
    ]

    await Promise.all(emailPromises)

    return NextResponse.json(
      {
        title: "Se ha enviado el reporte de error correctamente",
        description:
          "¡Trabajaremos para solucionarlo lo más pronto posible! 💪",
        variant: "default",
      },
      { headers }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(error, { status: 400, headers })
  }
}
