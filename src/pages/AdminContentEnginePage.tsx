import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Sparkles, ArrowLeft, Loader2,
    Instagram, Facebook, Image as ImageIcon, Copy, Check, Save,
    Zap, BrainCircuit, PenTool, FileCheck, Upload, X, Download
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';

interface HistoryItem {
    id: string;
    topic: string;
    partner: string;
    tone: string;
    result: ContentResult;
    partner_photos: string[];
    created_at: string;
}

interface ContentResult {
    blog: {
        es: string;
        en: string;
        title_es: string;
        title_en: string;
    };
    social: {
        instagram_carousel: {
            slides: string[];
            caption: string;
            hashtags: string;
        };
        instagram_lifestyle: {
            image_prompt: string;
            caption: string;
        };
        facebook_news: {
            headline: string;
            body: string;
            cta: string;
        };
    };
}

export function AdminContentEnginePage() {
    const [topic, setTopic] = useState('');
    const [partner, setPartner] = useState('');
    const [tone, setTone] = useState<'Inspirador' | 'Educativo' | 'Urgente'>('Inspirador');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<ContentResult | null>(null);
    const [copyStatus, setCopyStatus] = useState<string | null>(null);
    const [partnerPhotos, setPartnerPhotos] = useState<string[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('content_generations')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;
            setHistory(data || []);
        } catch (error: any) {
            console.error('Error fetching history:', error.message);
        }
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopyStatus(id);
        setTimeout(() => setCopyStatus(null), 2000);
        toast.success('Copiado al portapapeles');
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const loadingToast = toast.loading('Subiendo fotos del partner...');

        try {
            const newPhotos: string[] = [];
            for (const file of Array.from(files)) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${partner.replace(/\s+/g, '-')}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `partners/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('blog-images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('blog-images')
                    .getPublicUrl(filePath);

                newPhotos.push(publicUrl);
            }

            setPartnerPhotos(prev => [...prev, ...newPhotos]);
            toast.success('¡Fotos reales añadidas con éxito!', { id: loadingToast });
        } catch (error: any) {
            console.error('Error uploading photos:', error.message);
            toast.error('Error al subir fotos: ' + error.message, { id: loadingToast });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removePhoto = (index: number) => {
        setPartnerPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic || !partner) {
            toast.error('Por favor completa el tema y el partner');
            return;
        }

        setIsGenerating(true);
        try {
            const { data, error } = await supabase.functions.invoke('content-engine', {
                body: { topic, partner, tone }
            });

            if (error) throw error;
            setResult(data);
            toast.success('¡Contenido generado con éxito!');
        } catch (error: any) {
            console.warn('[CONTENT_ENGINE_DEBUG] Falló la API real, activando Modo Simulación...', error.message);

            setTimeout(() => {
                setResult({
                    blog: {
                        title_es: `El alma de ${partner}: Una historia entre texturas y calma`,
                        title_en: `The soul of ${partner}: A story of textures and calm`,
                        es: `# Crónica: El refugio secreto en ${partner}\n\nHay lugares donde el murmullo del viento cuenta más que las palabras. Al llegar a **${partner}**, uno comprende de inmediato que no se trata de una reserva, sino de un encuentro con la historia local.\n\n## Un rincón con memoria\nLa arquitectura de este lugar susurra relatos de generaciones pasadas. Los dueños han logrado algo difícil: mantener la esencia rústica mientras elevan la experiencia a un lujo sutil y reconfortante.\n\n> "Aquí, el lujo no es lo que brilla, sino el silencio que te rodea."\n\n### Tu fin de semana ideal\nPara vivir la experiencia completa, te sugerimos:\n- **Mañana**: Un paseo por los senderos cercanos donde la flora nativa cobra vida.\n- **Tarde**: Visitar la pequeña feria de artesanos a solo 10 minutos, un tesoro escondido.\n- **Noche**: Regresar a ${partner} para una cena bajo las estrellas.\n\n---\n*EscapaUY facilita tu llegada a este rincón, garantizando que cada detalle, desde el aforo hasta el plan B, esté bajo nuestro sello de exclusividad.*\n\n**¿Sientes el llamado de ${partner}?**\n[Reserva tu historia aquí]`,
                        en: `# Chronicle: The secret retreat at ${partner}\n\nThere are places where the murmur of the wind tells more than words. Upon arriving at **${partner}**, one immediately understands that it is not just a reservation, but an encounter with local history.\n\n## A corner with memory\nThe architecture of this place whispers tales of past generations. The owners have achieved something difficult: maintaining the rustic essence while elevating the experience to a subtle and comforting luxury.\n\n### Your ideal weekend\nTo live the full experience, we suggest:\n- **Morning**: A walk through the nearby trails where native flora comes to life.\n- **Afternoon**: Visit the small artisan fair just 10 minutes away, a hidden treasure.\n- **Night**: Return to ${partner} for a dinner under the stars.\n\n---\n*EscapaUY facilitates your arrival at this corner, ensuring that every detail, from capacity to plan B, is under our seal of exclusivity.*`
                    },
                    social: {
                        instagram_carousel: {
                            slides: [`El alma de ${partner}`, "Descubriendo rincones", "Historias que inspiran", "Reserva tu momento"],
                            caption: `No es solo un lugar, es una crónica de viaje esperando ser escrita.`,
                            hashtags: "#EscapaUY #Storytelling #TravelJournal"
                        },
                        instagram_lifestyle: {
                            image_prompt: `Artistic editorial photography of ${partner}, warm organic textures, soft focus on local craft details, morning light through a window, 8k resolution, cinematic atmosphere`,
                            caption: "Donde la historia se encuentra con el descanso. Un relato de paz."
                        },
                        facebook_news: {
                            headline: `¿Conocías el secreto detrás de ${partner}?`,
                            body: `Te invitamos a una crónica exclusiva sobre uno de los rincones más auténticos de la región. No es marketing, es historia pura.`,
                            cta: "Leer historia y reservar"
                        }
                    }
                });
                setIsGenerating(false);
                toast.success('¡Modo Simulación: Nueva Narrativa activa!');
            }, 1500);
        }
    };

    const handlePublishToBlog = async () => {
        if (!result) return;
        setIsPublishing(true);
        const loadingToast = toast.loading('Publicando borrador...');

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('No hay sesión activa');

            const slug = `${topic.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

            // Imagen destacada: Usamos la primera foto cargada si existe, sino un placeholder
            const featuredImage = partnerPhotos.length > 0
                ? partnerPhotos[0]
                : 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80';

            const { error } = await supabase.from('blog_posts').insert({
                title: result.blog.title_es,
                title_en: result.blog.title_en,
                slug: slug,
                content: result.blog.es,
                content_en: result.blog.en,
                featured_image: featuredImage,
                published: false,
                author_id: session.user.id,
                tags: ['IA', partner, partnerPhotos.length > 0 ? 'FOTOS REALES' : 'STOCK']
            });

            if (error) throw error;
            toast.success('¡Borrador creado en el CMS!', { id: loadingToast });
        } catch (error: any) {
            console.error('Error al publicar:', error.message);
            toast.error('Error al publicar: ' + error.message, { id: loadingToast });
        } finally {
            setIsPublishing(false);
        }
    };

    const handleSaveAll = async () => {
        if (!result) return;
        setIsSaving(true);
        const loadingToast = toast.loading('Guardando en el historial...');

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('No hay sesión activa');

            const { error } = await supabase.from('content_generations').insert({
                topic,
                partner,
                tone,
                result,
                partner_photos: partnerPhotos,
                created_by: session.user.id
            });

            if (error) throw error;
            toast.success('¡Todo guardado en tu historial!', { id: loadingToast });
            fetchHistory();
        } catch (error: any) {
            console.error('Error al guardar:', error.message);
            toast.error('Error al guardar: ' + error.message, { id: loadingToast });
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportCSV = () => {
        if (!result) return;

        // Definir cabeceras
        const headers = [
            'Partner', 'Tema', 'Titulo_ES', 'Cronica_ES',
            'Slide_1', 'Slide_2', 'Slide_3', 'Slide_4',
            'Insta_Caption', 'Insta_Hashtags',
            'FB_Headline', 'FB_Body'
        ];

        // Definir fila de datos (escapando comillas)
        const row = [
            partner,
            topic,
            result.blog.title_es,
            result.blog.es.replace(/"/g, '""'),
            result.social.instagram_carousel.slides[0] || '',
            result.social.instagram_carousel.slides[1] || '',
            result.social.instagram_carousel.slides[2] || '',
            result.social.instagram_carousel.slides[3] || '',
            result.social.instagram_carousel.caption.replace(/"/g, '""'),
            result.social.instagram_carousel.hashtags,
            result.social.facebook_news.headline.replace(/"/g, '""'),
            result.social.facebook_news.body.replace(/"/g, '""')
        ];

        // Crear contenido CSV
        const csvContent = [
            headers.join(','),
            row.map(field => `"${field}"`).join(',')
        ].join('\n');

        // Crear y descargar archivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Canva_Bulk_${partner.replace(/\s+/g, '_')}_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Archivo CSV listo para Canva');
    };

    return (
        <div className="min-h-screen bg-[#1A1F2C] text-white font-inter pb-20 selection:bg-[#C5A059] selection:text-[#1A1F2C]">
            <header className="border-b border-white/5 bg-[#1A1F2C]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/admin/control-tower" className="p-2 hover:bg-white/5 rounded-full transition-all text-white/60 hover:text-[#C5A059]">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight uppercase text-[#C5A059] flex items-center gap-2">
                                <BrainCircuit className="w-6 h-6" /> Content Engine
                            </h1>
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">IA Generativa de Contenidos TravelTech</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-10 grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-8">
                    {/* Formulario de Configuración */}
                    <section className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059] opacity-5 blur-[100px]" />

                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#C5A059] mb-8 flex items-center gap-2">
                            <PenTool className="w-4 h-4" /> Configuración Maestro
                        </h3>

                        <form onSubmit={handleGenerate} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Tema del Artículo</label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="Ej: Bodegas para días de lluvia"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#C5A059] focus:outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Partner a Destacar</label>
                                <input
                                    type="text"
                                    value={partner}
                                    onChange={(e) => setPartner(e.target.value)}
                                    placeholder="Ej: Parador Mar Dulce"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#C5A059] focus:outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Tono de Voz</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Inspirador', 'Educativo', 'Urgente'].map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setTone(t as any)}
                                            className={cn(
                                                "py-2 px-1 rounded-lg text-[10px] font-bold uppercase border transition-all",
                                                tone === t
                                                    ? "bg-[#C5A059] border-[#C5A059] text-[#1A1F2C]"
                                                    : "border-white/10 text-white/40 hover:border-white/20"
                                            )}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isGenerating}
                                className="w-full py-4 bg-gradient-to-r from-[#C5A059] to-[#B8860B] text-[#1A1F2C] font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 group-hover:animate-pulse" />}
                                {isGenerating ? 'Generando Magia...' : 'Generar Contenido IA'}
                            </button>
                        </form>
                    </section>

                    {/* Historial Reciente */}
                    {history.length > 0 && (
                        <section className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#C5A059] mb-6 flex items-center gap-2">
                                <FileCheck className="w-4 h-4" /> Historial de Ideas
                            </h3>
                            <div className="space-y-4">
                                {history.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setResult(item.result);
                                            setTopic(item.topic);
                                            setPartner(item.partner);
                                            setTone(item.tone as any);
                                            setPartnerPhotos(item.partner_photos || []);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="w-full p-4 bg-white/[0.02] border border-white/5 rounded-xl text-left hover:border-[#C5A059]/30 transition-all group"
                                    >
                                        <p className="text-[10px] font-bold text-[#C5A059] uppercase mb-1">{item.partner}</p>
                                        <p className="text-xs text-white/60 line-clamp-1">{item.topic}</p>
                                        <time className="text-[8px] text-white/20 uppercase mt-2 block">
                                            {new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                        </time>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Carga de Fotos Reales */}
                    <section className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#C5A059] mb-6 flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Fotos Reales Partner
                        </h3>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-[#C5A059]/50 hover:bg-[#C5A059]/5 transition-all cursor-pointer group"
                        >
                            <div className="w-12 h-12 bg-[#C5A059]/10 rounded-full flex items-center justify-center text-[#C5A059] group-hover:scale-110 transition-transform">
                                {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold uppercase tracking-wider mb-1">Subir Material Real</p>
                                <p className="text-[10px] text-white/40">PNG, JPG hasta 5MB</p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                multiple
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                disabled={isUploading || !partner}
                            />
                        </div>

                        {partnerPhotos.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 mt-6">
                                {partnerPhotos.map((photo, index) => (
                                    <div key={index} className="aspect-square rounded-lg overflow-hidden relative group border border-white/10">
                                        <img src={photo} alt="" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removePhoto(index)}
                                            className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        {index === 0 && (
                                            <div className="absolute bottom-0 inset-x-0 bg-[#C5A059] text-[#1A1F2C] text-[8px] font-bold uppercase text-center py-0.5">
                                                Portada
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {!partner && (
                            <p className="text-[10px] text-red-400 mt-4 text-center italic">
                                * Primero escribe el nombre del partner
                            </p>
                        )}
                    </section>
                </div>

                <div className="lg:col-span-8">
                    {!result ? (
                        <div className="h-full min-h-[500px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-white/20 opacity-50">
                            <BrainCircuit className="w-16 h-16 mb-4 stroke-1" />
                            <p className="font-bold uppercase tracking-widest text-sm">Esperando instrucciones...</p>
                        </div>
                    ) : (
                        <div className="space-y-10 animate-fade-in-up">
                            <div className="grid md:grid-cols-2 gap-6">
                                {[
                                    { lang: 'Español', content: result.blog.es, title: result.blog.title_es, icon: '🇪🇸' },
                                    { lang: 'Inglés', content: result.blog.en, title: result.blog.title_en, icon: '🇺🇸' }
                                ].map((v) => (
                                    <div key={v.lang} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col">
                                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                            <div className="flex items-center gap-2">
                                                <span>{v.icon}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{v.lang} (Blog)</span>
                                            </div>
                                            <button
                                                onClick={() => handleCopy(v.content, v.lang)}
                                                className="text-white/40 hover:text-[#C5A059] transition-colors"
                                            >
                                                {copyStatus === v.lang ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className="p-8 flex-1 prose prose-invert prose-sm max-w-none prose-headings:text-[#C5A059] prose-headings:font-playfair max-h-[400px] overflow-y-auto custom-scrollbar">
                                            <h4 className="mt-0">{v.title}</h4>
                                            <div className="text-white/70 whitespace-pre-wrap font-inter leading-relaxed">
                                                {v.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#C5A059] flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Redes Sociales (Repurposing)
                                </h3>
                                <button
                                    onClick={handleExportCSV}
                                    className="px-4 py-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-pink-500/20 transition-all flex items-center gap-2"
                                >
                                    <Download className="w-3 h-3" /> Exportar para Canva Bulk
                                </button>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Instagram className="w-5 h-5 text-pink-400" />
                                        <span className="text-[10px] font-bold uppercase text-pink-400">Instagram Carousel</span>
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        {result.social.instagram_carousel.slides.map((slide, i) => (
                                            <div key={i} className="bg-black/20 p-2 rounded text-[10px] border border-white/5 relative group">
                                                <span className="text-[#C5A059] mr-2">#{i + 1}</span> {slide}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-white/60 mb-2 italic">"{result.social.instagram_carousel.caption}"</p>
                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-[10px] text-pink-400/80 font-mono tracking-tighter">{result.social.instagram_carousel.hashtags}</p>
                                        <button
                                            onClick={() => window.open('https://www.canva.com', '_blank')}
                                            className="text-[10px] bg-white/10 hover:bg-pink-500/20 px-2 py-1 rounded border border-white/10 transition-colors flex items-center gap-1"
                                        >
                                            <PenTool className="w-3 h-3" /> Editar Canva
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-white/10 rounded-2xl p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <ImageIcon className="w-5 h-5 text-orange-400" />
                                        <span className="text-[10px] font-bold uppercase text-orange-400">Midjourney Prompt</span>
                                    </div>
                                    <div className="bg-black/20 p-3 rounded-lg text-[10px] font-mono leading-relaxed border border-white/5 mb-4 group relative">
                                        {result.social.instagram_lifestyle.image_prompt}
                                        <button
                                            onClick={() => handleCopy(result.social.instagram_lifestyle.image_prompt, 'mj')}
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black p-1 rounded"
                                        >
                                            <Copy className="w-3 h-3 text-[#C5A059]" />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-white/60">Caption: "{result.social.instagram_lifestyle.caption}"</p>
                                </div>

                                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-white/10 rounded-2xl p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Facebook className="w-5 h-5 text-blue-400" />
                                        <span className="text-[10px] font-bold uppercase text-blue-400">Facebook Post</span>
                                    </div>
                                    <h4 className="text-xs font-bold mb-2">{result.social.facebook_news.headline}</h4>
                                    <p className="text-[10px] text-white/60 mb-4 line-clamp-4">{result.social.facebook_news.body}</p>
                                    <div className="px-3 py-2 bg-blue-500/20 rounded-lg text-[10px] font-bold text-center border border-blue-500/30">
                                        CTA: {result.social.facebook_news.cta}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                                <button
                                    onClick={handlePublishToBlog}
                                    disabled={isPublishing || !result}
                                    className="px-8 py-3 bg-[#C5A059] text-[#1A1F2C] rounded-xl font-bold flex items-center gap-2 hover:bg-[#B8860B] transition-all shadow-lg disabled:opacity-50"
                                >
                                    {isPublishing ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileCheck className="w-5 h-5" />}
                                    Publicar como Borrador
                                </button>
                                <button
                                    onClick={handleSaveAll}
                                    disabled={isSaving || !result}
                                    className="px-8 py-3 bg-white/5 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all border border-white/10 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Guardar en Historial
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
