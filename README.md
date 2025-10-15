# EnterClient — Gestión integral de empresas

Aplicación web construida con **React**, **TypeScript** y **Vite** que centraliza la gestión del ciclo de vida de empresas cliente. La plataforma está pensada para equipos **Comercial**, **Onboarding** y **SAC**, que colaboran sobre una misma ficha y comparten flujos estructurados. **Supabase** provee autenticación, base de datos (Postgres + RLS) y almacenamiento de archivos.

---

## Tabla de contenidos
- [Características principales](#características-principales)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Configuración inicial](#configuración-inicial)
- [Scripts disponibles](#scripts-disponibles)
- [Flujo funcional](#flujo-funcional)
- [Estilos y design system](#estilos-y-design-system)
- [Integración con Supabase](#integración-con-supabase)
- [Despliegue recomendado](#despliegue-recomendado)
- [Buenas prácticas](#buenas-prácticas)
- [Roadmap](#roadmap)

---

## Características principales

- 🔐 **Auth & Access Control (Supabase Auth)** con sesión persistente y permisos por rol: `COM`, `OB`, `ADMIN_OB`, `SAC`, `ADMIN_SAC`.
- 🧭 **Dashboard dinámico** con vistas/acciones por rol, búsqueda avanzada y paginación.
- 🧩 **Ficha 360° de empresa**: datos comerciales, representantes, contrapartes técnicas/administrativas, sucursales, servicios y documentación tributaria.
- 📝 **Flujo multistep** (FormStepper reutilizable) con persistencia de estado entre pasos.
- 🕒 **Historial y exportaciones** desde la ficha de empresa.
- 🧰 **Librerías modernas**: React Hook Form, Zod, Bootstrap 5, Lucide Icons.
- ☁️ **Storage** en Supabase para archivos adjuntos y **RLS** para seguridad a nivel de fila.

---

## Stack tecnológico

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) (dev server + build)
- [React Router](https://reactrouter.com/)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- [Supabase](https://supabase.com/) (Auth, Postgres, Storage, opcional Edge Functions)
- [Bootstrap 5](https://getbootstrap.com/) con overrides en `src/styles`

---

## Estructura del proyecto

```txt
src/
├─ components/          # Componentes compartidos (grid, formularios, modales, secciones)
├─ contexts/            # Contextos globales (Auth, formularios multistep)
├─ hooks/               # Hooks personalizados (auth, búsqueda, detalle de empresa)
├─ layouts/             # Layout principal con Sidebar y cabeceras
├─ lib/                 # Clientes externos (Supabase) y utilidades
├─ pages/               # Vistas: Dashboard, Login, EmpresaDetail, flujos por área
├─ styles/              # Estilos globales, overrides de Bootstrap y variables
└─ types/               # Tipos compartidos (empresa, formularios, respuestas)
````

> Si usas Edge Functions de Supabase:
>
> ```
> supabase/
> └─ functions/
>    └─ empresas/
>       ├─ index.ts      # handler Deno
>       └─ deno.json     # tareas locales
> ```

---

## Requisitos previos

1. **Node.js ≥ 18**
2. Proyecto en **Supabase** con tablas y policies necesarias.
3. **Keys** de Supabase (URL + **anon key**) permitidas para tu dominio/localhost.

---

## Configuración inicial

1. **Instalar dependencias**

```bash
npm install
```

2. **Variables de entorno**
   Crea `.env` en la raíz:


3. **Levantar en desarrollo**

```bash
npm run dev
```

Disponible en `http://localhost:5173/`.

---

## Scripts disponibles

| Comando           | Descripción                                                |
| ----------------- | ---------------------------------------------------------- |
| `npm run dev`     | Dev server (Vite) con HMR.                                 |
| `npm run build`   | Build de producción (`tsc` + `vite build`).                |
| `npm run preview` | Sirve localmente la carpeta `dist` para revisión final.    |
| `npm run lint`    | ESLint sobre `.ts`/`.tsx` (ajustar reglas según proyecto). |

---

## Flujo funcional

1. **Inicio de sesión**: Supabase Auth maneja la sesión (persistente). `AuthProvider` trae el perfil y permisos.
2. **Dashboard por rol**: widgets y acciones en base al rol (crear empresa, continuar onboarding, etc.).
3. **Búsqueda y paginación**: `EmpresaGrid` + `useEmpresaSearch` para filtrar por nombre, RUT u otros criterios.
4. **Detalle 360°**: `useEmpresaDetail` orquesta consultas a Supabase (categorías tributarias, representantes, contrapartes, servicios).
5. **Flujos por área**: formularios especializados para Onboarding y SAC, compartiendo estado y validaciones.

---

## Estilos y design system

**Fuentes & jerarquía** (coherente con los SCSS/CSS del proyecto):

* **Nombre del sitio**: *Satisfy* `2.5rem+`, normal
* **Heading principal**: *Manrope* `2rem`, `600–700`
* **Subtítulos**: *Manrope* `1.25rem`, `600`
* **Texto normal**: *Nunito* `1rem`, `400`
* **Labels/Botones**: *Manrope* `0.875rem`, `500–600`
* **Notas secundarias**: *Nunito* `0.875rem`, `400`

**Paleta base**

* Fondo: `#FFFFFF`
* Acento principal: `#A986FF`
* Acento secundario: `#73AEFF`
* Texto principal: `#1A1A1A`
* Texto secundario: `#6B6B6B`
* Bordes: `#EAEAEA` / `#F2F2F2`
* Hover/energía: `linear-gradient(135deg, #A986FF, #73AEFF)`

**Orden recomendado de imports** (para que tus overrides manden):

1. `variables.scss`
2. `custom-properties.scss`
3. `bootstrap-custom.scss` *(importa Bootstrap con overrides)*
4. `components.scss`
5. `main.css` *(último, más específico)*

---

## Integración con Supabase

**Cliente en el front** (Auth/Storage desde el navegador):

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
  { auth: { persistSession: true, autoRefreshToken: true } }
);
```

---

## Despliegue recomendado

**Frontend → Vercel** (estático)
**Backend (opcional) → Supabase Edge Functions**
**Auth/DB/Storage → Supabase**

### Vercel (React Router SPA)

Crea `vercel.json` en la raíz del front:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

**Checklist de despliegue**

* [ ] Build OK (`npm run build`)
* [ ] Rewrites SPA activos (no 404 en rutas profundas)
* [ ] Envs cargadas en Vercel
* [ ] (Opcional) Rewrites `/api/*` → Edge Functions

---

## Buenas prácticas

* **TypeScript full**: contratos estrictos con respuestas de Supabase.
* **RLS**: policies explícitas por rol si el front lee directamente.
* **Contextos aislados**: `AuthContext`, `FormContext` + hooks (`useAuth`, etc.).
* **Componentes por dominio**: formularios, detalle, grids → reutilizables.
* **Accesibilidad**: labels asociadas, focus states por CSS, roles ARIA.
* **Caché prudente**:

  * HTML sin cache agresivo; assets con hash (Vite) 👍
  * APIs con `Cache-Control: no-store` si necesitas siempre fresco.

---

## Roadmap

* ✅ Persistencia real del flujo “Nueva Empresa” paso a paso
* 🧪 Tests unitarios de componentes críticos y hooks
* 📊 Métricas (funnels de Onboarding) y dashboards analíticos
* 🧱 Módulo de permisos granular por acción
* 📨 Notificaciones/alertas por evento de estado (OB/SAC)

---

> ¿Contribuciones? Bienvenidas. Documenta nuevas decisiones de arquitectura aquí a medida que el proyecto evolucione.

```
