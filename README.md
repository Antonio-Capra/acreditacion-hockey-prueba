# Sistema de Acreditación

Sistema de gestión de acreditaciones desarrollado con Next.js y TypeScript.

## 🚀 Tecnologías

- **Frontend & Backend**: [Next.js 15](https://nextjs.org) con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: [Supabase](https://supabase.com) (BaaS - Backend as a Service)
- **Autenticación**: Supabase Auth

## 📦 Base de Datos

Este proyecto utiliza **Supabase** como plataforma BaaS (Backend as a Service), que proporciona:

- **PostgreSQL Database**: Base de datos relacional gestionada
- **Autenticación**: Sistema de autenticación integrado para administradores
- **API RESTful**: Generación automática de APIs
- **Real-time**: Capacidades de actualización en tiempo real
- **Storage**: Almacenamiento de archivos y documentos

### Configuración de Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Copia las credenciales de tu proyecto
3. Renombra `env-example` a `.env.local` y configura:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
```

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp env-example .env.local
# Edita .env.local con tus credenciales de Supabase
```

## 🚀 Getting Started

Ejecuta el servidor de desarrollo:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## 📋 Características

- **Formulario de Acreditación**: Solicitud de acreditaciones para medios de comunicación
- **Panel de Administración**: Gestión y aprobación de solicitudes
- **Selección de Áreas**: Control de acceso por zonas del evento
- **Notificaciones Email**: Envío automático de confirmaciones
- **Autenticación**: Sistema seguro para administradores

## 📚 Estructura del Proyecto

```
├── app/
│   ├── page.tsx              # Página principal con formulario
│   ├── admin/                # Panel de administración
│   └── api/                  # API Routes de Next.js
├── components/
│   ├── AccreditationForm.tsx # Formulario de solicitud
│   ├── AdminDashboard.tsx    # Dashboard administrativo
│   ├── AdminLogin.tsx        # Login de administradores
│   └── AreaSelector.tsx      # Selector de áreas
└── lib/
    └── supabase.ts           # Cliente de Supabase
```

## 🔗 Recursos

### Next.js
- [Documentación de Next.js](https://nextjs.org/docs)
- [Aprende Next.js](https://nextjs.org/learn)
- [Repositorio de Next.js](https://github.com/vercel/next.js)

### Supabase
- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Dashboard de Supabase](https://app.supabase.com)

## 🚀 Deploy on Vercel

La forma más fácil de desplegar tu aplicación Next.js es usar la [Plataforma Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

**Importante**: Asegúrate de configurar las variables de entorno de Supabase en la configuración de tu proyecto en Vercel.

Consulta la [documentación de deployment de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para más detalles.

## 📝 Licencia

Este proyecto está en desarrollo como prueba técnica para sistema de acreditación de eventos deportivos.
