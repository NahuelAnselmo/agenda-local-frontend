# Agenda Local — Frontend

Aplicación responsive de reservas y gestión para comercios de servicios. La
demo usa la marca ficticia **Norte Studio** y consume una API independiente.

## Funcionalidades

- Reserva pública por servicio, profesional, fecha y horario disponible.
- Comprobante con enlace de cancelación y envío de datos por WhatsApp.
- Panel protegido con métricas, agenda y estados de los turnos.
- Búsqueda por cliente y filtros por profesional y estado.
- Reprogramación de turnos con validación en el backend.
- Gestión de servicios, profesionales, horarios y perfil público del negocio.

## Stack

- Next.js 16 con App Router
- React 19
- TypeScript estricto
- Tailwind CSS 4 y estilos responsive propios

## Desarrollo local

1. Ejecutar `npm install`.
2. Copiar `.env.example` como `.env.local` si se necesita cambiar la API.
3. Iniciar el backend en `http://localhost:4000`.
4. Ejecutar `npm run dev`.
5. Abrir [http://localhost:3000](http://localhost:3000).

La variable `NEXT_PUBLIC_API_URL` define la URL pública de la API. Para el
renderizado del servidor también puede configurarse `API_URL`.

## Acceso de demostración

El panel está disponible en `/admin`.

- Email: `admin@nortestudio.demo`
- Contraseña: `Demo1234!`

## Accesos del equipo

El propietario crea el acceso de cada profesional desde **Equipo → Crear
acceso**, definiendo un email y una contraseña temporal. El profesional ingresa
en el mismo `/admin`, ve únicamente su agenda y puede cambiar sus credenciales
desde **Mi cuenta**.

Dar de baja a una persona revoca su acceso y la oculta de las reservas, pero
conserva sus turnos anteriores. El registro puede restaurarse si se reincorpora.

## Verificación

- `npm run lint`
- `npm run build`

Los datos de respaldo viven en `src/data/demo-business.ts`. Cuando la API está
disponible, el sitio usa la información editable del negocio.
