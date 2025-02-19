import { PrismaClient } from "@prisma/client";
//import bcrypt from 'bcryptjs';


const prisma = new PrismaClient();



class AuthHandler {
    async register(name: string, email: string, password: string) {
        try {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                return { success: false, error: "Email already exists" };
            }
            //const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: password,
                },
                include: {
                    workExperience: true,
                    skills: true,
                    education: true,
                    socialLinks: true,
                    cvPreferences: true,
                }
            });
            return { success: true, user: newUser };
        } catch (error) {
            console.error("Registration failed:", error);
            return { success: false, error: "Registration failed" };
        }
    }

    async login(email: string, password: string) {
        try {
            const user = await prisma.user.findUnique({
                where: { email },
                include: {
                    workExperience: true,
                    skills: true,
                    education: true,
                    socialLinks: true,
                    cvPreferences: true,
                }
            });
            if (!user) {
                return { success: false, error: "Invalid credentials" };
            }
            const passwordMatch = user.password;
            if (!passwordMatch) {
                return { success: false, error: "Invalid credentials" };
            }
            return { success: true, user };
        } catch (error) {
            console.error("Login failed:", error);
            return { success: false, error: "Login failed" };
        }
    }
}

export default AuthHandler;
