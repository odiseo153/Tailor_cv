## 📄 **TailorCV** - Generador de CVs Inteligente con IA  

**TailorCV** es una aplicación que utiliza inteligencia artificial para generar **currículums adaptados automáticamente** a cada oferta laboral, optimizando el proceso de postulación.  

![TailorCV Home](images/home.png)

### 🚀 **¿Cómo funciona?**  
1️⃣ **Sube una oferta de trabajo** (texto o PDF).  
2️⃣ La IA **extrae la información clave** y la adapta al CV.  
3️⃣ Se genera un **CV optimizado en segundos** en formato PDF.  
4️⃣ El usuario proximamente podra **subir su propia plantilla** para mantener su estilo personal.  

![TailorCV Home](images/cv_vista.png)

### 🎯 **Objetivo**  
💡 **Ahorrar tiempo y esfuerzo** en la personalización de CVs, eliminando la necesidad de copiar y pegar información manualmente en cada postulación.  

### 🛠️ **Estado del Proyecto**  
Actualmente, **TailorCV** está en fase de desarrollo como un **side project**, y se está recopilando feedback para mejorarlo antes del lanzamiento.  


### 🔧 **Tecnologías Utilizadas**  
- 🧠 **Inteligencia Artificial** para analizar y adaptar CVs,se esta utilizando deepseek y geminis.  
- 🌐 **Next.js / React** para la interfaz de usuario.  
- 📄 **PDF.js** para manejar archivos PDF.  
- ☁️ **Node.js + Express** para el backend.  


### 📌 **Próximas Funcionalidades**  
✅ Mejoras en el análisis semántico de ofertas.  
✅ Mejoras a la hora de descargar pdf.  
✅ Soporte para subir tus propias plantillas y que genere en base a esas plantillas.  
✅ Integración con plataformas de empleo.  

📢 **¡Tu feedback es importante!** Si tienes ideas o sugerencias, no dudes en compartirlas.  

## Suscripciones con Stripe

La aplicación incluye un sistema completo de suscripciones utilizando Stripe como plataforma de pagos. Características principales:

### Características

- Gestión de planes de suscripción (Básico, Profesional, Premium)
- Checkout seguro con Stripe Checkout
- Webhooks para procesar eventos de Stripe (renovaciones, cancelaciones, fallos de pago)
- Panel de gestión de suscripción para usuarios
- Almacenamiento y gestión de métodos de pago

### Configuración

1. Crea una cuenta en [Stripe](https://stripe.com) si aún no tienes una
2. Obtén tus claves API desde el [Dashboard de Stripe](https://dashboard.stripe.com/apikeys)
3. Configura las variables de entorno en tu archivo `.env`:

```
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica
STRIPE_WEBHOOK_SECRET=whsec_tu_secreto_de_webhook
```

4. Para establecer el Webhook de Stripe (desarrollo local):
   - Instala la CLI de Stripe: `npm install -g stripe-cli`
   - Ejecuta `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   - Copia el webhook signing secret proporcionado

5. Ejecuta la migración para actualizar el esquema de base de datos:
   ```
   npx prisma migrate dev --name add-stripe-subscriptions
   ```

6. Siembra los planes de suscripción:
   ```
   npx ts-node prisma/seed-subscriptions.ts
   ```

### Flujo de suscripción

1. El usuario navega a la página de planes (`/pricing`)
2. Selecciona un plan y se redirige a Stripe Checkout
3. Después del pago exitoso, se redirige a una página de éxito
4. Stripe envía eventos a través del webhook para actualizar la base de datos

### Gestión de suscripciones

Los usuarios pueden gestionar sus suscripciones desde el panel de facturación (`/profile/billing`):

- Ver detalles de la suscripción actual
- Cancelar suscripción (efectiva al final del período)
- Reactivar una suscripción cancelada
- Gestionar métodos de pago

