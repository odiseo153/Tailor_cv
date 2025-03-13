import NextAuth from "next-auth";
import LinkedInProvider from "next-auth/providers/linkedin";

export default NextAuth({
  providers: [
    LinkedInProvider({
      clientId: process.env.NEXT_PUBLIC_API_LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_API_LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "r_liteprofile",
        },
      },
    }),
  ],
  debug: true, // Agrega esto para ver los logs en consola
  callbacks: {
    async session({ session, token }) {
      if(session.user) session.user.name = token.name;
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.id = profile?.name;
        token.linkedinData = profile;
      }
      return token;
    },
  },
  secret: process.env.NEXT_PUBLIC_API_NEXTAUTH_SECRET,
});



