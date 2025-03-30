'use server'

import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import AuthHandler from "@/app/Handler/AuthHandler";
import CredentialsProvider from "next-auth/providers/credentials";

const authHandler = new AuthHandler();

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        try {
          const {user} = await authHandler.login(credentials.email, credentials.password);
          return user ? { ...user, id: user.id.toString() } : null;
        } catch (error) {
          console.error('Login error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días de persistencia
    updateAge: 24 * 60 * 60, // Actualiza la sesión cada 24 horas
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Verificación básica de email
      if (!user.email) {
        throw new Error('No email provided');
      }

      // Manejo específico para proveedores OAuth
      if (account?.provider === 'google' || account?.provider === 'linkedin') {
        // Aquí puedes agregar lógica para crear/actualizar usuario en tu DB
        // Por ejemplo:
        // await authHandler.handleOAuthUser(user.email, profile.name, account.provider);
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // Persistir datos adicionales en el token JWT
      if (user) {
        token.user = {...user };
      }
      return token;
    },
    async session({ session, token }) {
      // Enviar datos del usuario a la sesión del cliente
      session.user = {
        ...session.user,         // Datos básicos
        ...token.user,           // Todos los datos del token
        id: token?.user?.id,       // Asegurar que el id está incluido
      };
      
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirigir a dashboard después del login
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },
  pages: {
    signIn: '/auth/login', // Página personalizada de login
    error: '/auth/error', // Página de errores de autenticación
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 días
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };