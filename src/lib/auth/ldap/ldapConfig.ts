import "server-only"
import { Client, InvalidCredentialsError } from "ldapts"

const ldap = async () => {
  const ldapClient = new Client({
    url: process.env.LDAP_URL || "ldap://localhost:389",
    timeout: 0,
    connectTimeout: 0,
    tlsOptions: {
      minVersion: "TLSv1.2",
    },
    strictDN: true,
  })
  try {
    await ldapClient.bind(
      process.env.LDAP_BIND_DN || "cn=admin,dc=example,dc=com",
      process.env.LDAP_BIND_CREDENTIALS || "admin"
    )
  } catch (ex) {
    if (ex instanceof InvalidCredentialsError) {
      console.error(ex)
    }

    throw ex
  } finally {
    await ldapClient.unbind()
  }
}
