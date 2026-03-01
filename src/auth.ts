import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
   adapter: PrismaAdapter(prisma) as ReturnType<typeof PrismaAdapter>,
   providers: [
      Google({
         clientId: process.env.AUTH_GOOGLE_ID ?? '',
         clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
      }),
      Credentials({
         credentials: {
            email: { label: 'Email', type: 'email' },
            password: { label: 'Mật khẩu', type: 'password' },
         },
         async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) return null;

            const user = await prisma.user.findUnique({
               where: { email: credentials.email as string },
            });

            if (!user?.password) return null;

            const isValid = await bcrypt.compare(credentials.password as string, user.password);
            if (!isValid) return null;

            return { id: user.id, name: user.name, email: user.email, image: user.image };
         },
      }),
   ],
   // JWT strategy so Credentials provider works alongside OAuth
   session: { strategy: 'jwt' },
   pages: {
      signIn: '/sign-in',
   },
   callbacks: {
      /** Attach user id to the session from the JWT sub */
      session({ session, token }) {
         if (token.sub) {
            session.user.id = token.sub;
         }
         return session;
      },
      jwt({ token, user }) {
         if (user?.id) {
            token.sub = user.id;
         }
         return token;
      },
   },
});
