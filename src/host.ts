import "server-only"
import os from "os"

export function getDeviceInfo() {
  const hostname = os.hostname() // Get the hostname
  const interfaces = os.networkInterfaces()
  let ipAddress = "no-ip-found"

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        ipAddress = iface.address // Get the IPv4 address
        break
      }
    }
    if (ipAddress !== "no-ip-found") break
  }

  return { hostname, ipAddress }
}
