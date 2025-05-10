# Sistema de Autenticación

Este sistema de autenticación utiliza NextAuth.js para proporcionar un flujo seguro, robusto y fácil de usar.

## Características

- ✅ Autenticación con credenciales (email/contraseña)
- ✅ Inicio de sesión con proveedores sociales (Google, LinkedIn)
- ✅ Validación robusta de credenciales
- ✅ Hashing seguro de contraseñas con bcrypt
- ✅ Protección contra ataques de fuerza bruta (rate limiting)
- ✅ Protección CSRF
- ✅ Sesiones seguras basadas en JWT
- ✅ Control de acceso por rutas a través de middleware
- ✅ Encabezados de seguridad HTTP
- ✅ Recuperación de contraseña
- ✅ Interfaz de usuario amigable

## Flujo de autenticación

1. El usuario intenta acceder a una ruta protegida
2. El middleware verifica si existe un token de sesión válido
3. Si no hay token, redirecciona al usuario a la página de login
4. El usuario ingresa sus credenciales o usa un proveedor social
5. Las credenciales se validan contra la base de datos
6. Si son válidas, se crea un token JWT seguro
7. El usuario es redirigido a la ruta original a la que intentaba acceder

## Estructura de archivos

```
src/app/auth/
├── login/             # Página de inicio de sesión
├── register/          # Página de registro
├── forgot-password/   # Recuperación de contraseña
├── error/             # Página de error de autenticación
├── logout/            # Cierre de sesión
└── README.md          # Esta documentación

src/app/api/auth/
├── [...nextauth]/     # Configuración de NextAuth.js
└── register/          # Endpoint para registro de usuarios

src/app/Handler/
└── AuthHandler.ts     # Lógica de autenticación y seguridad

src/middleware.ts      # Middleware para protección de rutas
```

## Seguridad

### Contraseñas

- Las contraseñas se almacenan utilizando bcrypt con un factor de costo de 12
- Las contraseñas deben cumplir con requisitos mínimos de seguridad:
  - Mínimo 8 caracteres
  - Al menos una letra mayúscula
  - Al menos una letra minúscula
  - Al menos un número
  - Al menos un carácter especial

### Protección contra fuerza bruta

El sistema implementa rate limiting basado en IP:
- Máximo 5 intentos fallidos en 15 minutos
- Al exceder el límite, el usuario debe esperar el tiempo de bloqueo
- Los intentos fallidos se rastrean por dirección IP

### Encabezados de seguridad

- Content-Security-Policy - Previene XSS
- X-Content-Type-Options - Previene MIME sniffing
- X-Frame-Options - Previene clickjacking
- X-XSS-Protection - Capa adicional contra XSS
- Referrer-Policy - Control de información enviada a otros sitios

## Variables de entorno requeridas

```
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secreto_aqui_minimo_32_caracteres

# Proveedores OAuth
GOOGLE_CLIENT_ID=id_cliente_google
GOOGLE_CLIENT_SECRET=secreto_google
LINKEDIN_CLIENT_ID=id_cliente_linkedin
LINKEDIN_CLIENT_SECRET=secreto_linkedin

# Rate Limiting (opcional - valores por defecto)
MAX_LOGIN_ATTEMPTS=5
LOGIN_BLOCK_DURATION=15
```

## Personalización

Para personalizar el comportamiento del sistema de autenticación:

1. Modifica `src/app/api/auth/[...nextauth]/route.ts` para ajustar configuraciones
2. Actualiza `src/app/Handler/AuthHandler.ts` para cambiar la lógica de autenticación
3. Edita las páginas en `src/app/auth/` para cambiar la interfaz de usuario
4. Ajusta `src/middleware.ts` para modificar la protección de rutas 