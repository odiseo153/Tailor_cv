"use server"

import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import CredentialsProvider from "next-auth/providers/credentials";
import AuthHandler from "@/app/Handler/AuthHandler";
import { PrismaClient, User, WorkExperience, Skill, Education, SocialLink, CvPreferences } from "@prisma/client";

//const prisma = new PrismaClient();

// Extender la interfaz de sesión para incluir el usuario completo de Prisma
interface ExtendedSession extends DefaultSession {
  user: User & {
    workExperience: WorkExperience[];
    skills: Skill[];
    education: Education[];
    socialLinks: SocialLink[];
    cvPreferences: CvPreferences | null;
  };
}

// Extender el tipo del token JWT
interface ExtendedJWT {
  user?: User & {
    workExperience: WorkExperience[];
    skills: Skill[];
    education: Education[];
    socialLinks: SocialLink[];
    cvPreferences: CvPreferences | null;
  };
}

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
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email y contraseña son requeridos");
        }
        try {
          const { user } = await authHandler.login(credentials.email, credentials.password);
          if (!user) {
            return null;
          }
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            phone: user.phone,
            location: user.location,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt?.toISOString(),
            updatedAt: user.updatedAt?.toISOString(),
            workExperience: user.workExperience || [],
            skills: user.skills || [],
            education: user.education || [],
            socialLinks: user.socialLinks || [],
            cvPreferences: user.cvPreferences || null,
          };
        } catch (error) {
          console.error("Error en login:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
    updateAge: 24 * 60 * 60, // Actualiza la sesión cada 24 horas
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        throw new Error("No se proporcionó un email");
      }

      if (account?.provider === "google" || account?.provider === "linkedin") {
      
    } 

    return true;
    },
    async jwt({ token, user, trigger, session }) {
      // Persistir datos del usuario en el token al iniciar sesión
      if (user) {
        token.user = { 
          id: user.id,
          name: user.name || "Usuario",
          email: user.email,
          password: user.password || "",
          phone: user.phone,
          location: user.location,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          workExperience: user.workExperience || [],
          skills: user.skills || [],
          education: user.education || [],
          socialLinks: user.socialLinks || [],
          cvPreferences: user.cvPreferences || null,
        };
      }

      // Manejar actualizaciones de la sesión
      if (trigger === "update" && session) {
        // Combinar las propiedades actualizadas de session con token.user
        token.user = {
          ...token.user,
          // Actualizar solo las propiedades proporcionadas en session
          name: session.name || token.user?.name,
          email: session.email || token.user?.email,
          password: session.password || token.user?.password,
          phone: session.phone !== undefined ? session.phone : token.user?.phone,
          location: session.location !== undefined ? session.location : token.user?.location,
          profilePicture:
            session.profilePicture !== undefined
              ? session.profilePicture
              : token.user?.profilePicture,
          createdAt: session.createdAt || token.user?.createdAt,
          updatedAt: session.updatedAt || token.user?.updatedAt,
          workExperience: session.workExperience || token.user?.workExperience || [],
          skills: session.skills || token.user?.skills || [],
          education: session.education || token.user?.education || [],
          socialLinks: session.socialLinks || token.user?.socialLinks || [],
          cvPreferences: session.cvPreferences || token.user?.cvPreferences || null,
        } as User & {
          workExperience: WorkExperience[];
          skills: Skill[];
          education: Education[];
          socialLinks: SocialLink[];
          cvPreferences: CvPreferences | null;
        };
      }

      return token ;
    },
    async session({ session, token }) {
      // Incluir todos los datos del usuario en la sesión del cliente
      if (token.user) {
        session.user = token.user;
      }

      return session as ExtendedSession;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 días
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Exportar el handler para GET y POST
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Exportar tipos para usar en el frontend
export type { ExtendedSession, User, WorkExperience, Skill, Education, SocialLink, CvPreferences };