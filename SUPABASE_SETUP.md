# Supabase Setup Instructions

## ✅ Completado

1. ✅ Instalado `@supabase/supabase-js`
2. ✅ Creado `.env` con credenciales
3. ✅ Cliente Supabase en `src/lib/supabase.ts`
4. ✅ Hooks en `src/hooks/usePartnerData.ts`
5. ✅ Servicios en `src/services/availabilityService.ts`
6. ✅ Upload utility en `src/utils/imageUpload.ts`

## 📋 Próximos Pasos (para ti)

### 1. Ejecutar SQL en Supabase

1. Ve a: https://supabase.com/dashboard/project/bkigsozniabdpbfjenbc/editor/sql
2. Abre el archivo: `supabase-schema.sql` (está en la raíz del proyecto)
3. Copia TODO el contenido
4. Pégalo en el SQL Editor de Supabase
5. Click en "RUN" (esquina inferior derecha)
6. Deberías ver: ✅ Success

### 2. Verificar Tablas Creadas

Ve a: https://supabase.com/dashboard/project/bkigsozniabdpbfjenbc/editor

Deberías ver 3 tablas:
- `partners`
- `partner_services`
- `partner_bookings`

### 3. Verificar Storage Bucket

Ve a: https://supabase.com/dashboard/project/bkigsozniabdpbfjenbc/storage/buckets

Deberías ver el bucket:
- `service-images` (público)

### 4. Partner de Prueba

La tabla `partners` debería tener 1 registro:
- Email: debug@bodega-el-legado.com
- ID: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11

---

## 🔄 Una vez completados estos pasos

Avísame y procederé a:
- Refactorizar PartnerDashboardPage para usar datos reales
- Conectar AvailabilityScheduler con Supabase
- Conectar CatalogManager con upload de imágenes
- Eliminar todos los mocks

---

## ⚠️ Si hay errores al ejecutar el SQL

Pasame el error exacto y lo arreglaremos.
