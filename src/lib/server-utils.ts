import "server-only"

import crypto from "crypto"
import { env } from "@/env"

export function checkIfUserIsAdmin(user: string) {
  const ADMINS = ["gonzalo.zanelli", "agustin.bouzon"]
  return ADMINS.includes(user)
}

export function generateAdminCookie(user: string) {
  const secret = env.ADMIN_SECRET
  const encryptedUser = crypto
    .createHmac("sha256", secret)
    .update(user)
    .digest("hex")
  return encryptedUser
}

export function verifyAdminCookie(cookie: string, user: string) {
  const expectedHash = generateAdminCookie(user)
  return crypto.timingSafeEqual(Buffer.from(cookie), Buffer.from(expectedHash))
}
