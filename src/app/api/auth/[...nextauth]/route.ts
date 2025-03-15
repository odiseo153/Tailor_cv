
// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import linkedinProvider from "next-auth/providers/linkedin";


const authOptions :NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_API_LINKEDIN_CLIENT_SECRET!,
    }),
    linkedinProvider({
        clientId: process.env.NEXT_PUBLIC_API_LINKEDIN_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ account, profile }) {
        if(!profile?.email){
            throw new Error('No profile provider');
        }
        console.log(profile);

        return true;
      },
      async redirect({ url, baseUrl }) {
        // Redirige a /dashboard después del login exitoso
        return baseUrl;
      }
  },
  secret: process.env.NEXT_PUBLIC_API_NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; // Esta línea es crítica


