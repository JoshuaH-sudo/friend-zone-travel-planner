import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import { getUserFromDb } from './lib/actions/auth';
import { z } from 'zod';
import prisma from './lib/db';

const saltAndHashPassword = (password: string) => {
  // Implement your password salting and hashing logic here
  // This is a placeholder function
  return password; // Replace with actual hashed password
};

export const signInSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .min(1, 'Email is required')
    .email('Invalid email'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
    .min(8, 'Password must be more than 8 characters')
    .max(32, 'Password must be less than 32 characters'),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          // Validate credentials using Zod schema
          const { email, password } = await signInSchema.parseAsync(credentials);

          // logic to salt and hash password
          const pwHash = saltAndHashPassword(password);

          // logic to verify if the user exists
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          }); 

          if (!user) {
            // No user found, so this is their first attempt to login
            // Optionally, this is also the place you could do a user registration
            throw new Error('Invalid credentials.');
          }

          // return user object with their profile data
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            location: user.location,
          };
        } catch (error) {
          console.error('Error during authorization:', error);
          // Handle validation errors or other errors
          if (error instanceof z.ZodError) {
            return null;
          }

          return null; // Return null to indicate failure
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
});
