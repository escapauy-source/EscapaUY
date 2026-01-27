# EscapaUY - Plataforma de Experiencias Turísticas Personalizadas

## 📋 Descripción General

EscapaUY es una plataforma web que personaliza experiencias turísticas en el Departamento de Colonia, Uruguay, basándose en el perfil de viajero del usuario (ADN Viajero).

## 🎯 Características Principales

### 1. Sistema de Onboarding - ADN Viajero (4 pasos)

#### **Paso 1: Selección de Hotel**
- 11 hoteles disponibles en 5 ciudades del departamento
- Ciudades: Colonia del Sacramento, Carmelo, Juan Lacaze, Rosario, Nueva Helvecia
- Visualización de tarjetas con imágenes, amenidades, precios, ocupancy
- Componente: `HotelSelector.tsx`

#### **Paso 2: Horario de Llegada**
- 3 opciones de tiempo: Mañana, Tarde, Noche
- Icónos descriptivos (Sol, Nube, Luna)
- Optimiza recomendaciones de actividades según disponibilidad

#### **Paso 3: Grupo de Viaje**
- Clasificación: Solo, En Pareja, Familia/Grupo
- Personaliza la experiencia según el tipo de viajero
- Icónos intuitivos para cada opción

#### **Paso 4: Perfil de Personalidad - Big Five (5 dimensiones)**
- **Nueva interfaz**: 3 tarjetas por dimensión (Extremo A, Equilibrio, Extremo C)
- **Escala de valores**: 0 (Extremo A) → 50 (Equilibrio) → 100 (Extremo C)
- **Colores diferenciados**: Cada dimensión tiene su gradiente de color

##### 5 Dimensiones de Personalidad:
1. **Apertura a Experiencias** (Openness)
   - A: Descubridor Nato (0) | B: Curioso Selectivo (50) | C: Clásico Confiable (100)

2. **Ritmo de Viaje** (Conscientiousness)
   - A: Explorador Intenso (0) | B: Balance Perfecto (50) | C: Flow Natural (100)

3. **Socialización** (Extraversion)
   - A: Vida Social (0) | B: Selectivamente Social (50) | C: Explorador Íntimo (100)

4. **Estilo Gastronómico** (Agreeableness)
   - A: Foodie Aventurero (0) | B: Gourmet Balanceado (50) | C: Comfort First (100)

5. **Gestión de Imprevistos** (Neuroticism)
   - A: Aventura Total (0) | B: Flexible con Red (50) | C: Planificador Pro (100)

### 2. Base de Datos de Alojamientos

**11 Hoteles distribuidos en 5 ciudades:**

| Hotel | Ciudad | Precio/Noche | Rating | Habitaciones |
|-------|--------|-------------|--------|--------------|
| Hotel Colonial | Colonia | $15,000 | 4.8 | 40 |
| Posada del Río | Colonia | $10,000 | 4.6 | 35 |
| Posada Plaza Mayor | Colonia | $8,500 | 4.5 | 25 |
| Eco-Lodges del Sauce | Colonia | $9,200 | 4.6 | 12 |
| Los Viñedos de Carmelo | Carmelo | $12,000 | 4.7 | 38 |
| Estancia La Quietud | Carmelo | $8,800 | 4.5 | 16 |
| Complejo Balneario Juan Lacaze | Juan Lacaze | $7,500 | 4.4 | 50 |
| Apartahotel Marina Juan Lacaze | Juan Lacaze | $6,800 | 4.4 | 30 |
| Hotel Balneario Rosario | Rosario | $6,500 | 4.3 | 60 |
| Villa Resort Rosario | Rosario | $7,200 | 4.5 | 35 |
| Posada Suiza Nueva Helvecia | Nueva Helvecia | $5,500 | 4.2 | 24 |

### 3. Base de Datos de Actividades

**32 actividades categoría por tipo:**

#### Categorías:
- **Bodegas**: Cata de vinos, tours por viñedos (4 actividades)
- **Museos**: Museo Indígena, Museo del Azulejo (2 actividades)
- **Restaurantes**: Asados, Fondue Suiza, Almuerzo de Pescado (5 actividades)
- **Paseos**: Recorridos históricos, cicloturismo (4 actividades)
- **Playas/Balnearios**: Playas gratis, clubs de playa (3 actividades)
- **Parques**: Parque Arboretum, observación de aves (2 actividades)
- **Experiencias**: Yoga en playa, klitesurf, taller de chocolate (9 actividades)
- **Eventos**: Fiesta del Chocolate (1 actividad)

#### Filtrado inteligente:
- Por tipo: Interior (resistente a clima) vs Exterior
- Por disponibilidad: Actividades gratuitas
- Por horario: Mañana, Tarde, Noche, Cualquier hora
- Por localidad: Asociadas a cada ciudad

### 4. Gestión de Estado Global (AppContext)

**Estado compartido:**
- `isAuthenticated`: Estado de autenticación del usuario
- `user`: Datos del usuario actual
- `bigFiveScores`: Puntuaciones del perfil de personalidad
- `weather`: Datos climáticos actuales
- `travelGroup`: Tipo de grupo de viaje seleccionado
- `selectedHotel`: Hotel seleccionado
- `arrivalTime`: Hora de llegada elegida
- `showAuthModal`: Control de modal de autenticación
- `isLoading`: Estado de carga

## 🏗️ Arquitectura Técnica

### Stack Tecnológico:
- **React 19.2.3** con TypeScript 5.9.3
- **Vite 7.2.4** para build y desarrollo
- **React Router v7.12.0** para navegación
- **Tailwind CSS 4.1.17** para estilos
- **Framer Motion 12.27.1** para animaciones
- **Lucide React 0.562.0** para iconografía

### Estructura de Carpetas:
```
src/
├── components/          # Componentes reutilizables
│   ├── BigFiveCardSelector.tsx
│   ├── HotelSelector.tsx
│   ├── ActivityCard.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── AuthModal.tsx
│   └── WeatherWidget.tsx
├── pages/              # Páginas principales
│   ├── LandingPage.tsx
│   ├── AdnViajeroPage.tsx
│   ├── ExplorePage.tsx
│   ├── ItineraryPage.tsx
│   ├── CheckoutPage.tsx
│   └── legal/
├── context/            # Estado global
│   └── AppContext.tsx
├── data/               # Datos mock
│   └── mockData.ts
├── types/              # Interfaces TypeScript
│   └── index.ts
└── utils/              # Funciones auxiliares
    └── cn.ts
```

## 🎨 Diseño de Interfaz

### Componente BigFiveCardSelector
- **3 tarjetas por dimensión**: Extremo izquierdo, equilibrio, extremo derecho
- **Animaciones**: Entrada escalonada con Framer Motion
- **Estados visuales**:
  - Tarjeta no seleccionada: Borde gris, fondo blanco
  - Tarjeta seleccionada: Gradiente de color, sombra, escala aumentada
  - Indicador visual: Checkmark con animación
- **Información por tarjeta**: 
  - Emoji orientacional (◀ | ⚖ | ▶)
  - Título de opción
  - Descripción breve
  - Indicador visual de puntuación (5 puntos)

### Colores por Dimensión de Personalidad:
- **Openness**: Púrpura (purple-500 a purple-600)
- **Conscientiousness**: Azul (blue-500 a blue-600)
- **Extraversion**: Naranja (orange-500 a orange-600)
- **Agreeableness**: Verde (green-500 a green-600)
- **Neuroticism**: Rosa/Rojo (rose-500 a rose-600)

## 📱 Rutas Disponibles

| Ruta | Descripción |
|------|------------|
| `/` | Página de inicio |
| `/adn-viajero` | Onboarding del perfil de viajero |
| `/explore` | Explorador de actividades |
| `/actividad/:id` | Detalle de actividad |
| `/itinerario/:id` | Itinerario personalizado |
| `/checkout` | Carrito de compras |
| `/checkout/success` | Confirmación de compra |
| `/profile` | Perfil de usuario |
| `/partner/dashboard` | Dashboard para partners |
| `/legal/privacy` | Política de privacidad |
| `/legal/terms` | Términos y condiciones |
| `/legal/consumer` | Derechos del consumidor |

## 🔄 Flujo de Usuario

1. **Inicio**: El usuario llega a la landing page
2. **Autenticación**: Login/Registro opcional
3. **Onboarding ADN Viajero**:
   - Selecciona hotel
   - Define horario de llegada
   - Especifica tipo de grupo
   - Completa perfil de personalidad (5 dimensiones)
4. **Exploración**: Ve actividades recomendadas personalizadas
5. **Reserva**: Selecciona y reserva experiencias
6. **Checkout**: Completa la compra

## 🚀 Funcionalidades Futuras

- [ ] Generación de itinerarios automáticos basados en perfil
- [ ] Plan B activación automática por cambios climáticos
- [ ] Sistema de pagos integrado
- [ ] Dashboard de partners para gestión de ofertas
- [ ] Recomendaciones basadas en IA
- [ ] Sistema de reseñas y calificaciones
- [ ] Integración con calendarios personales

## 📊 Datos de Actividades Actuales

- **Total de actividades**: 32
- **Actividades gratuitas**: 3
- **Actividades por horario**:
  - Mañana: 12 actividades
  - Tarde: 14 actividades
  - Noche: 3 actividades
  - Cualquier hora: 3 actividades
- **Capacidad promedio**: 35 personas
- **Precio promedio**: $1,500

## ✅ Estado del Proyecto

- ✅ Estructura base completada
- ✅ Sistema de onboarding implementado
- ✅ Base de datos de hoteles y actividades
- ✅ Interfaz de 3 tarjetas para Big Five
- ✅ AppContext para estado global
- ✅ Componentes principales creados
- ⏳ Sistema de recomendaciones (en desarrollo)
- ⏳ Integración de pagos (pendiente)

---

**Última actualización**: Diciembre 2024
**Versión**: 1.0.0-beta
