"use server";
import prisma from "../db";

export const getUserFromDb = async (email: string, passwordHash: string) => {
  return prisma.user.findUnique({
    where: {
      email,
      passwordHash,
    },
  });
};
