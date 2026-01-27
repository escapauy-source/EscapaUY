# 🚀 Ejecutar SQL en Supabase - INSTRUCCIONES

## ✅ SQL Schema Listo

El archivo `supabase-schema.sql` está completo e incluye:

### Tablas Creadas:
1. **`profiles`** - Usuarios autenticados (con trigger automático)
2. **`partners`** - Partners/proveedores
3. **`partner_services`** - Servicios/catálogo
4. **`partner_bookings`** - Reservas

### Seguridad:
- ✅ Row Level Security (RLS) habilitado
- ✅ Policies de acceso configuradas
- ✅ Storage bucket `service-images`

### Anti-Duplicados:
- ✅ `ON CONFLICT (id) DO NOTHING` en trigger de profiles
- ✅ `ON CONFLICT (email) DO NOTHING` en seed data
- ✅ UPSERT logic para todo

---

## 📋 PASOS PARA EJECUTAR

### 1. Abrir SQL Editor
Ve a: https://supabase.com/dashboard/project/bkigsozniabdpbfjenbc/editor/sql

### 2. Copiar SQL
Abre el archivo `supabase-schema.sql` desde la raíz del proyecto

### 3. Pegar y Ejecutar
1. Selecciona **TODO** el contenido (Ctrl+A)
2. Copia (Ctrl+C)
3. Pégalo en el SQL Editor de Supabase
4. Click en botón verde **"RUN"** (esquina inferior derecha)

### 4. Verificar Éxito
Deberías ver:
```
✅ Success. No rows returned
```

---

## 🔍 VERIFICACIÓN POST-EJECUCIÓN

### A. Verifica Tablas
https://supabase.com/dashboard/project/bkigsozniabdpbfjenbc/editor

Deberías ver 4 tablas:
- ✅ `profiles`
- ✅ `partners`
- ✅ `partner_services`
- ✅ `partner_bookings`

### B. Verifica Storage
https://supabase.com/dashboard/project/bkigsozniabdpbfjenbc/storage/buckets

Deberías ver:
- ✅ Bucket `service-images` (público)

### C. Verifica Seed Data
Click en tabla `partners` → deberías ver 1 fila:
- Email: `debug@bodega-el-legado.com`
- Name: `Bodega El Legado`

---

## ⚠️ SI HAY ERRORES

### Error: "relation already exists"
**Solución**: Las tablas ya existen. Está bien, continúa.

### Error: "duplicate key value"
**Solución**: Ignora, el UPSERT evita esto automáticamente.

### Error: "permission denied"
**Solución**: Asegúrate de estar logueado en Supabase con la cuenta correcta.

---

## ✅ UNA VEZ COMPLETADO

Avísame y procederé a:
1. Refactorizar `PartnerDashboardPage` con datos reales
2. Conectar `AvailabilityScheduler` a Supabase
3. Conectar `CatalogManager` con upload de imágenes
4. **Eliminar TODOS los mocks**
5. Reiniciar el dev server para que tome las variables de entorno

---

## 🆘 Necesitas Ayuda?

Si hay algún error que no entiendes, copia el mensaje completo y pégamelo.
