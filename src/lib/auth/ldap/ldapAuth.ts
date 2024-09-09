import ldap from "ldapjs"
import { ldapConfig } from "./ldapConfig"

export async function authenticateUser(
  username: string,
  password: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({
      url: ldapConfig.url,
      tlsOptions: ldapConfig.tlsOptions,
    })

    client.bind(ldapConfig.bindDN, ldapConfig.bindCredentials, err => {
      if (err) {
        console.error("LDAP bind failed:", err)
        client.unbind()
        reject(err)
        return
      }

      const opts = {
        filter: ldapConfig.searchFilter.replace("{{username}}", username),
        scope: "sub",
        attributes: ["dn"],
      }

      client.search(ldapConfig.searchBase, opts, (err, res) => {
        if (err) {
          console.error("LDAP search failed:", err)
          client.unbind()
          reject(err)
          return
        }

        res.on("searchEntry", entry => {
          const userDN = entry.objectName
          client.bind(userDN, password, err => {
            if (err) {
              console.error("User authentication failed:", err)
              resolve(false)
            } else {
              console.log("User authenticated successfully")
              resolve(true)
            }
            client.unbind()
          })
        })

        res.on("error", err => {
          console.error("LDAP search error:", err)
          client.unbind()
          reject(err)
        })

        res.on("end", result => {
          if (result.status !== 0) {
            console.log("User not found")
            client.unbind()
            resolve(false)
          }
        })
      })
    })
  })
}
