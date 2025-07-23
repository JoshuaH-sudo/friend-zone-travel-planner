import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper type for Supabase User (since we don't manage users through Prisma)
export type SupabaseUser = {
  id: string
  email?: string
  created_at?: string
  updated_at?: string
}
