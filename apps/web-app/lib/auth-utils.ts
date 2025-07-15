import bcryptjs from "bcryptjs"
import { auth } from "@/lib/auth"
import prisma from "@/lib/db"

const SALT_ROUNDS = 12

/**
 * Hash a password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, SALT_ROUNDS)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}

/**
 * Get the current user session
 */
export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

/**
 * Get the current user's ID from session
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id || null
}

/**
 * Create a new user with hashed password
 */
export async function createUser(email: string, password: string, name?: string) {
  const hashedPassword = await hashPassword(password)
  
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  })
}

/**
 * Check if a user exists by email
 */
export async function userExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
  })
  return !!user
}

