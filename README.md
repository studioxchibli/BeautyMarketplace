# Monterrey Beauty Marketplace

Aplicación Next.js 14 (App Router) con Prisma/PostgreSQL para conectar clientes con estilistas en Monterrey. Incluye modo V0 (concierge) y V1 (pagos + reseñas) controlados por banderas de entorno.

## Configuración
1. Instala dependencias:
```bash
pnpm install
```
2. Copia `.env.example` a `.env` y completa valores. Ajusta `ENABLE_PAYMENTS` y `ENABLE_REVIEWS` según la fase.
3. Ejecuta migraciones y seed:
```bash
pnpm prisma migrate dev
pnpm prisma db seed
```
4. Inicia en desarrollo:
```bash
pnpm dev
```

### Stripe y pagos
- Usa claves de prueba de Stripe y configura `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.
- Los pagos se crean vía Checkout con tarjeta u OXXO. Conecta cuentas de estilista usando `PayoutAccount` (seed crea cuentas demo).

### Auth
- NextAuth con Google OAuth y credenciales.
- Rutas protegidas en `/dashboard` y `/admin` usando middleware.

### Seeds
- 10 estilistas con servicios, disponibilidad y portafolio.
- 20 clientes, solicitudes concierge y (si `ENABLE_PAYMENTS=true`) bookings, pagos y reseñas de ejemplo.

### Feature flags
- `ENABLE_PAYMENTS=false`: solo solicitudes concierge.
- `ENABLE_PAYMENTS=true`: habilita reservas y pagos Stripe.
- `ENABLE_REVIEWS=true`: habilita reseñas verificadas.

## Scripts
- `pnpm dev` - servidor de desarrollo
- `pnpm build` - build producción
- `pnpm prisma migrate dev` - aplicar migraciones
- `pnpm prisma db seed` - ejecutar semillas

## Notas de resolución de problemas
- El proyecto requiere acceso al registro público de npm. Si ves errores `403 Forbidden` al instalar dependencias, revisa proxies corporativos o variables `http-proxy/https-proxy` y asegúrate de que el registro sea `https://registry.npmjs.org/`.
