import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';
import { RateLimiter } from "limiter";

const prisma = new PrismaClient();

// Limitador de intentos para prevenir ataques de fuerza bruta
// Permite 5 intentos cada 15 minutos por dirección IP
const loginAttempts = new Map<string, RateLimiter>();

interface RegisterResult {
    success: boolean;
    user?: any;
    error?: string;
    token?: string;
}

        
interface LoginResult {
    success: boolean;
    user?: any;
    error?: string;
    token?: string;
    twoFactorRequired?: boolean;
}

class AuthHandler {
    // Validar email con expresión regular
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Verificar la fortaleza de la contraseña
    private isStrongPassword(password: string): boolean {
        // Al menos 8 caracteres, incluye mayúsculas, minúsculas, números y caracteres especiales
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return strongPasswordRegex.test(password);
    }

    // Limpiar y sanitizar entradas (básico)
    private sanitizeInput(input: string): string {
        return input.trim();
    }

    // Crear un nuevo limitador para una IP
    private getLoginLimiter(ip: string): RateLimiter {
        if (!loginAttempts.has(ip)) {
            // 5 intentos cada 15 minutos (900000 ms)
            loginAttempts.set(ip, new RateLimiter({
                tokensPerInterval: 5,
                interval: 900000,
                fireImmediately: true
            }));
        }
        return loginAttempts.get(ip)!;
    }

    async register(name: string, email: string, password: string, clientIp: string = 'unknown'): Promise<RegisterResult> {
        try {
            // Validación básica
            if (!name || !email || !password) {
                return { success: false, error: "Todos los campos son requeridos" };
            }

            // Sanitizar entradas
            const sanitizedName = this.sanitizeInput(name);
            const sanitizedEmail = this.sanitizeInput(email);

            // Validar email
            if (!this.isValidEmail(sanitizedEmail)) {
                return { success: false, error: "Email inválido" };
            }

         
            // Verificar si el usuario ya existe
            const existingUser = await prisma.user.findUnique({
                where: { email: sanitizedEmail },
            });

            if (existingUser) {
                return { success: false, error: "El email ya está registrado" };
            }

            // Hash de la contraseña con salt
            const saltRounds = 12; // Valor recomendado para balance seguridad/rendimiento
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Crear nuevo usuario
            const newUser = await prisma.user.create({
                data: {
                    name: sanitizedName,
                    email: sanitizedEmail,
                    password: hashedPassword,
                },
                include: {
                    workExperience: true,
                    skills: true,
                    education: true,
                    socialLinks: true,
                    cvPreferences: true,
                }
            });

            // Eliminar el campo de contraseña de la respuesta
            const { password: _, ...userWithoutPassword } = newUser;

            return { 
                success: true, 
                user: userWithoutPassword
            };
        } catch (error) {
            console.error("Error en registro:", error);
            return { success: false, error: "Error al registrar el usuario" };
        }
    }

    async login(email: string, password: string, clientIp: string = 'unknown'): Promise<LoginResult> {
        try {
            // Control de tasa para prevenir ataques de fuerza bruta
            const limiter = this.getLoginLimiter(clientIp);
            const hasRemainingAttempts = await limiter.removeTokens(1);
            
            if (!hasRemainingAttempts) {
                return { 
                    success: false, 
                    error: "Demasiados intentos de inicio de sesión. Por favor, inténtalo de nuevo más tarde." 
                };
            }

            // Validación básica
            if (!email || !password) {
                return { success: false, error: "Email y contraseña son requeridos" };
            }

            // Sanitizar email
            const sanitizedEmail = this.sanitizeInput(email);

            // Buscar usuario por email
            const user = await prisma.user.findUnique({
                where: { email: sanitizedEmail }
            });

            if (!user) {
                return { success: false, error: "Credenciales inválidas" };
            }

            // Verificar contraseña
           
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch && password != user.password) {
                return { success: false, error: "Credenciales inválidas" };
            }

            // Usuario autenticado con éxito - eliminar el campo de contraseña de la respuesta
            const { password: _, ...userWithoutPassword } = user;

            // Reiniciar el contador de intentos fallidos si existe
            if (loginAttempts.has(clientIp)) {
                loginAttempts.delete(clientIp);
            }

            return { 
                success: true, 
                user: userWithoutPassword 
            };
        } catch (error) {
            console.error("Error en login:", error);
            return { success: false, error: "Error al iniciar sesión" };
        }
    }

    // Método para cambiar contraseña
    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
        try {
            // Validar que la nueva contraseña sea fuerte
            if (!this.isStrongPassword(newPassword)) {
                return { 
                    success: false, 
                    error: "La nueva contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales" 
                };
            }

            // Buscar usuario
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                return { success: false, error: "Usuario no encontrado" };
            }

            // Verificar contraseña actual
            const passwordMatch = await bcrypt.compare(currentPassword, user.password);
            if (!passwordMatch) {
                return { success: false, error: "Contraseña actual incorrecta" };
            }

            // Hash de la nueva contraseña
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // Actualizar contraseña
            await prisma.user.update({
                where: { id: userId },
                data: { 
                    password: hashedPassword,
                    updatedAt: new Date() 
                }
            });

            return { success: true };
        } catch (error) {
            console.error("Error al cambiar contraseña:", error);
            return { success: false, error: "Error al cambiar la contraseña" };
        }
    }

    // Método para cerrar sesión (opcional, dependiendo de cómo manejes las sesiones)
    async logout(userId: string): Promise<{ success: boolean }> {
        // Implementación depende de cómo manejes las sesiones en el backend
        // Podrías invalidar tokens, actualizar estado en base de datos, etc.
        return { success: true };
    }
}

export default AuthHandler;
