import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, CloudRain, Wine, UtensilsCrossed, MapPin,
  CheckSquare, Square, ArrowRight, ExternalLink, Info,
  Shield, AlertTriangle, Star, Coffee, Bed, Car,
  MessageCircle, Send, X, Sparkles, Bike, Camera, Check, Plus, Trash2
} from 'lucide-react';

const N = '#1A1F2C'; const G = '#C5A059'; const C = '#F8F7F4';
type PlanMode = 'A' | 'B';

interface TEvent {
  time: string; title: string; subtitle: string;
  Icon: React.FC<{ size?: number; style?: React.CSSProperties }>;
  iconColor: string; iconBg: string; tag: string; tagColor: string;
  planBOnly?: boolean;
}

// ── DÍA 1 según horario ───────────────────────────────────────────────────────
const D1_AM_A: TEvent[] = [
  { time:'09:30', title:'Llegada a Carmelo', subtitle:'Terminal o transfer desde Colonia. Recepción en Bodega El Legado con copa de bienvenida.', Icon:MapPin, iconColor:G, iconBg:'rgba(197,160,89,0.15)', tag:'Traslado', tagColor:G },
  { time:'10:15', title:'Caminata guiada entre los viñedos', subtitle:'Recorrido a pie por parcelas de Tannat y Merlot. El sommelier explica el terruño mientras caminan.', Icon:Sun, iconColor:'#f59e0b', iconBg:'rgba(245,158,11,0.12)', tag:'Aire libre · 90 min', tagColor:'#f59e0b' },
  { time:'12:00', title:'Almuerzo en terraza del viñedo', subtitle:'Menú degustación 3 tiempos. Entrada de campo, plato principal con corte local, postre artesanal. Maridaje incluido.', Icon:UtensilsCrossed, iconColor:G, iconBg:'rgba(197,160,89,0.12)', tag:'Gastronómico · 2 h', tagColor:G },
  { time:'14:30', title:'Cata guiada de 4 etiquetas', subtitle:'Con sommelier de Bodega El Legado. Varietal reserva, blend de autor y cosecha tardía.', Icon:Wine, iconColor:'#a78bfa', iconBg:'rgba(167,139,250,0.12)', tag:'Premium · 75 min', tagColor:'#a78bfa' },
  { time:'16:30', title:'Tiempo libre en el pueblo', subtitle:'Puerto de Carmelo, artesanías y etiquetas locales. O simplemente el río al atardecer.', Icon:MapPin, iconColor:'#34d399', iconBg:'rgba(52,211,153,0.1)', tag:'Libre', tagColor:'#34d399' },
];
const D1_PM_A: TEvent[] = [
  { time:'15:00', title:'Llegada a Carmelo', subtitle:'Recepción express. Copa de bienvenida en la terraza de la bodega.', Icon:MapPin, iconColor:G, iconBg:'rgba(197,160,89,0.15)', tag:'Traslado', tagColor:G },
  { time:'15:45', title:'Cata guiada de 4 etiquetas', subtitle:'Directo a la experiencia principal: varietal reserva, blend de autor y cosecha tardía con sommelier.', Icon:Wine, iconColor:'#a78bfa', iconBg:'rgba(167,139,250,0.12)', tag:'Premium · 75 min', tagColor:'#a78bfa' },
  { time:'17:30', title:'Paseo por el puerto de Carmelo', subtitle:'Tiempo libre para explorar el pueblo antes de la cena.', Icon:MapPin, iconColor:'#34d399', iconBg:'rgba(52,211,153,0.1)', tag:'Libre · 1 h', tagColor:'#34d399' },
  { time:'19:00', title:'Cena en terraza con atardecer', subtitle:'Menú de temporada con vinos de la bodega. El cielo sobre el Río Uruguay al anochecer.', Icon:UtensilsCrossed, iconColor:G, iconBg:'rgba(197,160,89,0.12)', tag:'Gastronómico · 2 h', tagColor:G },
];
const D1_N_A: TEvent[] = [
  { time:'20:00', title:'Llegada y check-in', subtitle:'Recepción nocturna. Copa de Tannat de bienvenida en la bodega.', Icon:MapPin, iconColor:G, iconBg:'rgba(197,160,89,0.15)', tag:'Check-in', tagColor:G },
  { time:'21:00', title:'Cena en restaurante del alojamiento', subtitle:'Cocina de campo con productos locales. Recomendamos reservar antes de llegar.', Icon:UtensilsCrossed, iconColor:G, iconBg:'rgba(197,160,89,0.12)', tag:'Gastronómico · Opcional', tagColor:G },
];
const D1_AM_B: TEvent[] = [
  { time:'09:30', title:'Llegada a Carmelo', subtitle:'Recepción bajo cubierta en Bodega El Legado. Copa de bienvenida junto al fuego.', Icon:MapPin, iconColor:G, iconBg:'rgba(197,160,89,0.15)', tag:'Traslado', tagColor:G },
  { time:'10:15', title:'Taller de maridaje en cava subterránea', subtitle:'Cava de piedra a 14°C constantes. Sommelier privado. La lluvia afuera es completamente irrelevante aquí.', Icon:Wine, iconColor:'#60a5fa', iconBg:'rgba(96,165,250,0.12)', tag:'Plan B · Techado · 90 min', tagColor:'#60a5fa', planBOnly:true },
  { time:'12:00', title:'Almuerzo en salón privado con chimenea', subtitle:'Mismo menú de 3 tiempos en el salón principal. Fuego encendido y música en vivo.', Icon:UtensilsCrossed, iconColor:G, iconBg:'rgba(197,160,89,0.12)', tag:'Gastronómico · 2 h', tagColor:G },
  { time:'14:30', title:'Cata guiada de 4 etiquetas', subtitle:'Varietal reserva, blend de autor y cosecha tardía. La cava es el plan B perfecto.', Icon:Wine, iconColor:'#a78bfa', iconBg:'rgba(167,139,250,0.12)', tag:'Premium · 75 min', tagColor:'#a78bfa' },
  { time:'16:30', title:'Tienda y galería cubierta de la bodega', subtitle:'Etiquetas, aceites, conservas y cerámica artesanal. La lluvia es ideal para explorar adentro.', Icon:Star, iconColor:'#34d399', iconBg:'rgba(52,211,153,0.1)', tag:'Libre · Techado', tagColor:'#34d399', planBOnly:true },
];
const D1_PM_B: TEvent[] = [
  { time:'15:00', title:'Llegada a Carmelo', subtitle:'Recepción bajo cubierta. Copa de bienvenida junto a la chimenea.', Icon:MapPin, iconColor:G, iconBg:'rgba(197,160,89,0.15)', tag:'Traslado', tagColor:G },
  { time:'15:45', title:'Cata en cava subterránea', subtitle:'100% techado: lluvia afuera, Tannat adentro. Sommelier privado.', Icon:Wine, iconColor:'#60a5fa', iconBg:'rgba(96,165,250,0.12)', tag:'Plan B · Techado', tagColor:'#60a5fa', planBOnly:true },
  { time:'17:30', title:'Tienda y galería cubierta', subtitle:'Tiempo libre para recorrer la tienda antes de la cena.', Icon:Star, iconColor:'#34d399', iconBg:'rgba(52,211,153,0.1)', tag:'Libre · Techado', tagColor:'#34d399' },
  { time:'19:00', title:'Cena con maridaje junto al fuego', subtitle:'Menú de temporada, chimenea encendida y selección del sommelier.', Icon:UtensilsCrossed, iconColor:G, iconBg:'rgba(197,160,89,0.12)', tag:'Gastronómico · 2 h', tagColor:G },
];
const D1_N_B: TEvent[] = [
  { time:'20:00', title:'Llegada y check-in', subtitle:'Copa de Tannat de bienvenida en el salón con chimenea.', Icon:MapPin, iconColor:G, iconBg:'rgba(197,160,89,0.15)', tag:'Check-in', tagColor:G },
  { time:'21:00', title:'Cena bajo el techo de la bodega', subtitle:'Lluvia de fondo, fuego adentro. Menú de campo con vinos de la casa.', Icon:UtensilsCrossed, iconColor:G, iconBg:'rgba(197,160,89,0.12)', tag:'Plan B · Gastronómico', tagColor:G },
];
const D2_A: TEvent[] = [
  { time:'08:30', title:'Desayuno de campo', subtitle:'Quesos artesanales, dulce de leche, pan recién horneado y mermeladas locales.', Icon:Coffee, iconColor:'#f59e0b', iconBg:'rgba(245,158,11,0.12)', tag:'Desayuno incluido', tagColor:'#f59e0b' },
  { time:'10:00', title:'Visita a granja quesera en Nueva Helvecia', subtitle:'Historia de los colonos suizos y valdenses. Degustación de quesos de autor. A 30 min de Carmelo.', Icon:MapPin, iconColor:'#34d399', iconBg:'rgba(52,211,153,0.1)', tag:'Cultural · 2 h', tagColor:'#34d399' },
  { time:'12:30', title:'Almuerzo en parador rural', subtitle:'Vista al campo abierto. Especialidad: cordero y chivito del campo con vino de la región.', Icon:UtensilsCrossed, iconColor:G, iconBg:'rgba(197,160,89,0.12)', tag:'Gastronómico · 1.5 h', tagColor:G },
  { time:'14:30', title:'Recorrido patrimonial en Conchillas', subtitle:'El pueblo victoriano más intacto del Uruguay. Arquitectura inglesa del siglo XIX, calles de piedra.', Icon:Camera, iconColor:'#818cf8', iconBg:'rgba(129,140,248,0.12)', tag:'Patrimonio · 2 h', tagColor:'#818cf8' },
  { time:'17:00', title:'Tarde libre en Carmelo', subtitle:'Puerto, artesanías, heladería local o simplemente la vista al río.', Icon:MapPin, iconColor:'#34d399', iconBg:'rgba(52,211,153,0.1)', tag:'Libre', tagColor:'#34d399' },
  { time:'20:00', title:'Cena en restaurante del pueblo', subtitle:'Parrilla uruguaya tradicional. Ambiente tranquilo y local.', Icon:UtensilsCrossed, iconColor:G, iconBg:'rgba(197,160,89,0.12)', tag:'Gastronómico', tagColor:G },
];
const D2_B: TEvent[] = [
  { time:'08:30', title:'Desayuno con lluvia de fondo', subtitle:'Quesos, dulce de leche, pan artesanal recién horneado. Ambiente cálido adentro.', Icon:Coffee, iconColor:'#f59e0b', iconBg:'rgba(245,158,11,0.12)', tag:'Desayuno incluido', tagColor:'#f59e0b' },
  { time:'10:00', title:'Taller artesanal en quesería cubierta', subtitle:'Nueva Helvecia. Hacés tu propio queso guiado por productores locales. 100% techado.', Icon:Star, iconColor:'#34d399', iconBg:'rgba(52,211,153,0.1)', tag:'Plan B · Manos · 2 h', tagColor:'#34d399', planBOnly:true },
  { time:'12:30', title:'Almuerzo en salón de estancia', subtitle:'Interior acogedor, fuego encendido, menú de campo. La lluvia no cambia el sabor.', Icon:UtensilsCrossed, iconColor:G, iconBg:'rgba(197,160,89,0.12)', tag:'Gastronómico · 1.5 h', tagColor:G },
  { time:'14:30', title:'Conchillas bajo la lluvia', subtitle:'Las calles empedradas y los portales victorianos tienen otro encanto cuando llueve.', Icon:Camera, iconColor:'#818cf8', iconBg:'rgba(129,140,248,0.12)', tag:'Patrimonio', tagColor:'#818cf8' },
  { time:'17:00', title:'Café y galería de arte local', subtitle:'Carmelo tiene una escena artística pequeña pero activa. Perfecto para una tarde de lluvia.', Icon:MapPin, iconColor:'#34d399', iconBg:'rgba(52,211,153,0.1)', tag:'Libre · Techado', tagColor:'#34d399' },
  { time:'20:00', title:'Cena con chimenea', subtitle:'Parrilla uruguaya en salón cerrado. Humo, fuego y buen vino.', Icon:UtensilsCrossed, iconColor:G, iconBg:'rgba(197,160,89,0.12)', tag:'Plan B · Gastronómico', tagColor:G, planBOnly:true },
];
const D3_A: TEvent[] = [
  { time:'08:30', title:'Desayuno tranquilo', subtitle:'Última mañana sin apuros. Desayuno de campo completo.', Icon:Coffee, iconColor:'#f59e0b', iconBg:'rgba(245,158,11,0.12)', tag:'Desayuno incluido', tagColor:'#f59e0b' },
  { time:'10:00', title:'Kayak o navegación en el Río Uruguay', subtitle:'Salida guiada desde el puerto de Carmelo. Vista a las islas y al paisaje ribereño desde el agua.', Icon:Bike, iconColor:'#60a5fa', iconBg:'rgba(96,165,250,0.12)', tag:'Aventura · 2 h', tagColor:'#60a5fa' },
  { time:'13:00', title:'Almuerzo en parador del río', subtitle:'Pescado de río fresco, vista al agua. El almuerzo más tranquilo de la escapada.', Icon:UtensilsCrossed, iconColor:G, iconBg:'rgba(197,160,89,0.12)', tag:'Gastronómico · 1.5 h', tagColor:G },
  { time:'15:00', title:'Tarde libre · compras finales', subtitle:'Etiquetas de bodega, aceite de oliva y artesanías para llevar a casa.', Icon:Star, iconColor:'#34d399', iconBg:'rgba(52,211,153,0.1)', tag:'Libre', tagColor:'#34d399' },
  { time:'19:00', title:'Cena de despedida en Bodega El Legado', subtitle:'Mesa especial. Menú de 4 tiempos con maridaje completo. La manera perfecta de cerrar la estadía.', Icon:Wine, iconColor:G, iconBg:'rgba(197,160,89,0.12)', tag:'Premium · Despedida', tagColor:G },
];
const D3_B: TEvent[] = [
  { time:'08:30', title:'Desayuno tranquilo', subtitle:'Última mañana sin apuros. Ambiente cálido con lluvia afuera.', Icon:Coffee, iconColor:'#f59e0b', iconBg:'rgba(245,158,11,0.12)', tag:'Desayuno incluido', tagColor:'#f59e0b' },
  { time:'10:00', title:'Taller de cerámica o pintura cubierto', subtitle:'Artistas locales ofrecen talleres en sus estudios. Ideal para una mañana de lluvia.', Icon:Camera, iconColor:'#818cf8', iconBg:'rgba(129,140,248,0.12)', tag:'Plan B · Arte · 2 h', tagColor:'#818cf8', planBOnly:true },
  { time:'13:00', title:'Almuerzo en bodega con vista a los viñedos', subtitle:'Aunque llueva, los viñedos mojados tienen su belleza. Menú de campo adentro.', Icon:UtensilsCrossed, iconColor:G, iconBg:'rgba(197,160,89,0.12)', tag:'Gastronómico · 1.5 h', tagColor:G },
  { time:'15:00', title:'Tarde libre · tienda de la bodega', subtitle:'Compras finales: etiquetas, aceite de oliva, conservas artesanales.', Icon:Star, iconColor:'#34d399', iconBg:'rgba(52,211,153,0.1)', tag:'Libre · Techado', tagColor:'#34d399' },
  { time:'19:00', title:'Cena de despedida con sommelier en mesa', subtitle:'Menú 4 tiempos, chimenea, música suave. El Plan B también puede ser el mejor plan.', Icon:Wine, iconColor:'#60a5fa', iconBg:'rgba(96,165,250,0.12)', tag:'Plan B · Premium', tagColor:'#60a5fa', planBOnly:true },
];
const D_LAST: TEvent[] = [
  { time:'09:00', title:'Desayuno y checkout', subtitle:'Sin apuros. Check-out tardío disponible en la mayoría de los alojamientos partner.', Icon:Coffee, iconColor:'#f59e0b', iconBg:'rgba(245,158,11,0.12)', tag:'Desayuno + checkout', tagColor:'#f59e0b' },
  { time:'11:00', title:'Compras finales y despedida', subtitle:'Última oportunidad para llevarte etiquetas, aceite de oliva local y artesanías de Carmelo.', Icon:Star, iconColor:'#34d399', iconBg:'rgba(52,211,153,0.1)', tag:'Libre · opcional', tagColor:'#34d399' },
  { time:'13:00', title:'Regreso a Colonia o Montevideo', subtitle:'Bus directo desde Carmelo (45 min a Colonia · 3 h a Montevideo). También ferry por el río.', Icon:Car, iconColor:'#60a5fa', iconBg:'rgba(96,165,250,0.1)', tag:'Traslado', tagColor:'#60a5fa' },
];

function getDayEvents(arrival: string, plan: PlanMode, idx: number, nights: number): TEvent[] {
  if (idx === 0) {
    if (plan === 'A') return arrival === 'mañana' ? D1_AM_A : arrival === 'tarde' ? D1_PM_A : D1_N_A;
    return arrival === 'mañana' ? D1_AM_B : arrival === 'tarde' ? D1_PM_B : D1_N_B;
  }
  if (idx >= nights) return D_LAST;
  const isB = plan === 'B';
  if (idx === 1) return isB ? D2_B : D2_A;
  return isB ? D3_B : D3_A;
}

// ── Hoteles partner ────────────────────────────────────────────────────────────
const HOTELS = [
  {
    name: 'Posada del Legado', stars: 4, dist: 'En el predio de la bodega',
    desc: 'Habitaciones de autor con vista a los viñedos. Desayuno gourmet incluido y acceso privado a la cava.',
    pricePerNight: 4800, priceLabel: '$UY 4.800 / noche', note: 'para 2 personas · desayuno incluido',
    tag: 'Partner destacado', tagColor: G,
    perks: ['Piscina entre vides', 'Desayuno gourmet', 'Cava privada', 'Vista al viñedo'],
    razonSocial: 'El Legado Viñedos S.A.', rut: '21 456789 0001', address: 'Ruta 21 km 218, Carmelo, Colonia', phone: '+598 4542 1100',
  },
  {
    name: 'Hotel Las Calandrias', stars: 3, dist: '3 km del centro de Carmelo',
    desc: 'Hotel boutique con parque y pileta. Traslado a la bodega coordinado por EscapaUY.',
    pricePerNight: 2900, priceLabel: '$UY 2.900 / noche', note: 'doble estándar · sin desayuno',
    tag: 'Partner · Mejor precio', tagColor: '#34d399',
    perks: ['Pileta exterior', 'Bici gratuita', 'Traslado coordinado'],
    razonSocial: 'Calandrias Hotelería S.R.L.', rut: '21 509344 0001', address: 'Av. Artigas 480, Carmelo, Colonia', phone: '+598 4542 2200',
  },
  {
    name: 'Cabañas El Faro', stars: 2, dist: '6 km · Sobre el río',
    desc: 'Cabañas de madera frente al Río Uruguay. Ideal para familias o grupos. Parrilla propia y atardecer directo sobre el agua.',
    pricePerNight: 1600, priceLabel: '$UY 1.600 / noche', note: 'cabaña para 4 personas',
    tag: 'Partner · Naturaleza', tagColor: '#60a5fa',
    perks: ['Vista al río', 'Parrilla propia', 'Pet friendly', 'Privacidad total'],
    razonSocial: 'El Faro Turismo Rural S.R.L.', rut: '21 603177 0001', address: 'Ruta 21 km 224, Carmelo, Colonia', phone: '+598 4542 3310',
  },
];

const EXP_NET = 3570; const EXP_LIST = 4200; const EXP_IVA = 630;

// ── Servicios pagos por día con datos legales de cada partner ─────────────────
interface PaidService {
  id: string; day: string; name: string; type: string; price: number;
  partnerName: string; razonSocial: string; rut: string; address: string; phone: string;
  planMode: 'A' | 'B' | 'both';
}
const SERVICES_DIA1: PaidService[] = [
  { id:'caminata', day:'Día 1', name:'Caminata guiada entre viñedos', type:'Actividad outdoor', price:490,
    partnerName:'Bodega El Legado', razonSocial:'El Legado Viñedos S.A.', rut:'21 456789 0001', address:'Ruta 21 km 218, Carmelo, Colonia', phone:'+598 4542 1100', planMode:'A' },
  { id:'taller_cava', day:'Día 1', name:'Taller de maridaje en cava subterránea', type:'Actividad indoor', price:690,
    partnerName:'Bodega El Legado', razonSocial:'El Legado Viñedos S.A.', rut:'21 456789 0001', address:'Ruta 21 km 218, Carmelo, Colonia', phone:'+598 4542 1100', planMode:'B' },
  { id:'almuerzo1', day:'Día 1', name:'Almuerzo maridaje 3 tiempos + vinos', type:'Gastronomía', price:1980,
    partnerName:'Restaurante Bodega El Legado', razonSocial:'El Legado Viñedos S.A.', rut:'21 456789 0001', address:'Ruta 21 km 218, Carmelo, Colonia', phone:'+598 4542 1100', planMode:'both' },
  { id:'cata', day:'Día 1', name:'Cata guiada 4 etiquetas con sommelier', type:'Experiencia premium', price:1100,
    partnerName:'Bodega El Legado', razonSocial:'El Legado Viñedos S.A.', rut:'21 456789 0001', address:'Ruta 21 km 218, Carmelo, Colonia', phone:'+598 4542 1100', planMode:'both' },
];
const SERVICES_DIA2: PaidService[] = [
  { id:'granja', day:'Día 2', name:'Visita granja quesera — Nueva Helvecia', type:'Actividad cultural', price:780,
    partnerName:'Granja Los Colonos', razonSocial:'Los Colonos Agroturismo S.R.L.', rut:'21 711203 0001', address:'Ruta 2 km 186, Nueva Helvecia, Colonia', phone:'+598 4554 0820', planMode:'both' },
  { id:'almuerzo2', day:'Día 2', name:'Almuerzo parador rural — cordero y chivito de campo', type:'Gastronomía', price:1350,
    partnerName:'Parador El Campo', razonSocial:'El Campo Gastronomía S.A.', rut:'21 583491 0001', address:'Ruta 21 km 220, Carmelo, Colonia', phone:'+598 4542 1480', planMode:'both' },
  { id:'conchillas', day:'Día 2', name:'Recorrido patrimonial guiado — Conchillas', type:'Turismo cultural', price:420,
    partnerName:'Guías Patrimoniales Colonia', razonSocial:'Turismo Patrimonial S.R.L.', rut:'21 469820 0001', address:'Calle Real 45, Conchillas, Colonia', phone:'+598 4577 0190', planMode:'both' },
];
const SERVICES_DIA3: PaidService[] = [
  { id:'kayak', day:'Día 3', name:'Kayak entre islas del Río Uruguay', type:'Actividad acuática', price:1000,
    partnerName:'Carmelo Aventura', razonSocial:'Aventura Fluvial S.R.L.', rut:'21 634057 0001', address:'Puerto de Carmelo, Colonia', phone:'+598 4542 2980', planMode:'A' },
  { id:'almuerzo3', day:'Día 3', name:'Almuerzo de despedida en el puerto', type:'Gastronomía', price:1100,
    partnerName:'El Puerto Carmelo', razonSocial:'Puerto Gastronómico S.R.L.', rut:'21 502388 0001', address:'Puerto de Carmelo, Colonia', phone:'+598 4542 3100', planMode:'both' },
];

const ARRIVAL_LABELS: Record<string, string> = {
  mañana: '🌅 Llegada por la mañana', tarde: '🌇 Llegada por la tarde', noche: '🌙 Llegada por la noche',
};

function fmtDate(d: string) {
  if (!d) return '';
  const [y,m,day] = d.split('-');
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${parseInt(day)} ${months[parseInt(m)-1]} ${y}`;
}

// ── AI Chat ───────────────────────────────────────────────────────────────────
interface Suggestion {
  title: string; location: string; desc: string;
  price?: number; priceLabel?: string;
}
interface ChatMsg { role: 'user' | 'ai'; text: string; suggestions?: Suggestion[]; }

const ALT_DB: { keywords: string[]; response: string; suggestions: Suggestion[] }[] = [
  { keywords:['teatro','obra','espectáculo'], response:'Claro, en lugar de la cata te propongo opciones culturales en la zona:', suggestions:[
    { title:'Teatro Lavalleja', location:'Colonia del Sacramento (45 min)', desc:'Teatro histórico del siglo XIX. Consultar cartelera en temporada nov–mar.', price:600, priceLabel:'$UY 600 pp' },
    { title:'Ciclo de Folclore · Casa de la Cultura', location:'Carmelo', desc:'Música en vivo los viernes. Repertorio de folclore uruguayo y gaúcho.', price:0, priceLabel:'Entrada libre' },
    { title:'Festival del Río', location:'Puerto de Carmelo', desc:'En verano: artistas locales en el anfiteatro al aire libre.', price:0, priceLabel:'Gratuito' },
  ]},
  { keywords:['música','recital','concierto','vivo'], response:'Buena elección. Opciones de música en vivo cerca de Carmelo:', suggestions:[
    { title:'La Bodega en Vivo', location:'Bodega El Legado, Carmelo', desc:'Artista invitado en el salón de la bodega. Consultar fechas.', price:800, priceLabel:'$UY 800 pp' },
    { title:'Peña Criolla El Ombú', location:'Carmelo centro', desc:'Música criolla y folclore en vivo. Miércoles y sábados a las 21 h.', price:400, priceLabel:'$UY 400 pp' },
    { title:'Ciclo de Jazz del Puerto', location:'Carmelo', desc:'Primer sábado de cada mes. Ambiente íntimo sobre el río.', price:500, priceLabel:'$UY 500 pp' },
  ]},
  { keywords:['playa','río','natación','nadar','agua'], response:'Perfecto para relajarse. Las opciones acuáticas en Carmelo son excelentes:', suggestions:[
    { title:'Playa Seré', location:'Carmelo (5 min)', desc:'La playa de río más popular. Aguas calmas, arena fina, ideal en verano.', price:0, priceLabel:'Gratuito' },
    { title:'Playa del Puerto', location:'Carmelo centro', desc:'A pasos del centro. Atardecer sobre el Río Uruguay desde la orilla.', price:0, priceLabel:'Gratuito' },
    { title:'Kayak en el río', location:'Puerto de Carmelo', desc:'Salida guiada 2 h entre islas. Sin experiencia previa necesaria.', price:1000, priceLabel:'$UY 1.000 pp' },
  ]},
  { keywords:['kayak','canoa','deportes','activo','aventura','bici'], response:'Para un plan más activo hay varias opciones en la zona:', suggestions:[
    { title:'Kayak entre islas del Río Uruguay', location:'Puerto de Carmelo', desc:'Salida guiada de 2 h. Sin experiencia previa necesaria.', price:1000, priceLabel:'$UY 1.000 pp' },
    { title:'Cycling tour por la Ruta del Vino', location:'Carmelo', desc:'Bicicletas disponibles. 25 km entre bodegas y olivares.', price:700, priceLabel:'$UY 700 pp' },
    { title:'Pesca deportiva en el río', location:'Puerto de Carmelo', desc:'Salida de 3 h con guía local. Dorado, surubí y boga.', price:1200, priceLabel:'$UY 1.200 pp' },
  ]},
  { keywords:['spa','masaje','relax','descanso','bienestar'], response:'Una elección excelente para recargar energías:', suggestions:[
    { title:'Spa Termal · Posada del Legado', location:'Bodega El Legado', desc:'Circuito termal y masajes. Para huéspedes y externos.', price:2200, priceLabel:'$UY 2.200 pp' },
    { title:'Masajes con aceite de oliva local', location:'Carmelo', desc:'Terapeuta local usa aceite extra virgen de la zona. 60/90 minutos.', price:1500, priceLabel:'$UY 1.500 pp' },
    { title:'Tarde libre a la orilla del río', location:'Playa del Puerto, Carmelo', desc:'Sin reserva. Llevá un libro. El Río Uruguay hace el resto.', price:0, priceLabel:'Gratuito' },
  ]},
  { keywords:['museo','historia','patrimonio','arte'], response:'La región tiene una historia cultural muy rica:', suggestions:[
    { title:'Museo de Arte y Artesanías de Carmelo', location:'Carmelo centro', desc:'Colección de artesanías regionales y arte contemporáneo uruguayo.', price:200, priceLabel:'$UY 200 entrada' },
    { title:'Conchillas: pueblo victoriano', location:'Conchillas (20 min)', desc:'El pueblo más intacto del siglo XIX en Uruguay. Entrada libre.', price:0, priceLabel:'Gratuito' },
    { title:'Ciudad Histórica de Colonia', location:'Colonia del Sacramento (45 min)', desc:'Patrimonio UNESCO. Museos, calles empedradas y faro histórico.', price:300, priceLabel:'$UY 300 entrada' },
  ]},
  { keywords:['niños','familia','chicos','kids','infantil'], response:'Con niños la experiencia cambia. Las mejores actividades familiares:', suggestions:[
    { title:'Granja Los Naranjos', location:'Ruta 21, 8 km de Carmelo', desc:'Ordeñe, animales de granja y elaboración de queso. Desde 3 años.', price:600, priceLabel:'$UY 600 pp' },
    { title:'Taller de pan artesanal', location:'Nueva Helvecia (30 min)', desc:'Hacen su propio pan. Limpio, divertido y con resultado comestible.', price:500, priceLabel:'$UY 500 pp' },
    { title:'Playa Seré con juegos', location:'Carmelo', desc:'Área de juegos y aguas muy calmas. Segura para chicos.', price:0, priceLabel:'Gratuito' },
  ]},
  { keywords:['compras','artesanías','regalos','llevar','souvenir'], response:'Para llevarte algo especial de Carmelo y alrededores:', suggestions:[
    { title:'Tienda de Bodega El Legado', location:'Carmelo', desc:'Etiquetas de autor, aceite de oliva extra virgen y conservas artesanales.', price:0, priceLabel:'Libre · sin cargo de acceso' },
    { title:'Feria Artesanal del Puerto', location:'Puerto de Carmelo (sábados)', desc:'Cerámica, cuero, tejidos y productos locales. Sábados de 9 a 14 h.', price:0, priceLabel:'Entrada libre' },
    { title:'Quesos de Nueva Helvecia', location:'Nueva Helvecia (30 min)', desc:'Quesos de autor de producción limitada. Se llevan envasados al vacío.', price:0, priceLabel:'Precio varía por compra' },
  ]},
];

function getAIResponse(msg: string): { text: string; suggestions?: Suggestion[] } {
  const lower = msg.toLowerCase();
  for (const entry of ALT_DB) {
    if (entry.keywords.some(k => lower.includes(k))) {
      return { text: entry.response, suggestions: entry.suggestions };
    }
  }
  if (lower.includes('gracias') || lower.includes('perfecto') || lower.includes('genial')) {
    return { text: '¡Excelente! Tu itinerario ajustado queda registrado. Si querés modificar algo más, seguí escribiendo acá.' };
  }
  return { text: 'Puedo sugerirte alternativas para cualquier actividad. Por ejemplo: "en vez de la cata quiero teatro", "algo más activo", "actividades para los chicos", "spa o relax". ¿Qué cambiarías?' };
}

// ── Panel de chat ─────────────────────────────────────────────────────────────
function ChatPanel({
  onClose,
  onAddExtra,
  selectedExtras,
}: {
  onClose: () => void;
  onAddExtra: (s: Suggestion) => void;
  selectedExtras: Suggestion[];
}) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role:'ai', text:'Hola 👋 Si querés cambiar alguna actividad del itinerario — teatro, kayak, spa, o lo que se te ocurra — escribime y te busco opciones. Podés agregarlas directamente al paquete.' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs, typing]);

  const send = async () => {
    const txt = input.trim(); if (!txt) return;
    setInput(''); setMsgs(p => [...p, { role:'user', text:txt }]); setTyping(true);
    await new Promise(r => setTimeout(r, 1400 + Math.random()*600));
    setTyping(false); setMsgs(p => [...p, { role:'ai', ...getAIResponse(txt) }]);
  };

  const isAdded = (s: Suggestion) => selectedExtras.some(e => e.title === s.title);

  return (
    <motion.div initial={{ opacity:0, y:20, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:20, scale:0.95 }} transition={{ duration:0.25 }}
      style={{ position:'fixed', bottom:'5.5rem', right:'1.5rem', zIndex:50, width:'min(440px, calc(100vw - 3rem))', height:'min(600px, calc(100vh - 8rem))', borderRadius:'8px', display:'flex', flexDirection:'column', background:'#0f1420', border:'1px solid rgba(197,160,89,0.25)', boxShadow:'0 24px 64px rgba(0,0,0,0.6)', fontFamily:'Montserrat, sans-serif', overflow:'hidden' }}>
      <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid rgba(197,160,89,0.12)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(197,160,89,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <Sparkles size={15} style={{ color:G }} />
          <span style={{ fontSize:'0.8rem', fontWeight:700, color:C }}>Personalizar itinerario</span>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(248,247,244,0.5)' }}><X size={16} /></button>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'1rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:m.role==='user'?'flex-end':'flex-start', gap:'0.35rem' }}>
            <div style={{ maxWidth:'88%', padding:'0.65rem 0.9rem', borderRadius:m.role==='user'?'12px 12px 2px 12px':'12px 12px 12px 2px', fontSize:'0.78rem', lineHeight:1.55, background:m.role==='user'?'rgba(197,160,89,0.15)':'rgba(248,247,244,0.06)', color:m.role==='user'?C:'rgba(248,247,244,0.85)', border:m.role==='user'?'1px solid rgba(197,160,89,0.25)':'1px solid rgba(248,247,244,0.08)' }}>{m.text}</div>
            {m.suggestions && (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.45rem', width:'95%' }}>
                {m.suggestions.map((s, j) => {
                  const added = isAdded(s);
                  return (
                    <div key={j} style={{ padding:'0.85rem', borderRadius:'6px', background: added ? 'rgba(197,160,89,0.08)' : 'rgba(197,160,89,0.04)', border: added ? `1px solid ${G}` : '1px solid rgba(197,160,89,0.15)', transition:'all 0.2s' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'0.5rem', marginBottom:'0.15rem' }}>
                        <div style={{ fontSize:'0.78rem', fontWeight:600, color: added ? G : C }}>{s.title}</div>
                        {s.priceLabel && (
                          <span style={{ fontSize:'0.62rem', fontWeight:600, padding:'0.15rem 0.45rem', borderRadius:'4px', flexShrink:0, background: s.price === 0 ? 'rgba(52,211,153,0.1)' : 'rgba(197,160,89,0.1)', color: s.price === 0 ? '#34d399' : G }}>{s.priceLabel}</span>
                        )}
                      </div>
                      <div style={{ fontSize:'0.68rem', color:'rgba(248,247,244,0.4)', marginBottom:'0.3rem' }}>📍 {s.location}</div>
                      <div style={{ fontSize:'0.72rem', color:'rgba(248,247,244,0.55)', lineHeight:1.4, marginBottom:'0.6rem' }}>{s.desc}</div>
                      <button
                        onClick={() => { if (!added) onAddExtra(s); }}
                        disabled={added}
                        style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', fontSize:'0.7rem', fontWeight:600, padding:'0.35rem 0.7rem', borderRadius:'4px', border:'none', cursor: added ? 'default' : 'pointer', fontFamily:'Montserrat, sans-serif', background: added ? 'rgba(197,160,89,0.15)' : G, color: added ? G : N, transition:'all 0.2s' }}>
                        {added ? <><Check size={11} /> Agregado al paquete</> : <><Plus size={11} /> Agregar al paquete</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        {typing && (
          <div style={{ display:'flex', gap:'0.3rem', padding:'0.65rem 0.9rem', borderRadius:'12px 12px 12px 2px', background:'rgba(248,247,244,0.06)', border:'1px solid rgba(248,247,244,0.08)', width:'fit-content' }}>
            {[0,1,2].map(i => <motion.div key={i} style={{ width:'6px', height:'6px', borderRadius:'50%', background:G }} animate={{ opacity:[0.3,1,0.3], y:[0,-3,0] }} transition={{ duration:0.8, repeat:Infinity, delay:i*0.15 }} />)}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ padding:'0.5rem 1rem', display:'flex', gap:'0.4rem', flexWrap:'wrap', borderTop:'1px solid rgba(248,247,244,0.06)' }}>
        {['Teatro / música','Kayak / deportes','Spa / relax','Para niños'].map(chip => (
          <button key={chip} onClick={() => setInput(chip)} style={{ fontSize:'0.65rem', padding:'0.25rem 0.6rem', borderRadius:'20px', border:'1px solid rgba(197,160,89,0.2)', background:'rgba(197,160,89,0.06)', color:'rgba(197,160,89,0.85)', cursor:'pointer', fontFamily:'Montserrat, sans-serif' }}>{chip}</button>
        ))}
      </div>

      <div style={{ padding:'0.75rem 1rem', borderTop:'1px solid rgba(197,160,89,0.1)', display:'flex', gap:'0.5rem' }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && send()} placeholder='"en vez de la cata quiero teatro"' style={{ flex:1, padding:'0.6rem 0.85rem', borderRadius:'6px', border:'1px solid rgba(248,247,244,0.12)', background:'rgba(248,247,244,0.05)', color:C, fontSize:'0.78rem', fontFamily:'Montserrat, sans-serif', outline:'none' }} />
        <button onClick={send} disabled={!input.trim()} style={{ padding:'0.6rem 0.85rem', borderRadius:'6px', border:'none', cursor:input.trim()?'pointer':'not-allowed', background:input.trim()?G:'rgba(197,160,89,0.2)', color:N, opacity:input.trim()?1:0.4 }}><Send size={14} /></button>
      </div>
    </motion.div>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────────
function DayTimeline({ events }: { events: TEvent[] }) {
  return (
    <div style={{ position:'relative' }}>
      <div style={{ position:'absolute', left:'88px', top:'1.5rem', bottom:'1.5rem', width:'1px', background:'linear-gradient(to bottom, rgba(197,160,89,0.4), rgba(197,160,89,0.05))' }} />
      <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
        {events.map((ev, i) => {
          const { Icon } = ev; const isB = ev.planBOnly;
          return (
            <motion.div key={i} initial={{ opacity:0, x:-14 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.3, delay:i*0.06 }} style={{ display:'flex', gap:'1.25rem' }}>
              <div style={{ width:'64px', flexShrink:0, textAlign:'right', paddingTop:'0.35rem' }}>
                <span style={{ fontSize:'0.72rem', fontWeight:600, color:'rgba(197,160,89,0.7)', fontFamily:'Montserrat, sans-serif' }}>{ev.time}</span>
              </div>
              <div style={{ width:'40px', flexShrink:0, display:'flex', justifyContent:'center' }}>
                <div style={{ width:'2rem', height:'2rem', borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center', marginTop:'0.1rem', zIndex:10, background:isB?'rgba(59,130,246,0.15)':ev.iconBg, border:isB?'1px solid rgba(59,130,246,0.3)':'1px solid rgba(197,160,89,0.15)' }}>
                  <Icon size={14} style={{ color:isB?'#60a5fa':ev.iconColor }} />
                </div>
              </div>
              <div style={{ flex:1, padding:'1rem 1.25rem', borderRadius:'4px', marginBottom:'0.25rem', background:isB?'rgba(59,130,246,0.05)':'rgba(248,247,244,0.04)', border:isB?'1px solid rgba(59,130,246,0.15)':'1px solid rgba(248,247,244,0.07)' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'0.75rem', marginBottom:'0.4rem' }}>
                  <h3 style={{ fontSize:'0.85rem', fontWeight:600, color:C, fontFamily:'Montserrat, sans-serif', lineHeight:1.3 }}>{ev.title}</h3>
                  <span style={{ fontSize:'0.62rem', fontWeight:600, padding:'0.2rem 0.5rem', borderRadius:'4px', flexShrink:0, background:`${ev.tagColor}18`, color:ev.tagColor }}>{ev.tag}</span>
                </div>
                <p style={{ fontSize:'0.75rem', lineHeight:1.6, color:'rgba(248,247,244,0.5)', fontFamily:'Montserrat, sans-serif' }}>{ev.subtitle}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export function ItinerarioSimuladoPage() {
  const [plan, setPlan] = useState<PlanMode>('A');
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<number>(0);
  const [selectedExtras, setSelectedExtras] = useState<Suggestion[]>([]);
  const [simulated, setSimulated] = useState(false);
  const [bookingRef] = useState(() => 'ESC-' + Date.now().toString(36).toUpperCase());
  const navigate = useNavigate();

  const raw = sessionStorage.getItem('wizardData');
  const wd = raw ? JSON.parse(raw) : {};
  const arrival: string = wd.arrivalTime || 'mañana';
  const dateStart: string = wd.dateStart || '';
  const dateEnd: string = wd.dateEnd || '';

  const nights = (dateStart && dateEnd)
    ? Math.max(0, Math.round((new Date(dateEnd).getTime() - new Date(dateStart).getTime()) / 86400000))
    : 0;

  const totalDays  = nights === 0 ? 1 : nights + 1;
  const isMultiDay = nights > 0;
  const isRainy    = plan === 'B';

  // ── Presupuesto ───────────────────────────────────────────────────────────
  const hotelTotal  = isMultiDay ? HOTELS[selectedHotel].pricePerNight * nights : 0;
  const extrasTotal = selectedExtras.reduce((sum, e) => sum + (e.price || 0), 0);
  const packageNet  = EXP_NET + hotelTotal + extrasTotal;
  const depositAmt  = Math.round(packageNet * 0.15);
  const balanceAmt  = packageNet - depositAmt;
  const depositUSD  = Math.round(depositAmt / 40);

  // ── Generar lista de vouchers por servicio pago ──────────────────────────
  const voucherList = (() => {
    type VItem = PaidService & { totalPrice: number; deposit: number; balance: number };
    const list: VItem[] = [];

    // Día 1 — servicios según plan A o B
    SERVICES_DIA1
      .filter(s => s.planMode === 'both' || s.planMode === (isRainy ? 'B' : 'A'))
      .forEach(s => {
        const deposit = Math.round(s.price * 0.15);
        list.push({ ...s, totalPrice: s.price, deposit, balance: s.price - deposit });
      });

    // Hotel (solo si multiday)
    if (isMultiDay) {
      const h = HOTELS[selectedHotel];
      const total = h.pricePerNight * nights;
      const deposit = Math.round(total * 0.15);
      list.push({
        id:'hotel', day:`Días 1–${nights+1}`, name:`Alojamiento: ${h.name} (${nights} noche${nights>1?'s':''})`,
        type:'Alojamiento', price: h.pricePerNight,
        partnerName: h.name, razonSocial: h.razonSocial, rut: h.rut, address: h.address, phone: h.phone,
        planMode:'both', totalPrice: total, deposit, balance: total - deposit,
      });
      // Día 2
      if (nights >= 2) {
        SERVICES_DIA2.forEach(s => {
          const deposit = Math.round(s.price * 0.15);
          list.push({ ...s, totalPrice: s.price, deposit, balance: s.price - deposit });
        });
      }
      // Día 3+
      if (nights >= 3) {
        SERVICES_DIA3
          .filter(s => s.planMode === 'both' || s.planMode === (isRainy ? 'B' : 'A'))
          .forEach(s => {
            const deposit = Math.round(s.price * 0.15);
            list.push({ ...s, totalPrice: s.price, deposit, balance: s.price - deposit });
          });
      }
    }

    // Extras con precio del chat IA
    selectedExtras.filter(e => (e.price || 0) > 0).forEach(e => {
      const price = e.price || 0;
      const deposit = Math.round(price * 0.15);
      list.push({
        id:'extra-'+e.title, day:'Extra', name: e.title, type:'Actividad adicional', price,
        partnerName: e.location, razonSocial:'Partner EscapaUY', rut:'—', address: e.location, phone:'—',
        planMode:'both', totalPrice: price, deposit, balance: price - deposit,
      });
    });

    return list;
  })();

  const [activeVoucher, setActiveVoucher] = useState(0);

  const addExtra = (s: Suggestion) => {
    setSelectedExtras(prev => prev.some(e => e.title === s.title) ? prev : [...prev, s]);
  };
  const removeExtra = (title: string) => {
    setSelectedExtras(prev => prev.filter(e => e.title !== title));
  };

  const dayLabels = Array.from({ length: totalDays }, (_, i) => {
    if (totalDays === 1) return 'Día único';
    if (i === 0) return 'Día 1 — Llegada';
    if (i === nights) return `Día ${i + 1} — Regreso`;
    return `Día ${i + 1}`;
  });

  const currentEvents = getDayEvents(arrival, plan, activeDay, nights);

  return (
    <div style={{ background:N, minHeight:'100vh', fontFamily:'Montserrat, sans-serif' }}>

      {/* ── ENCABEZADO ── */}
      <section style={{ paddingTop:'4rem', paddingBottom:'2.5rem', paddingLeft:'1.5rem', paddingRight:'1.5rem', borderBottom:'1px solid rgba(197,160,89,0.1)' }}>
        <div style={{ maxWidth:'860px', margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.72rem', marginBottom:'1.5rem', color:'rgba(248,247,244,0.4)' }}>
            <Link to="/" style={{ color:G }}>Inicio</Link><span>/</span>
            <Link to="/wizard" style={{ color:'rgba(248,247,244,0.4)' }}>ADN Viajero</Link><span>/</span>
            <span>Tu Itinerario</span>
          </div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', padding:'0.3rem 0.75rem', borderRadius:'2px', fontSize:'0.7rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'1rem', background:'rgba(197,160,89,0.1)', color:G, border:'1px solid rgba(197,160,89,0.2)' }}>
            <Star size={11} /> Propuesta Personalizada · Carmelo
          </div>
          <h1 style={{ fontFamily:'"Playfair Display", serif', fontSize:'clamp(1.8rem, 4vw, 2.8rem)', fontWeight:700, color:C, marginBottom:'0.25rem' }}>Bodega El Legado</h1>
          <p style={{ fontFamily:'"Playfair Display", serif', fontSize:'1.1rem', fontStyle:'italic', color:G, opacity:0.8, marginBottom:'1rem' }}>Ruta del Vino · Carmelo, Colonia</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginBottom:'1.75rem' }}>
            {arrival && <span style={{ fontSize:'0.72rem', fontWeight:600, padding:'0.25rem 0.65rem', borderRadius:'20px', background:'rgba(197,160,89,0.08)', color:G, border:'1px solid rgba(197,160,89,0.2)' }}>{ARRIVAL_LABELS[arrival]||arrival}</span>}
            {dateStart && <span style={{ fontSize:'0.72rem', padding:'0.25rem 0.65rem', borderRadius:'20px', background:'rgba(248,247,244,0.06)', color:'rgba(248,247,244,0.6)', border:'1px solid rgba(248,247,244,0.1)' }}>📅 {fmtDate(dateStart)}{dateEnd?` → ${fmtDate(dateEnd)}`:''}</span>}
            {isMultiDay && <span style={{ fontSize:'0.72rem', fontWeight:600, padding:'0.25rem 0.65rem', borderRadius:'20px', background:'rgba(52,211,153,0.08)', color:'#34d399', border:'1px solid rgba(52,211,153,0.2)' }}>🌙 {nights} {nights===1?'noche':'noches'}</span>}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
            <button onClick={() => setPlan('A')} style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.6rem 1.25rem', borderRadius:'4px', fontSize:'0.85rem', fontWeight:600, fontFamily:'Montserrat, sans-serif', cursor:'pointer', border:'none', background:plan==='A'?G:'rgba(248,247,244,0.05)', color:plan==='A'?N:'rgba(248,247,244,0.6)', outline:plan==='A'?'none':'1px solid rgba(248,247,244,0.12)' }}><Sun size={15} /> Plan A — Día de Sol</button>
            <button onClick={() => setPlan('B')} style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.6rem 1.25rem', borderRadius:'4px', fontSize:'0.85rem', fontWeight:600, fontFamily:'Montserrat, sans-serif', cursor:'pointer', border:'none', background:plan==='B'?'#3b82f6':'rgba(248,247,244,0.05)', color:plan==='B'?'#fff':'rgba(248,247,244,0.6)', outline:plan==='B'?'none':'1px solid rgba(248,247,244,0.12)' }}><CloudRain size={15} /> Simular Lluvia</button>
            {isRainy && <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ fontSize:'0.72rem', fontWeight:600, padding:'0.3rem 0.75rem', borderRadius:'4px', background:'rgba(59,130,246,0.1)', color:'#60a5fa', border:'1px solid rgba(59,130,246,0.2)', display:'inline-flex', alignItems:'center', gap:'0.3rem' }}><AlertTriangle size={11} /> Plan B Activo</motion.span>}
          </div>
        </div>
      </section>

      {/* ── TABS POR DÍA ── */}
      {isMultiDay && (
        <div style={{ borderBottom:'1px solid rgba(197,160,89,0.1)', background:'rgba(248,247,244,0.02)', overflowX:'auto' }}>
          <div style={{ maxWidth:'860px', margin:'0 auto', paddingLeft:'1.5rem', paddingRight:'1.5rem', display:'flex' }}>
            {dayLabels.map((label, i) => (
              <button key={i} onClick={() => setActiveDay(i)} style={{ padding:'0.9rem 1.1rem', fontSize:'0.78rem', fontWeight:600, fontFamily:'Montserrat, sans-serif', cursor:'pointer', border:'none', background:'transparent', whiteSpace:'nowrap', color:activeDay===i?G:'rgba(248,247,244,0.4)', borderBottom:activeDay===i?`2px solid ${G}`:'2px solid transparent' }}>{label}</button>
            ))}
          </div>
        </div>
      )}

      {/* ── TIMELINE ── */}
      <section style={{ paddingTop:'3rem', paddingBottom:'3rem', paddingLeft:'1.5rem', paddingRight:'1.5rem' }}>
        <div style={{ maxWidth:'860px', margin:'0 auto' }}>
          {isMultiDay && (
            <div style={{ marginBottom:'1.75rem' }}>
              <h2 style={{ fontFamily:'"Playfair Display", serif', fontSize:'1.5rem', fontWeight:700, color:C, marginBottom:'0.25rem' }}>{dayLabels[activeDay]}</h2>
              {activeDay === 0 && <p style={{ fontSize:'0.75rem', color:'rgba(248,247,244,0.4)', fontFamily:'Montserrat, sans-serif' }}>{ARRIVAL_LABELS[arrival]}</p>}
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div key={`${plan}-day${activeDay}`} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.3 }}>
              <DayTimeline events={currentEvents} />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── HOTELES PARTNER ── */}
      {isMultiDay && (
        <section style={{ padding:'3rem 1.5rem', borderTop:'1px solid rgba(197,160,89,0.1)' }}>
          <div style={{ maxWidth:'860px', margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.4rem' }}>
              <Bed size={16} style={{ color:G }} />
              <span style={{ fontSize:'0.7rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em', color:G }}>Elegí tu alojamiento · Partners EscapaUY</span>
            </div>
            <p style={{ fontSize:'0.82rem', color:'rgba(248,247,244,0.4)', marginBottom:'1.75rem', maxWidth:'560px' }}>
              Todos son partners oficiales de EscapaUY. Seleccioná el que mejor se adapta a tu viaje de {nights} {nights===1?'noche':'noches'}.
            </p>
            <div style={{ display:'grid', gap:'1rem', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {HOTELS.map((h, i) => {
                const sel = selectedHotel === i;
                return (
                  <motion.div key={i} onClick={() => setSelectedHotel(i)} whileHover={{ y:-2 }}
                    style={{ padding:'1.5rem', borderRadius:'4px', position:'relative', cursor:'pointer', transition:'all 0.2s', background:sel?'rgba(197,160,89,0.07)':'rgba(248,247,244,0.03)', border:sel?`1.5px solid ${G}`:'1px solid rgba(248,247,244,0.08)', boxShadow:sel?'0 0 0 1px rgba(197,160,89,0.15)':'none' }}>
                    {sel && <div style={{ position:'absolute', top:'0.75rem', right:'0.75rem', width:'1.4rem', height:'1.4rem', borderRadius:'50%', background:G, display:'flex', alignItems:'center', justifyContent:'center' }}><Check size={10} color={N} /></div>}
                    <div style={{ display:'flex', justifyContent:'space-between', gap:'0.5rem', marginBottom:'0.4rem', paddingRight:sel?'1.75rem':'0' }}>
                      <h3 style={{ fontSize:'0.88rem', fontWeight:700, color:sel?G:C }}>{h.name}</h3>
                      <span style={{ fontSize:'0.65rem', color:'rgba(248,247,244,0.4)', flexShrink:0 }}>{'★'.repeat(h.stars)}</span>
                    </div>
                    <div style={{ fontSize:'0.67rem', color:'rgba(248,247,244,0.4)', marginBottom:'0.6rem' }}>📍 {h.dist}</div>
                    <span style={{ display:'inline-block', fontSize:'0.62rem', fontWeight:600, padding:'0.2rem 0.5rem', borderRadius:'4px', marginBottom:'0.75rem', background:`${h.tagColor}15`, color:h.tagColor }}>{h.tag}</span>
                    <p style={{ fontSize:'0.74rem', lineHeight:1.6, color:'rgba(248,247,244,0.5)', marginBottom:'0.85rem' }}>{h.desc}</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem', marginBottom:'0.85rem' }}>
                      {h.perks.map((p, j) => <span key={j} style={{ fontSize:'0.62rem', padding:'0.15rem 0.5rem', borderRadius:'20px', background:'rgba(248,247,244,0.06)', color:'rgba(248,247,244,0.45)', border:'1px solid rgba(248,247,244,0.08)' }}>{p}</span>)}
                    </div>
                    <div style={{ borderTop:'1px solid rgba(248,247,244,0.07)', paddingTop:'0.75rem' }}>
                      <div style={{ fontSize:'1rem', fontWeight:700, color:sel?G:C, fontFamily:'"Playfair Display", serif' }}>{h.priceLabel}</div>
                      <div style={{ fontSize:'0.64rem', color:'rgba(248,247,244,0.35)' }}>{h.note}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── ACTIVIDADES EXTRA SELECCIONADAS ── */}
      {selectedExtras.length > 0 && (
        <section style={{ padding:'2rem 1.5rem', borderTop:'1px solid rgba(197,160,89,0.1)' }}>
          <div style={{ maxWidth:'860px', margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'1rem' }}>
              <Sparkles size={15} style={{ color:G }} />
              <span style={{ fontSize:'0.7rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em', color:G }}>Actividades agregadas al paquete</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              {selectedExtras.map((e, i) => (
                <motion.div key={i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.75rem 1rem', borderRadius:'4px', background:'rgba(197,160,89,0.06)', border:'1px solid rgba(197,160,89,0.2)' }}>
                  <div>
                    <div style={{ fontSize:'0.8rem', fontWeight:600, color:G }}>{e.title}</div>
                    <div style={{ fontSize:'0.68rem', color:'rgba(248,247,244,0.4)' }}>📍 {e.location}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                    <span style={{ fontSize:'0.8rem', fontWeight:700, color: e.price === 0 ? '#34d399' : C }}>{e.priceLabel}</span>
                    <button onClick={() => removeExtra(e.title)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(248,247,244,0.3)', display:'flex', alignItems:'center' }}><Trash2 size={14} /></button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PRESUPUESTO + CHECKOUT ── */}
      <section style={{ padding:'3rem 1.5rem', borderTop:'1px solid rgba(197,160,89,0.1)' }}>
        <div style={{ maxWidth:'860px', margin:'0 auto' }}>
          <div style={{ display:'grid', gap:'2rem', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))' }}>

            {/* Desglose */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1.25rem' }}>
                <Info size={15} style={{ color:G }} />
                <span style={{ fontSize:'0.68rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em', color:G }}>Presupuesto del Paquete · Ley 17.250</span>
              </div>
              <div style={{ borderRadius:'4px', padding:'1.5rem', background:'rgba(248,247,244,0.04)', border:'1px solid rgba(197,160,89,0.15)' }}>

                {/* Experiencia */}
                <div style={{ paddingBottom:'0.75rem', marginBottom:'0.75rem', borderBottom:'1px solid rgba(248,247,244,0.07)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.3rem' }}>
                    <div style={{ fontSize:'0.8rem', fontWeight:600, color:'rgba(248,247,244,0.8)' }}>Experiencia Bodega El Legado</div>
                    <div style={{ fontSize:'0.85rem', fontWeight:700, color:C, fontFamily:'"Playfair Display", serif' }}>${EXP_LIST.toLocaleString()}</div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem' }}>
                    <span style={{ color:'rgba(248,247,244,0.4)' }}>Beneficio turista (IVA 0%)</span>
                    <span style={{ color:'#4ade80' }}>- ${EXP_IVA.toLocaleString()}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.78rem', fontWeight:600, marginTop:'0.3rem' }}>
                    <span style={{ color:'rgba(248,247,244,0.6)' }}>Subtotal experiencia</span>
                    <span style={{ color:C }}>${EXP_NET.toLocaleString()}</span>
                  </div>
                </div>

                {/* Alojamiento */}
                {isMultiDay && (
                  <div style={{ paddingBottom:'0.75rem', marginBottom:'0.75rem', borderBottom:'1px solid rgba(248,247,244,0.07)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.3rem' }}>
                      <div style={{ fontSize:'0.8rem', fontWeight:600, color:'rgba(248,247,244,0.8)' }}>{HOTELS[selectedHotel].name}</div>
                      <div style={{ fontSize:'0.85rem', fontWeight:700, color:C, fontFamily:'"Playfair Display", serif' }}>${hotelTotal.toLocaleString()}</div>
                    </div>
                    <div style={{ fontSize:'0.72rem', color:'rgba(248,247,244,0.4)' }}>
                      ${HOTELS[selectedHotel].pricePerNight.toLocaleString()} × {nights} {nights===1?'noche':'noches'}
                    </div>
                  </div>
                )}

                {/* Actividades extra */}
                {selectedExtras.filter(e => (e.price || 0) > 0).length > 0 && (
                  <div style={{ paddingBottom:'0.75rem', marginBottom:'0.75rem', borderBottom:'1px solid rgba(248,247,244,0.07)' }}>
                    <div style={{ fontSize:'0.78rem', fontWeight:600, color:'rgba(248,247,244,0.8)', marginBottom:'0.4rem' }}>Actividades personalizadas</div>
                    {selectedExtras.map((e, i) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.73rem', marginBottom:'0.2rem' }}>
                        <span style={{ color:'rgba(248,247,244,0.5)' }}>{e.title}</span>
                        <span style={{ color: e.price === 0 ? '#34d399' : C }}>{e.price === 0 ? 'Gratis' : `$${(e.price||0).toLocaleString()}`}</span>
                      </div>
                    ))}
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', fontWeight:600, marginTop:'0.4rem', paddingTop:'0.4rem', borderTop:'1px solid rgba(248,247,244,0.06)' }}>
                      <span style={{ color:'rgba(248,247,244,0.5)' }}>Subtotal actividades</span>
                      <span style={{ color:C }}>${extrasTotal.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div style={{ paddingBottom:'0.85rem', marginBottom:'0.85rem', borderBottom:'1px solid rgba(248,247,244,0.07)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'0.9rem', fontWeight:700, color:C }}>Total Paquete</span>
                    <span style={{ fontFamily:'"Playfair Display", serif', fontSize:'1.3rem', fontWeight:700, color:G }}>${packageNet.toLocaleString()}</span>
                  </div>
                </div>

                {/* Seña */}
                <div style={{ borderRadius:'4px', padding:'1rem', background:'rgba(197,160,89,0.08)', border:'1px solid rgba(197,160,89,0.2)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <div style={{ fontSize:'0.82rem', fontWeight:700, color:G }}>Seña para Congelar Reserva</div>
                      <div style={{ fontSize:'0.67rem', color:'rgba(197,160,89,0.7)' }}>15% del total · ≈ USD {depositUSD}</div>
                    </div>
                    <div style={{ fontFamily:'"Playfair Display", serif', fontSize:'1.5rem', fontWeight:700, color:G }}>${depositAmt.toLocaleString()}</div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', marginTop:'0.6rem', paddingTop:'0.5rem', borderTop:'1px solid rgba(197,160,89,0.15)' }}>
                    <span style={{ color:'rgba(197,160,89,0.6)' }}>Saldo a pagar al llegar</span>
                    <span style={{ color:'rgba(248,247,244,0.6)', fontWeight:600 }}>${balanceAmt.toLocaleString()}</span>
                  </div>
                  <p style={{ fontSize:'0.67rem', color:'rgba(248,247,244,0.35)', marginTop:'0.5rem', lineHeight:1.5 }}>Los pagos van directamente a cada partner. EscapaUY NO retiene fondos.</p>
                </div>
              </div>
            </div>

            {/* Checkout */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1.25rem' }}>
                <Shield size={15} style={{ color:G }} />
                <span style={{ fontSize:'0.68rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em', color:G }}>Confirmar Reserva</span>
              </div>
              <div style={{ borderRadius:'4px', padding:'1.5rem', background:'rgba(248,247,244,0.04)', border:'1px solid rgba(197,160,89,0.15)' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.55rem', marginBottom:'1.25rem' }}>
                  {[
                    { l:'Experiencia', v:'Bodega El Legado — Carmelo' },
                    { l:'Plan activo', v:plan==='A'?'Plan A (Sol)':'Plan B (Lluvia)', vc:plan==='A'?G:'#60a5fa' },
                    ...(isMultiDay?[
                      { l:'Alojamiento', v:HOTELS[selectedHotel].name, vc:G },
                      { l:'Estadía', v:`${nights} ${nights===1?'noche':'noches'}` },
                    ]:[]),
                    ...(selectedExtras.length>0?[{ l:'Actividades extra', v:`${selectedExtras.length} actividad${selectedExtras.length>1?'es':''}`, vc:'#818cf8' }]:[]),
                    { l:'Total paquete', v:`$UY ${packageNet.toLocaleString()}`, vc:G, bold:true },
                  ].map((row: any, i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', ...(row.bold?{ paddingTop:'0.5rem', borderTop:'1px solid rgba(248,247,244,0.08)', fontWeight:700 }:{}) }}>
                      <span style={{ color:'rgba(248,247,244,0.55)' }}>{row.l}</span>
                      <span style={{ color:row.vc||C, fontWeight:row.bold?700:500 }}>{row.v}</span>
                    </div>
                  ))}
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.88rem', fontWeight:700, paddingTop:'0.5rem', borderTop:'1px solid rgba(248,247,244,0.08)' }}>
                    <span style={{ color:C }}>Seña a pagar ahora</span>
                    <span style={{ color:G }}>$UY {depositAmt.toLocaleString()}</span>
                  </div>
                </div>

                <button onClick={() => setLegalAccepted(v => !v)} type="button"
                  style={{ display:'flex', alignItems:'flex-start', gap:'0.6rem', textAlign:'left', width:'100%', background:'transparent', border:'none', cursor:'pointer', marginBottom:'1.25rem' }}>
                  <div style={{ marginTop:'0.1rem', flexShrink:0 }}>
                    {legalAccepted ? <CheckSquare size={18} style={{ color:G }} /> : <Square size={18} style={{ color:'rgba(248,247,244,0.4)' }} />}
                  </div>
                  <p style={{ fontSize:'0.72rem', lineHeight:1.6, color:'rgba(248,247,244,0.5)', fontFamily:'Montserrat, sans-serif' }}>
                    Acepto que por tratarse de servicios turísticos con fecha determinada, <strong style={{ color:C }}>no aplica el derecho de retracto de 5 días</strong> (Art. 16, Ley 17.250). La seña confirma la reserva.
                  </p>
                </button>

                {/* Botón demo — simula pago y genera vouchers QR */}
                <button
                  onClick={() => { if (legalAccepted) setSimulated(true); }}
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem', width:'100%', padding:'1rem', borderRadius:'4px', fontWeight:700, fontSize:'0.85rem', fontFamily:'Montserrat, sans-serif', border:'none', background:legalAccepted?G:'rgba(197,160,89,0.15)', color:legalAccepted?N:'rgba(248,247,244,0.3)', cursor:legalAccepted?'pointer':'not-allowed', boxShadow:legalAccepted?'0 8px 24px rgba(197,160,89,0.22)':'none' }}>
                  ⚡ Simular Pago y Ver Voucher QR
                </button>

                <p style={{ fontSize:'0.67rem', textAlign:'center', color:'rgba(248,247,244,0.28)', marginTop:'0.9rem', lineHeight:1.5 }}>
                  EscapaUY retiene el 15% como seña de plataforma. El saldo (85%) se abona directamente al partner con el voucher QR.
                </p>

                {/* Modal de vouchers QR por servicio */}
                {simulated && (
                  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.80)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
                    onClick={() => setSimulated(false)}>
                    <div style={{ background:'#f8f7f4', borderRadius:'16px', maxWidth:'480px', width:'100%', maxHeight:'90vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.5)' }}
                      onClick={e => e.stopPropagation()}>

                      {/* Header */}
                      <div style={{ background:'linear-gradient(135deg, #1a1f2c, #2d3748)', color:'#fff', padding:'1.25rem 1.5rem', flexShrink:0 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div>
                            <div style={{ fontSize:'1.5rem', marginBottom:'0.15rem' }}>✅</div>
                            <h3 style={{ fontFamily:'Montserrat, sans-serif', fontWeight:700, fontSize:'1rem', margin:0 }}>¡Seña Confirmada · {bookingRef}</h3>
                            <p style={{ fontSize:'0.7rem', opacity:0.6, marginTop:'0.2rem', fontFamily:'Montserrat, sans-serif' }}>{voucherList.length} voucher{voucherList.length!==1?'s':''} generado{voucherList.length!==1?'s':''} · uno por servicio</p>
                          </div>
                          <button onClick={() => setSimulated(false)} style={{ background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', borderRadius:'8px', padding:'0.4rem 0.7rem', cursor:'pointer', fontSize:'0.8rem', fontFamily:'Montserrat, sans-serif' }}>✕</button>
                        </div>
                        {/* Tabs de vouchers */}
                        <div style={{ display:'flex', gap:'0.4rem', marginTop:'1rem', overflowX:'auto', paddingBottom:'0.1rem' }}>
                          {voucherList.map((v, i) => (
                            <button key={i} onClick={() => setActiveVoucher(i)}
                              style={{ flexShrink:0, padding:'0.3rem 0.7rem', borderRadius:'20px', border:'none', cursor:'pointer', fontFamily:'Montserrat, sans-serif', fontSize:'0.65rem', fontWeight:600,
                                background: activeVoucher===i ? '#C5A059' : 'rgba(255,255,255,0.12)',
                                color: activeVoucher===i ? '#1a1f2c' : 'rgba(255,255,255,0.7)' }}>
                              {v.day}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Voucher activo */}
                      {voucherList.length > 0 && (() => {
                        const v = voucherList[activeVoucher] || voucherList[0];
                        const qrData = JSON.stringify({ ref: bookingRef + '-' + v.id, service: v.name, partner: v.partnerName, rut: v.rut, balance: v.balance });
                        return (
                          <div style={{ overflowY:'auto', flex:1 }}>
                            {/* Partner legal */}
                            <div style={{ padding:'1rem 1.25rem', background:'#fff', borderBottom:'1px solid #eee' }}>
                              <div style={{ fontSize:'0.65rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#C5A059', marginBottom:'0.4rem' }}>Partner · {v.type}</div>
                              <div style={{ fontSize:'0.9rem', fontWeight:700, color:'#1a1f2c', marginBottom:'0.15rem' }}>{v.partnerName}</div>
                              <div style={{ fontSize:'0.72rem', color:'#555', lineHeight:1.6 }}>
                                <div>📋 Razón Social: <strong>{v.razonSocial}</strong></div>
                                <div>🏛 RUT: <strong>{v.rut}</strong></div>
                                <div>📍 {v.address}</div>
                                <div>📞 {v.phone}</div>
                              </div>
                            </div>

                            {/* Servicio */}
                            <div style={{ padding:'0.85rem 1.25rem', background:'#f0f4ff', borderBottom:'1px solid #e0e8ff' }}>
                              <div style={{ fontSize:'0.72rem', fontWeight:600, color:'#3b5bdb' }}>{v.name}</div>
                              <div style={{ fontSize:'0.68rem', color:'#555', marginTop:'0.2rem' }}>{v.day} · {v.type}</div>
                            </div>

                            {/* Desglose de pago */}
                            <div style={{ padding:'1rem 1.25rem', background:'#fff', borderBottom:'1px solid #eee' }}>
                              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.78rem', marginBottom:'0.45rem', color:'#1a73e8', fontWeight:600 }}>
                                <span>✓ Seña abonada a EscapaUY (15%)</span>
                                <span>${v.deposit.toLocaleString()}</span>
                              </div>
                              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.85rem', fontWeight:700, padding:'0.6rem 0.75rem', borderRadius:'8px', background:'#fff8e6', border:'2px solid #C5A059', color:'#7a5c00' }}>
                                <span>💵 Saldo a pagar en {v.partnerName}</span>
                                <span>${v.balance.toLocaleString()}</span>
                              </div>
                              <div style={{ fontSize:'0.65rem', color:'#999', marginTop:'0.5rem', textAlign:'center' }}>Precio en $UY · orientativo · IVA incluido</div>
                            </div>

                            {/* QR */}
                            <div style={{ padding:'1.25rem', textAlign:'center', background:'#fff' }}>
                              <p style={{ fontSize:'0.68rem', fontWeight:700, color:'#333', marginBottom:'0.75rem', fontFamily:'Montserrat, sans-serif', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                                📲 Presentar este QR en {v.partnerName}
                              </p>
                              <div style={{ display:'inline-block', padding:'12px', border:'2px solid #1a1f2c', borderRadius:'12px', background:'#fff', boxShadow:'0 4px 12px rgba(0,0,0,0.08)' }}>
                                <QRCodeSVG value={qrData} size={140} level="H" includeMargin={false} />
                              </div>
                              <p style={{ fontSize:'0.62rem', color:'#aaa', marginTop:'0.5rem', fontFamily:'Montserrat, sans-serif', letterSpacing:'0.05em' }}>{bookingRef}-{v.id.toUpperCase()}</p>
                              <p style={{ fontSize:'0.68rem', color:'#666', marginTop:'0.2rem', lineHeight:1.5 }}>
                                Mostrá o imprimí · pagás ${v.balance.toLocaleString()} directamente allí
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Footer */}
                      <div style={{ padding:'0.9rem 1.25rem', background:'#1a1f2c', flexShrink:0, display:'flex', gap:'0.6rem' }}>
                        <button onClick={() => window.print()}
                          style={{ flex:1, padding:'0.65rem', background:'#C5A059', color:'#1a1f2c', border:'none', borderRadius:'8px', fontWeight:700, fontSize:'0.78rem', cursor:'pointer', fontFamily:'Montserrat, sans-serif' }}>
                          🖨️ Imprimir todos
                        </button>
                        <button onClick={() => setSimulated(false)}
                          style={{ flex:1, padding:'0.65rem', background:'rgba(255,255,255,0.1)', color:'#fff', border:'none', borderRadius:'8px', fontWeight:600, fontSize:'0.78rem', cursor:'pointer', fontFamily:'Montserrat, sans-serif' }}>
                          Cerrar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding:'2.5rem 1.5rem', textAlign:'center', borderTop:'1px solid rgba(197,160,89,0.07)' }}>
        <Link to="/adn-viajero" style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', fontSize:'0.82rem', color:'rgba(197,160,89,0.65)', textDecoration:'none' }}>
          <ArrowRight size={14} style={{ transform:'rotate(180deg)' }} /> Diseñar otra escapada
        </Link>
      </section>
    </div>
  );
}

export default ItinerarioSimuladoPage;
