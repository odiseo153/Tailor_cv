import NextAuth, { NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import CredentialsProvider from "next-auth/providers/credentials";
import AuthHandler from "@/app/Handler/AuthHandler";
import { getRequestIp, prisma } from "@/lib/utils";

// Extender las interfaces para incluir los datos personalizados
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      phone?: string | null;
      location?: string | null;
      profilePicture?: string | null;
      stripeCustomerId?: string | null;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    phone?: string | null;
    location?: string | null;
    profilePicture?: string | null;
  }
}

// Inicializamos Prisma y AuthHandler
const authHandler = new AuthHandler();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_API_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_API_GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          // Asignar rol predeterminado y otros campos necesarios
          password: "", // Será ignorado para login social
        };
      },
    }),
    LinkedInProvider({
      clientId: process.env.NEXT_PUBLIC_API_LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_API_LINKEDIN_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.localizedFirstName + " " + profile.localizedLastName,
          email: profile.emailAddress,
          image: profile.profilePicture?.["displayImage~"]?.elements?.[0]?.identifiers?.[0]?.identifier || null,
          // Asignar rol predeterminado y otros campos necesarios
          password: "", // Será ignorado para login social
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@ejemplo.com" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos");
        }

        try {
          // Obtener la IP del cliente para el rate limiting
          const clientIp = getRequestIp(req) || 'unknown';
          
          // Llamar al método de login mejorado que ahora soporta rate limiting
          const { success, user, error } = await authHandler.login(
            credentials.email,
            credentials.password,
            clientIp
          );

          if (!success || !user) {
            throw new Error(error || "Credenciales inválidas");
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.profilePicture,
            phone: user.phone,
            location: user.location,
            profilePicture: user.profilePicture,
            stripeCustomerId: user.stripeCustomerId,

          };
        } catch (error: any) {
          console.error("Error en authorize:", error);
          throw new Error(error.message || "Error al iniciar sesión");
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    newUser: "/auth/register",
    verifyRequest: "/auth/verify-request",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
    updateAge: 24 * 60 * 60, // Actualizar token cada 24 horas
  },
  jwt: {
    // Tiempo de expiración del token (30 días)
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Solo procesamos si es login con Google o LinkedIn
      if (account?.provider === 'google' || account?.provider === 'linkedin') {
        try {
          // Verificar si el usuario existe
          let dbUser = await prisma.user.findUnique({ 
            where: { email: user.email! } 
          });

          // Si no existe, creamos un nuevo usuario
          if (!dbUser && user.email) {
            dbUser = await prisma.user.create({
              data: {
                id: user.id,
                name: user.name || 'Usuario',
                email: user.email,
                password: '', // No necesita contraseña para login social
                profilePicture: user.image || null,
                // Crear preferencias de CV predeterminadas
                cvPreferences: {
              create: {
                template: 'modern',
                primaryColor: '#2563eb',
                secondaryColor: '#3b82f6',
                fontFamily: 'Arial',
                fontSize: 'medium',
                spacing: 1,
                showPhoto: true,
                showContact: true,
                showSocial: true,
                pageSize: 'a4',
            }
                }
              }
            });
          }
          
          return !!dbUser;
        } catch (error) {
          console.error('Error al verificar/crear usuario:', error);
          return false;
        }
      }

      // Para credenciales ya existía la verificación
      if (credentials) {
        const dbUser = await prisma.user.findUnique({ 
          where: { email: user.email! } 
        });
        return !!dbUser;
      }

      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      // Si es la primera vez que se inicia sesión con este usuario
      if (user) {
        token.userId = user.id;
        
        // Si es un login social (Google o LinkedIn)
        if (account?.provider === 'google' || account?.provider === 'linkedin') {
          // Consultar los datos del usuario desde la base de datos para obtener los campos adicionales
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email! },
            });
            
            if (dbUser) {
              // Asignar los datos adicionales al token
              token.phone = dbUser.phone;
              token.location = dbUser.location;
              token.profilePicture = dbUser.profilePicture;
              token.stripeCustomerId = dbUser.stripeCustomerId;
            }
          } catch (error) {
            console.error('Error al obtener datos adicionales del usuario:', error);
          }
        } else {
          if ('phone' in user) token.phone = user.phone as string | null;
          if ('location' in user) token.location = user.location as string | null;
          if ('profilePicture' in user) token.profilePicture = user.profilePicture as string | null;
          if ('stripeCustomerId' in user) token.stripeCustomerId = user.stripeCustomerId as string | null;
        }
      }

      // Actualizar el token cuando hay una actualización de sesión
      if (trigger === "update" && session) {
        if (session.user) {
          Object.assign(token, session.user);
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Agregar datos del token al objeto de sesión
      if (token && session.user) {
        session.user.id = token.userId;
        if ('phone' in token) session.user.phone = token.phone;
        if ('location' in token) session.user.location = token.location;
        if ('profilePicture' in token) session.user.profilePicture = token.profilePicture;
        if ('stripeCustomerId' in token) session.user.stripeCustomerId = token.stripeCustomerId as string | null;
      }
      
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Manejar redirecciones después de inicio/cierre de sesión
      if (url.startsWith(baseUrl)) return url;
      // Si intenta ir a una URL externa, redirigir a la página principal
      if (url.startsWith("http")) return baseUrl;
      return baseUrl + url;
    },
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
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      }
    }
  },
  // Habilitar CSRF Protection
  secret: process.env.NEXT_PUBLIC_API_NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  // Optimización de seguridad
  useSecureCookies: process.env.NODE_ENV === "production",
};

// Crear el handler para App Router
const handler = NextAuth(authOptions);

// Exportar las funciones GET y POST para que Next.js las utilice
export { handler as GET, handler as POST };

// Exportar para poder utilizar en otros archivos
export type { Session };

