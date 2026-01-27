# Sistema de Filtrado por Proximidad Geográfica

## Descripción General

El sistema de EscapaUY ahora filtra automáticamente las actividades según la ubicación del hotel seleccionado, priorizando experiencias en la misma ciudad y luego en zonas cercanas del Departamento de Colonia.

## Estructura de Proximidad

### Mapa de Cercanías por Ciudad

```
Colonia del Sacramento (Centro)
├── Cercanas: Carmelo, Nueva Helvecia
└── Actividades: 13 (históricas, spa, playas)

Carmelo (Noroeste)
├── Cercanas: Colonia del Sacramento, Juan Lacaze
└── Actividades: 5 (bodegas, tours, estancia)

Juan Lacaze (Oeste - Balneario)
├── Cercanas: Rosario, Artilleros, Carmelo
└── Actividades: 4 (playas, deportes acuáticos)

Rosario (Suroeste - Balneario)
├── Cercanas: Juan Lacaze, Santa Ana, Colonia del Sacramento
└── Actividades: 3 (playa, yoga, granja)

Nueva Helvecia (Norte)
├── Cercanas: Colonia del Sacramento
└── Actividades: 3 (chocolate, eventos, arquitectura suiza)
```

## Flujo de Funcionamiento

### Antes (Sin Filtrado)
```
Usuario selecciona hotel en Juan Lacaze
→ Ver todas las 32 actividades del departamento
→ Resultados incluyen playas de Colonia, bodegas de Carmelo, etc.
❌ Poco eficiente para la experiencia del usuario
```

### Después (Con Filtrado Inteligente)
```
Usuario selecciona hotel en Juan Lacaze
→ Sistema llama a getActivitiesByHotel('h10')
→ Busca ciudad del hotel: 'Juan Lacaze'
→ Obtiene ciudades cercanas: ['Juan Lacaze', 'Rosario', 'Artilleros', 'Carmelo']
→ Ordena actividades:
   1. Primero: Actividades EN Juan Lacaze (4)
   2. Luego: Actividades en Rosario (3)
   3. Luego: Actividades en Carmelo (5)
   4. Finalmente: Resto de departamento (20)
✅ Experiencia optimizada y contextual
```

## Funciones Principales

### `getActivitiesByHotel(hotelId: string): Activity[]`

Retorna todas las actividades ordenadas por proximidad al hotel.

**Parámetros:**
- `hotelId`: ID del hotel seleccionado

**Retorna:**
- Array de actividades ordenadas: mismo_ciudad → cercanas → otras

**Ejemplo:**
```typescript
const hotel = getHotelById('h5'); // Hotel en Juan Lacaze
const activities = getActivitiesByHotel('h5');
// Resultado: [a15, a16, a28, a27, a17, a18, a29, a30, ...]
// Primero playas y deportes de Juan Lacaze, luego Rosario, etc.
```

### `getActivitiesByCity(city: string): Activity[]`

Retorna solo actividades de una ciudad específica.

**Parámetros:**
- `city`: Nombre exacto de la ciudad

**Retorna:**
- Array de actividades solo de esa ciudad

**Ejemplo:**
```typescript
const rosarioActivities = getActivitiesByCity('Rosario');
// Resultado: [a17, a18, a29, a30] - 4 actividades
```

## Mapeo de Ciudades y Actividades

### Distribución Actual

| Ciudad | Hotel(es) | Actividades | Categoría |
|--------|-----------|-------------|----------|
| Colonia del Sacramento | 4 | 13 | Historia, Spa, Playas, Parques |
| Carmelo | 2 | 5 | Bodegas, Vinos, Estancia |
| Juan Lacaze | 2 | 4 | Playas, Deportes Acuáticos |
| Rosario | 2 | 3 | Playas, Gastronomía, Experiencias |
| Nueva Helvecia | 1 | 3 | Chocolate, Arquitectura Suiza |

**Total:** 11 hoteles, 32 actividades

## Casos de Uso

### Caso 1: Usuario en Hotel Colonial (Colonia del Sacramento)

```
Hotel seleccionado: Hotel Colonial (h1)
Ciudad: Colonia del Sacramento

Orden de actividades mostradas:
1. Actividades en Colonia (a1-a12, a21-a23, a26): 13 opciones
2. Actividades en Carmelo (a13, a14, a24, a25): 4 opciones
3. Actividades en Nueva Helvecia (a9, a19, a20): 3 opciones
4. Otras ciudades: 12 opciones
```

### Caso 2: Usuario en Apartahotel Marina Juan Lacaze (h10)

```
Hotel seleccionado: Apartahotel Marina Juan Lacaze (h10)
Ciudad: Juan Lacaze

Orden de actividades mostradas:
1. Actividades en Juan Lacaze (a15, a16, a27, a28): 4 opciones
2. Actividades en Rosario (a17, a18, a29, a30): 4 opciones
3. Actividades en Carmelo (a13, a14, a24, a25): 4 opciones
4. Otras ciudades: 20 opciones
```

### Caso 3: Usuario sin Hotel Seleccionado

```
Hotel seleccionado: Ninguno
Ciudad: N/A

Comportamiento: Muestra todas las 32 actividades sin filtrado especial
```

## Ventajas del Sistema

✅ **Experiencia Personalizada**: Actividades relevantes a la ubicación del hotel

✅ **Reducción de Distracciones**: Menos opciones irrelevantes que confundan

✅ **Coherencia Geográfica**: Viajes cortos entre hotel y actividades

✅ **Descubrimiento Contextual**: Acceso a actividades cercanas sin buscar manualmente

✅ **Escalable**: Fácil agregar más ciudades y ajustar proximidades

## Implementación en UI

### ExplorePage.tsx

```typescript
// Obtener hotel del contexto
const { selectedHotel } = useApp();

// Filtrar actividades por hotel
const baseActivities = selectedHotel 
  ? getActivitiesByHotel(selectedHotel.id) 
  : activities;

// Mostrar información del hotel en la página
{selectedHotel && (
  <div className="p-3 bg-ocean-500/20 rounded-lg border border-ocean-300/30">
    <p className="font-semibold text-white">
      {selectedHotel.name} - {selectedHotel.city}
    </p>
  </div>
)}
```

## Datos Técnicos

**Archivo:** `src/data/mockData.ts`

**Campos por Activity:**
- `id`: Identificador único
- `city`: Ciudad donde se realiza (NUEVA)
- `name`: Nombre de la actividad
- `type`: 'indoor' | 'outdoor'
- `category`: Categoría de experiencia
- `price`: Precio en pesos uruguayos
- `bestTime`: 'morning' | 'afternoon' | 'evening' | 'any'

**Ejemplo de Actividad:**
```typescript
{
  id: 'a15',
  partnerId: 'p1',
  partnerName: 'Playas Juan Lacaze',
  name: 'Playa Juan Lacaze',
  city: 'Juan Lacaze',  // ← Campo nuevo
  type: 'outdoor',
  weatherResilient: false,
  capacity: 200,
  currentOccupancy: 95,
  images: [...],
  description: '...',
  price: 0,
  isFree: true,
  duration: '4h',
  bestTime: 'afternoon',
  category: 'playa',
}
```

## Próximas Mejoras

- [ ] Agregar distancias en kilómetros entre ciudades
- [ ] Integrar tiempo de viaje estimado
- [ ] Reordenar por preferencia del usuario (no solo geografía)
- [ ] Sugerir "Plan B" en ciudades cercanas por clima
- [ ] Mostrar mapa interactivo con proximidad visual

---

**Última actualización:** Enero 2026
**Versión:** 2.0.0 - Filtrado por Proximidad
