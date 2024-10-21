import "server-only"
import nodemailer from "nodemailer"
import { env } from "@/env"

// Setup Nodemailer
export const transporter = nodemailer.createTransport({
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
