import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getUserFromDb } from './lib/actions/auth';

const saltAndHashPassword = (password: string) => {
  // Implement your password salting and hashing logic here
  // This is a placeholder function
  return password; // Replace with actual hashed password
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        let user = null;

        // logic to salt and hash password
        const pwHash = saltAndHashPassword(credentials.password as string);

        // logic to verify if the user exists
        user = await getUserFromDb(credentials.email as string, pwHash);

        if (!user) {
          // No user found, so this is their first attempt to login
          // Optionally, this is also the place you could do a user registration
          throw new Error('Invalid credentials.');
        }

        // return user object with their profile data
        return {
          id: user.uuid,
          name: user.name,
          email: user.email,
          location: user.location,
          uuid: user.uuid, // Ensure this is included if you need it
        };
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
});
