import { betterAuth } from "better-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const auth = betterAuth({
  database: PrismaAdapter(prisma),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    hashPassword: async (password: string) => {
      return await bcrypt.hash(password, 10)
    },
    verifyPassword: async (password: string, hash: string) => {
      return await bcrypt.compare(password, hash)
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
})
