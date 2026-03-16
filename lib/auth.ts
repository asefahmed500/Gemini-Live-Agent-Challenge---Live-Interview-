import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      // Implement password reset email sending here
      console.log("Password reset requested for:", user.email)
    },
    sendVerificationEmail: async ({ user, url }) => {
      // Implement verification email sending here
      console.log("Verification email sent to:", user.email)
    },
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
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  advanced: {
    cookiePrefix: "better-auth",
    crossSubDomainCookies: {
      enabled: false,
    },
    // Allow CORS for WebSocket server and other origins
    useSecureCookies: process.env.NODE_ENV === "production",
  },
})
