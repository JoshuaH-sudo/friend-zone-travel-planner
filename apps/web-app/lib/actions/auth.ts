"use server";

import prisma from "../db";

export async function getUserFromDb(email: string, passwordHash: string) { 
  return prisma.user.findUnique({
    where: {
      email,
      passwordHash,
    },
  });
};
