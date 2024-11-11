export interface User {
  username: string
  email: string
  fullName: string
  avatar: string
  isActive: boolean
}

export interface UserContextValue extends Partial<User> {
  getAbbreviation: () => string
  updateAvatar: (newAvatar: string) => Promise<void>
}
