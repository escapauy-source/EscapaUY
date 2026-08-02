import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Users, Baby, UserPlus,
  Sparkles, ArrowRight, ArrowLeft, Check,
  Wine, CloudLightning, Sun, UtensilsCrossed,
  MapPin, Camera, Bike, Leaf, Coffee, Music, Star, BookOpen
} from 'lucide-react';

const N = '#1A1F2C'; const G = '#C5A059'; const C = '#F8F7F4';

const CONTEXTS = [
  { id: 'solo',    emoji: '🧭', label: 'Solo/a',     desc: 'Libertad total de horarios y ritmo',  Icon: User },
  { id: 'pareja',  emoji: '💑', label: 'En Pareja',  desc: 'Experiencias románticas e íntimas',   Icon: Users },
  { id: 'familia', emoji: '👨‍👩‍👧', label: 'Familia',   desc: 'Actividades para todos, sin estrés', Icon: Baby },
  { id: 'amigos',  emoji: '🥂', label: 'Con Amigos', desc: 'Social, divertido, para contar',      Icon: UserPlus },
];

type Scenario = {
  id: string; title: string; desc: string;
  Icon: React.FC<{ size?: number; color?: string }>;
  color: string; tag: string;
};

const SCENARIOS: Record<string, Scenario[]> = {
  solo: [
    { id: 'cellar',   title: 'Cata privada en bodega subterránea',    desc: 'Cava de piedra, 14°C, sommelier solo para vos. Sin grupos, sin ruido.',          Icon: Wine,            color: '#a78bfa', tag: 'Exclusivo · Contemplativo' },
    { id: 'rural',    title: 'Caminata libre por rutas rurales',       desc: 'Senderos entre olivos y vides, silencio total. Tu ritmo, tu mapa.',              Icon: Bike,            color: '#f97316', tag: 'Outdoor · Activo' },
    { id: 'heritage', title: 'Recorrido patrimonial en Conchillas',    desc: 'Arquitectura victoriana intacta. Ideal para explorar solo y a tu paso.',         Icon: Camera,          color: '#818cf8', tag: 'Cultura · Sin guía fijo' },
    { id: 'writer',   title: 'Almuerzo y lectura en viñedo',           desc: 'Mesa tranquila entre hileras de Tannat. Tiempo, vino y un libro. Nada más.',     Icon: BookOpen,        color: G,         tag: 'Relax · Gastronómico' },
    { id: 'artisan',  title: 'Taller artesanal en quesería boutique',  desc: 'Aprendé a hacer queso en Nueva Helvecia. Experiencia de autor, sin prisa.',      Icon: UtensilsCrossed, color: '#16a34a', tag: 'Cultural · Hands-on' },
    { id: 'storm',    title: 'Plan lluvia: maridaje a solas en cava',  desc: 'Coctelería de autor y maridaje privado bajo tierra. El plan B más tranquilo.',   Icon: CloudLightning,  color: '#60a5fa', tag: 'Plan B · Premium' },
  ],
  pareja: [
    { id: 'dinner',   title: 'Cena romántica en terraza de viñedo',    desc: 'Mesa para dos, velas, vino de la región y vista al Río Uruguay al atardecer.',   Icon: Star,            color: G,         tag: 'Romántico · Gastronómico' },
    { id: 'cellar',   title: 'Cata íntima en cava privada',            desc: 'Solo ustedes dos, un sommelier y 4 etiquetas de autor. 75 minutos de intimidad.', Icon: Wine,            color: '#a78bfa', tag: 'Íntimo · Premium' },
    { id: 'picnic',   title: 'Picnic entre olivares y viñedos',        desc: 'Cesta preparada por la bodega. Tapiz entre filas de vides, sin nadie alrededor.', Icon: Leaf,            color: '#16a34a', tag: 'Romántico · Aire libre' },
    { id: 'heritage', title: 'Paseo por Conchillas y café de época',   desc: 'El pueblo victoriano más fotogénico de Colonia. Perfecto para caminar juntos.',   Icon: Camera,          color: '#818cf8', tag: 'Cultura · Tranquilo' },
    { id: 'artisan',  title: 'Taller de maridaje para dos',            desc: 'Aprendan juntos a maridar quesos y vinos artesanales. Experiencia interactiva.',  Icon: UtensilsCrossed, color: '#f59e0b', tag: 'Experiencial · Íntimo' },
    { id: 'storm',    title: 'Plan lluvia: noche en cava con chimenea', desc: 'Salón privado, fuego, maridaje y música en vivo. La lluvia pasa a ser el plan A.', Icon: CloudLightning, color: '#60a5fa', tag: 'Plan B · Romántico' },
  ],
  familia: [
    { id: 'farm',     title: 'Visita a granja y quesería (apta niños)', desc: 'Los chicos ven cómo se ordeña y hacen su propio queso. Diversión garantizada.',  Icon: Leaf,            color: '#16a34a', tag: 'Familiar · Educativo' },
    { id: 'artisan',  title: 'Taller de cocina artesanal con los chicos', desc: 'Hacer pan, dulces y queso junto a productores locales. Limpio y divertido.',   Icon: UtensilsCrossed, color: '#f97316', tag: 'Hands-on · Todas las edades' },
    { id: 'rural',    title: 'Caminata corta por senderos rurales',     desc: 'Rutas planas entre olivos y ovejas. Distancias cortas, mucho para ver.',          Icon: Bike,            color: '#34d399', tag: 'Outdoor · Accesible' },
    { id: 'heritage', title: 'Conchillas: el pueblo del tiempo detenido', desc: 'Calles de piedra, casas victorianas y parque central tranquilo. Ideal familias.', Icon: Camera,         color: '#818cf8', tag: 'Cultural · Seguro' },
    { id: 'lunch',    title: 'Almuerzo familiar en parque rural',       desc: 'Espacio amplio al aire libre, menú de campo para niños y adultos, sin apuros.',    Icon: Coffee,          color: G,         tag: 'Gastronómico · Familiar' },
    { id: 'storm',    title: 'Plan lluvia: taller cubierto de elaboración', desc: 'Si llueve, el taller artesanal techado los espera. Los chicos disfrutan más adentro.', Icon: CloudLightning, color: '#60a5fa', tag: 'Plan B · Techado · Niños' },
  ],
  amigos: [
    { id: 'group',    title: 'Cata grupal animada en bodega',           desc: 'Mesa larga, 6 etiquetas, sommelier que cuenta historias. Ideal para el grupo.',    Icon: Wine,            color: '#a78bfa', tag: 'Social · Divertido' },
    { id: 'lunch',    title: 'Almuerzo largo entre viñedos',            desc: 'Mesa de campo, vino de la región, 3 horas y buena conversación. Sin apuros.',      Icon: UtensilsCrossed, color: G,         tag: 'Gastronómico · Grupal' },
    { id: 'bike',     title: 'Recorrido en bici por rutas rurales',     desc: 'Bicicletas para todo el grupo, senderos entre olivares y bodegas. Activo.',        Icon: Bike,            color: '#f97316', tag: 'Aventura · Grupal' },
    { id: 'music',    title: 'Cena con música en vivo en la bodega',    desc: 'La bodega abre su salón: vino, gastronomía local y artista invitado.',             Icon: Music,           color: '#f59e0b', tag: 'Festivo · Nocturno' },
    { id: 'artisan',  title: 'Taller colectivo de maridaje',            desc: 'Cada uno elige su combinación ganadora. El grupo vota. Hay risas y buen vino.',    Icon: Star,            color: '#34d399', tag: 'Interactivo · Grupal' },
    { id: 'storm',    title: 'Plan lluvia: coctelería de autor en cava', desc: 'Bartender privado, cava subterránea y playlist a elección del grupo.',             Icon: CloudLightning,  color: '#60a5fa', tag: 'Plan B · Fiesta · Techado' },
  ],
};

const STEP2_TITLES: Record<string, string> = {
  solo:    '¿Qué te llama más para vos solo/a?',
  pareja:  '¿Qué experiencia soñarían juntos?',
  familia: '¿Qué actividades quieren los suyos?',
  amigos:  '¿Cómo quieren que sea el plan grupal?',
};

const ARRIVAL_OPTIONS = [
  { id: 'mañana', emoji: '🌅', label: 'Mañana', desc: 'Antes de las 12 h' },
  { id: 'tarde',  emoji: '🌇', label: 'Tarde',  desc: 'Entre 12 y 18 h'  },
  { id: 'noche',  emoji: '🌙', label: 'Noche',  desc: 'Después de las 18 h' },
];

function Loader() {
  return (
    <div style={{
      minHeight: '70vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem', textAlign: 'center',
    }}>
      <div style={{ position: 'relative', width: '5rem', height: '5rem', marginBottom: '2rem' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid rgba(197,160,89,0.15)', borderTopColor: G,
          }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', inset: '8px', borderRadius: '50%',
            border: '2px solid rgba(197,160,89,0.08)',
            borderBottomColor: 'rgba(197,160,89,0.4)',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={22} color={G} />
        </div>
      </div>
      <motion.p
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          fontFamily: '"Playfair Display", serif',
          fontSize: '1.5rem', fontWeight: 700, color: C, marginBottom: '0.75rem',
        }}
      >
        Procesando tu perfil...
      </motion.p>
      <p style={{
        fontSize: '0.85rem', color: 'rgba(248,247,244,0.5)',
        maxWidth: '400px', lineHeight: 1.7,
      }}>
        La IA está analizando tu ADN viajero y cruzando datos con el radar
        meteorológico de Colonia para diseñar tu escapada perfecta.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem' }}>
        {[0,1,2].map(i => (
          <motion.div
            key={i}
            style={{ width: '8px', height: '8px', borderRadius: '50%', background: G }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

export function WizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ctx, setCtx] = useState('');
  const [imgs, setImgs] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '', email: '', whatsapp: '',
    arrivalTime: '', dateStart: '', dateEnd: '',
  });

  const selectCtx = (id: string) => { setCtx(id); setImgs([]); };

  const toggleImg = (id: string) => {
    setImgs(p => p.includes(id) ? p.filter(x => x !== id) : p.length < 3 ? [...p, id] : p);
  };

  const calcDuration = () => {
    if (!form.dateStart || !form.dateEnd) return null;
    const diff = Math.round(
      (new Date(form.dateEnd).getTime() - new Date(form.dateStart).getTime()) / 86400000
    );
    if (diff <= 0) return null;
    return diff === 1 ? '1 noche' : `${diff} noches`;
  };

  const formOk =
    !!form.name && !!form.email && !!form.whatsapp &&
    !!form.arrivalTime && !!form.dateStart && !!form.dateEnd;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOk) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 2500));
    sessionStorage.setItem('wizardData', JSON.stringify({ ctx, imgs, ...form }));
    navigate('/itinerario-simulado');
  };

  if (loading) return <div style={{ background: N, minHeight: '100vh' }}><Loader /></div>;

  const currentScenarios = ctx ? SCENARIOS[ctx] : [];
  const step2Title = ctx ? STEP2_TITLES[ctx] : '¿Qué te llama más?';

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '4px',
    border: '1px solid rgba(248,247,244,0.12)',
    background: 'rgba(248,247,244,0.05)',
    color: C, fontFamily: 'Montserrat, sans-serif', fontSize: '0.875rem',
    outline: 'none', caretColor: G, boxSizing: 'border-box',
  };

  const btnBack: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.7rem 1.2rem', borderRadius: '4px',
    border: '1px solid rgba(248,247,244,0.12)',
    background: 'transparent', color: 'rgba(248,247,244,0.55)',
    cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem',
  };

  return (
    <div style={{ background: N, minHeight: '100vh', fontFamily: 'Montserrat, sans-serif' }}>

      {/* ── Barra de progreso ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        padding: '1rem 1.5rem', background: N,
        borderBottom: '1px solid rgba(197,160,89,0.08)',
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.3rem' }}>
            {[1,2,3].map(s => (
              <div key={s} style={{
                flex: 1, height: '3px', borderRadius: '2px',
                overflow: 'hidden', background: 'rgba(248,247,244,0.08)',
              }}>
                <motion.div
                  style={{ height: '100%', background: G }}
                  animate={{ width: step >= s ? '100%' : '0%' }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            ))}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '0.7rem', color: 'rgba(248,247,244,0.4)',
          }}>
            <span>Paso {step} de 3</span>
            <span style={{ color: G }}>ADN Viajero</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <AnimatePresence mode="wait">

          {/* ── PASO 1: Contexto ── */}
          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}
            >
              <h2 style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: '2rem', fontWeight: 700, color: C, marginBottom: '0.4rem',
              }}>¿Cómo viajás?</h2>
              <p style={{
                fontSize: '0.85rem', color: 'rgba(248,247,244,0.5)', marginBottom: '2rem',
              }}>
                Tu respuesta define qué tipo de experiencias te vamos a proponer.
                Cada perfil es completamente diferente.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {CONTEXTS.map(({ id, emoji, label, desc }) => {
                  const sel = ctx === id;
                  return (
                    <button
                      key={id}
                      onClick={() => selectCtx(id)}
                      style={{
                        position: 'relative', padding: '1.5rem', borderRadius: '4px',
                        textAlign: 'left', cursor: 'pointer',
                        fontFamily: 'Montserrat, sans-serif',
                        transition: 'all 0.2s', border: 'none',
                        background: sel ? 'rgba(197,160,89,0.1)' : 'rgba(248,247,244,0.04)',
                        outline: sel ? '1.5px solid #C5A059' : '1px solid rgba(248,247,244,0.08)',
                      }}
                    >
                      {sel && (
                        <div style={{
                          position: 'absolute', top: '0.6rem', right: '0.6rem',
                          width: '1.2rem', height: '1.2rem', borderRadius: '50%',
                          background: G, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Check size={10} color={N} />
                        </div>
                      )}
                      <div style={{ fontSize: '1.8rem', marginBottom: '0.6rem' }}>{emoji}</div>
                      <div style={{
                        fontWeight: 600, fontSize: '0.9rem',
                        color: sel ? G : C, marginBottom: '0.2rem',
                      }}>{label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(248,247,244,0.45)' }}>{desc}</div>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  onClick={() => setStep(2)}
                  disabled={!ctx}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.75rem 1.75rem', borderRadius: '4px', border: 'none',
                    cursor: ctx ? 'pointer' : 'not-allowed',
                    fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '0.875rem',
                    background: ctx ? G : 'rgba(197,160,89,0.2)',
                    color: N, opacity: ctx ? 1 : 0.4,
                  }}
                >
                  Continuar <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── PASO 2: Escenarios ── */}
          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}
            >
              <h2 style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: '1.9rem', fontWeight: 700, color: C, marginBottom: '0.4rem',
              }}>{step2Title}</h2>
              <p style={{
                fontSize: '0.85rem', color: 'rgba(248,247,244,0.5)', marginBottom: '0.3rem',
              }}>Elegí entre 2 y 3 escenarios que más te representen.</p>
              <p style={{
                fontSize: '0.78rem', fontWeight: 600, color: G, marginBottom: '1.75rem',
              }}>{imgs.length}/3 seleccionados</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {currentScenarios.map(({ id, title, desc, Icon, color, tag }) => {
                  const sel = imgs.includes(id);
                  const maxed = imgs.length >= 3 && !sel;
                  return (
                    <button
                      key={id}
                      onClick={() => !maxed && toggleImg(id)}
                      disabled={maxed}
                      style={{
                        position: 'relative', padding: '1.25rem', borderRadius: '4px',
                        textAlign: 'left', cursor: maxed ? 'not-allowed' : 'pointer',
                        fontFamily: 'Montserrat, sans-serif',
                        transition: 'all 0.2s', border: 'none', opacity: maxed ? 0.3 : 1,
                        background: sel ? 'rgba(197,160,89,0.08)' : 'rgba(248,247,244,0.03)',
                        outline: sel ? '1.5px solid #C5A059' : '1px solid rgba(248,247,244,0.07)',
                      }}
                    >
                      {sel && (
                        <div style={{
                          position: 'absolute', top: '0.6rem', right: '0.6rem',
                          width: '1.2rem', height: '1.2rem', borderRadius: '50%',
                          background: G, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Check size={10} color={N} />
                        </div>
                      )}
                      <div style={{
                        width: '2.2rem', height: '2.2rem', borderRadius: '4px',
                        background: `${color}1a`, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem',
                      }}>
                        <Icon size={16} color={color} />
                      </div>
                      <div style={{
                        fontWeight: 600, fontSize: '0.82rem',
                        color: sel ? G : C, marginBottom: '0.3rem', lineHeight: 1.3,
                      }}>{title}</div>
                      <p style={{
                        fontSize: '0.72rem', color: 'rgba(248,247,244,0.45)',
                        lineHeight: 1.5, marginBottom: '0.6rem',
                      }}>{desc}</p>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 600,
                        padding: '0.2rem 0.5rem', borderRadius: '4px',
                        background: 'rgba(197,160,89,0.08)', color: 'rgba(197,160,89,0.75)',
                      }}>{tag}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <button onClick={() => setStep(1)} style={btnBack}>
                  <ArrowLeft size={15} /> Atrás
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={imgs.length < 2}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.75rem 1.75rem', borderRadius: '4px', border: 'none',
                    cursor: imgs.length >= 2 ? 'pointer' : 'not-allowed',
                    fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '0.875rem',
                    background: imgs.length >= 2 ? G : 'rgba(197,160,89,0.2)',
                    color: N, opacity: imgs.length >= 2 ? 1 : 0.4,
                  }}
                >
                  Continuar <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── PASO 3: Datos + Horario + Fechas ── */}
          {step === 3 && (
            <motion.div
              key="s3"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}
            >
              <h2 style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: '2rem', fontWeight: 700, color: C, marginBottom: '0.4rem',
              }}>Casi listo</h2>
              <p style={{
                fontSize: '0.85rem', color: 'rgba(248,247,244,0.5)', marginBottom: '2rem',
              }}>Completá tus datos para recibir tu itinerario personalizado. Sin spam, prometido.</p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Nombre / Email / WhatsApp */}
                {([
                  { key: 'name',     label: 'Nombre *',            type: 'text',  placeholder: 'Tu nombre' },
                  { key: 'email',    label: 'Correo Electrónico *', type: 'email', placeholder: 'tu@email.com' },
                  { key: 'whatsapp', label: 'WhatsApp *',           type: 'tel',   placeholder: '+598 9X XXX XXX' },
                ] as const).map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label style={{
                      display: 'block', fontSize: '0.7rem', fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                      color: 'rgba(248,247,244,0.45)', marginBottom: '0.5rem',
                    }}>{label}</label>
                    <input
                      type={type}
                      required
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      style={{ ...inputStyle, colorScheme: 'dark' }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(197,160,89,0.6)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'rgba(248,247,244,0.12)')}
                    />
                  </div>
                ))}

                {/* Horario de llegada */}
                <div>
                  <label style={{
                    display: 'block', fontSize: '0.7rem', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    color: 'rgba(248,247,244,0.45)', marginBottom: '0.5rem',
                  }}>
                    ¿A qué hora llegás? *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    {ARRIVAL_OPTIONS.map(({ id, emoji, label, desc }) => {
                      const sel = form.arrivalTime === id;
                      const btnStyle: React.CSSProperties = {
                        padding: '0.85rem 0.5rem',
                        borderRadius: '4px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        fontFamily: 'Montserrat, sans-serif',
                        border: 'none',
                        transition: 'all 0.18s',
                        background: sel ? 'rgba(197,160,89,0.1)' : 'rgba(248,247,244,0.04)',
                        outline: sel
                          ? '1.5px solid #C5A059'
                          : '1px solid rgba(248,247,244,0.08)',
                      };
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setForm(p => ({ ...p, arrivalTime: id }))}
                          style={btnStyle}
                        >
                          <div style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>{emoji}</div>
                          <div style={{
                            fontSize: '0.78rem', fontWeight: 600,
                            color: sel ? G : C, marginBottom: '0.1rem',
                          }}>{label}</div>
                          <div style={{
                            fontSize: '0.65rem',
                            color: 'rgba(248,247,244,0.4)',
                            lineHeight: 1.3,
                          }}>{desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rango de fechas */}
                <div>
                  <label style={{
                    display: 'block', fontSize: '0.7rem', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    color: 'rgba(248,247,244,0.45)', marginBottom: '0.5rem',
                  }}>
                    Fechas del Viaje *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{
                        display: 'block', fontSize: '0.68rem',
                        color: 'rgba(248,247,244,0.35)', marginBottom: '0.35rem',
                      }}>Llegada</label>
                      <input
                        type="date"
                        required
                        value={form.dateStart}
                        onChange={e => setForm(p => ({
                          ...p,
                          dateStart: e.target.value,
                          dateEnd: p.dateEnd && p.dateEnd < e.target.value ? '' : p.dateEnd,
                        }))}
                        style={{ ...inputStyle, colorScheme: 'dark' }}
                        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(197,160,89,0.6)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(248,247,244,0.12)')}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block', fontSize: '0.68rem',
                        color: 'rgba(248,247,244,0.35)', marginBottom: '0.35rem',
                      }}>Salida</label>
                      <input
                        type="date"
                        required
                        value={form.dateEnd}
                        min={form.dateStart || undefined}
                        onChange={e => setForm(p => ({ ...p, dateEnd: e.target.value }))}
                        style={{ ...inputStyle, colorScheme: 'dark' }}
                        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(197,160,89,0.6)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(248,247,244,0.12)')}
                      />
                    </div>
                  </div>
                  {calcDuration() && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        marginTop: '0.6rem',
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.3rem 0.75rem', borderRadius: '4px',
                        background: 'rgba(197,160,89,0.08)',
                        border: '1px solid rgba(197,160,89,0.2)',
                      }}
                    >
                      <Sun size={12} color={G} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: G }}>
                        {calcDuration()}
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Botones */}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
                  <button type="button" onClick={() => setStep(2)} style={btnBack}>
                    <ArrowLeft size={15} /> Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={!formOk}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.75rem 1.75rem', borderRadius: '4px', border: 'none',
                      cursor: formOk ? 'pointer' : 'not-allowed',
                      fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '0.875rem',
                      background: formOk ? G : 'rgba(197,160,89,0.2)',
                      color: N, opacity: formOk ? 1 : 0.45,
                    }}
                  >
                    <Sparkles size={16} /> Generar mi Itinerario
                  </button>
                </div>

                <p style={{
                  fontSize: '0.7rem', textAlign: 'center',
                  color: 'rgba(248,247,244,0.3)', marginTop: '0.25rem',
                }}>
                  Tus datos se usan únicamente para diseñar tu escapada. Ver{' '}
                  <a href="/privacidad" style={{ color: G, textDecoration: 'underline' }}>
                    Política de Privacidad (URCDP)
                  </a>.
                </p>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
