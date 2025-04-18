import { env } from "@/env"

interface BugReportData {
  name: string
  email: string
  description: string
  stepsToReproduce: string
  severity: "low" | "medium" | "high"
  date?: string
  cid?: string
}

export function generateBugReportEmailTemplate({
  data,
  isDevMail = false,
  clientData,
}: {
  data: BugReportData
  isDevMail?: boolean
  clientData?: Record<string, string | undefined | null>
}): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px;">
          <h1 style="color: #2c3e50; text-align: center;">AuditorIA Bug Report</h1>
        </div>

        <div style="margin-top: 20px;">
          <h2 style="color: #2c3e50;">Detalles del Reporte</h2>

          ${
            clientData?.date || data?.date
              ? `<div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
            <p><strong>Fecha y hora del error:</strong></p>
             <p style="white-space: pre-wrap;">${clientData?.date || data?.date}</p>
          </div>`
              : ""
          }

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
            <p><strong>Nombre:</strong> ${data.name}</p>
            <p><strong>Correo:</strong> ${data.email}</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
            <p><strong>Descripción:</strong></p>
            <p style="white-space: pre-wrap;">${data.description}</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
            <p><strong>Pasos para reproducir el error:</strong></p>
            <p style="white-space: pre-wrap;">${data.stepsToReproduce}</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
            <p><strong>Severidad del error:</strong> 
              <span style="color: ${
                data.severity === "high"
                  ? "#e74c3c"
                  : data.severity === "medium"
                    ? "#f39c12"
                    : "#27ae60"
              }; font-weight: bold;">
                ${data.severity.toUpperCase()}
              </span>
            </p>
          </div>
        </div>

        ${
          isDevMail
            ? `
         <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
            <p><strong>Información para debugging</strong></p>
            <p style="white-space: pre-wrap;">${JSON.stringify({
              APP_ENV: env.APP_ENV,
              NODE_ENV: env.NODE_ENV,
              HOST: env.HOST,
              PORT: env.PORT,
              NEXT_RUNTIME: env.NEXT_RUNTIME,
              MAIL_HOST: env.MAIL_HOST,
              MAIL_PORT: env.MAIL_PORT,
              MAIL_USER: env.MAIL_USER,
            })}</p>
            <p style="white-space: pre-wrap;">${JSON.stringify(clientData)}</p>
          </div>
        `
            : ""
        }

        ${
          data?.cid
            ? `<div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
              <img src="cid:${data.cid}" alt="Captura de pantalla" style="max-width: 500px; height: auto; width: 100%;">
          </div>`
            : ""
        }
        
        <div style="margin-top: 30px; text-align: center; font-size: 0.8em; color: #7f8c8d;">
          <p>Este es un correo automático. Por favor, no responda a este mensaje.</p>
        </div>
      </body>
    </html>
  `
}
