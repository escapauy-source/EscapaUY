import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { blogService } from '@/services/blogService';
import { BlogPost } from '@/types';
import {
    Plus, Edit2, Trash2, Search, Save, X,
    Eye, EyeOff, FileText, CheckCircle2, AlertCircle, ArrowLeft, LogOut
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/utils/cn';

export function AdminBlogPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, setShowAuthModal } = useApp();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({
        title: '',
        slug: '',
        content: '',
        featured_image: '',
        tags: [],
        published: false
    });

    useEffect(() => {
        loadPosts();
    }, []);

    async function loadPosts() {
        setIsLoading(true);
        try {
            const data = await blogService.getAdminPosts();
            setPosts(data);
        } catch (err) {
            toast.error('Error al cargar los posts');
        } finally {
            setIsLoading(false);
        }
    }

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (title: string) => {
        setCurrentPost(prev => ({
            ...prev,
            title,
            slug: generateSlug(title)
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPost.title || !currentPost.slug || !currentPost.content) {
            toast.error('Completa los campos obligatorios');
            return;
        }

        try {
            // 1. Validar sesión en tiempo real directamente desde Supabase
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                console.error('[CMS_SESSION_ERROR]', sessionError);
                toast.error('Tu sesión ha expirado. Por favor, ingresa de nuevo.');

                // Cerrar sesión en el estado global para sincronizar
                logout();

                // Redireccionar si estamos en una ruta administrativa
                if (location.pathname.startsWith('/admin')) {
                    setShowAuthModal(true);
                    navigate('/');
                }
                return;
            }

            // Extraer el ID de autor directamente de la sesión fresca
            const authorId = session.user.id;
            if (currentPost.id) {
                await blogService.updatePost(currentPost.id, {
                    ...currentPost,
                    author_id: authorId
                });
                toast.success('Post actualizado correctamente');
            } else {
                // Creación - Limpiamos el objeto para el INSERT
                const postToInsert = {
                    title: currentPost.title,
                    slug: currentPost.slug,
                    content: currentPost.content,
                    featured_image: currentPost.featured_image || null,
                    tags: currentPost.tags || [],
                    published: currentPost.published || false,
                    author_id: authorId
                };

                console.log('[CMS_DEBUG] PayLoad Final:', postToInsert);

                await blogService.createPost(postToInsert as Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>);
                toast.success('Post creado correctamente');
            }
            setIsEditing(false);
            loadPosts();
        } catch (err: any) {
            console.error('[CMS_ERROR]', err);
            toast.error(`Error al guardar: ${err.message || 'Error desconocido'}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este post? Esta acción no se puede deshacer.')) return;
        try {
            await blogService.deletePost(id);
            toast.success('Post eliminado');
            loadPosts();
        } catch (err) {
            toast.error('Error al eliminar post');
        }
    };

    const filteredPosts = posts.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isEditing) {
        return (
            <div className="min-h-screen bg-gray-50 pb-20">
                <div className="max-w-5xl mx-auto px-4 py-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {currentPost.id ? 'Editar Post' : 'Nueva Publicación'}
                            </h1>
                            <p className="text-gray-500">Gestión de contenidos para el Blog</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-white transition-all font-medium text-sm"
                            >
                                <X className="w-4 h-4" /> Cancelar
                            </button>
                            <button
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    window.location.href = '/';
                                }}
                                className="px-4 py-2 bg-red-500/10 text-red-600 border border-red-200 rounded-lg flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all font-bold text-sm"
                                title="Cerrar Sesión para Refrescar Permisos"
                            >
                                <LogOut className="w-4 h-4" /> Salir
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <label className="block text-sm font-bold text-gray-700 mb-2 font-inter uppercase tracking-tighter">Título del Post</label>
                                <input
                                    type="text"
                                    value={currentPost.title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    className="w-full text-2xl font-playfair border-none focus:ring-0 p-0 placeholder-gray-300"
                                    placeholder="Escribe un título cautivador..."
                                    required
                                />
                                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                                    <span className="font-mono">URL: escapauy.com/blog/</span>
                                    <input
                                        type="text"
                                        value={currentPost.slug}
                                        onChange={(e) => setCurrentPost(prev => ({ ...prev, slug: e.target.value }))}
                                        className="border-none focus:ring-0 p-0 text-ocean-600 bg-transparent font-mono"
                                    />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <label className="block text-sm font-bold text-gray-700 mb-4 font-inter uppercase tracking-tighter">Contenido (HTML / Markdown)</label>
                                <textarea
                                    value={currentPost.content}
                                    onChange={(e) => setCurrentPost(prev => ({ ...prev, content: e.target.value }))}
                                    rows={20}
                                    className="w-full border-gray-200 rounded-xl focus:ring-ocean-500 focus:border-ocean-500 font-mono text-sm leading-relaxed"
                                    placeholder="Aquí comienza la historia..."
                                    required
                                />
                            </div>
                        </div>

                        {/* Sidebar Settings */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold mb-4">Configuración</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest leading-none">Estado</label>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPost(prev => ({ ...prev, published: !prev.published }))}
                                            className={cn(
                                                "w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all",
                                                currentPost.published
                                                    ? "bg-green-50 text-green-700 border border-green-200"
                                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                            )}
                                        >
                                            {currentPost.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            {currentPost.published ? 'Publicado' : 'Borrador'}
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest leading-none">Imagen Destacada (URL)</label>
                                        <input
                                            type="url"
                                            value={currentPost.featured_image}
                                            onChange={(e) => setCurrentPost(prev => ({ ...prev, featured_image: e.target.value }))}
                                            className="w-full border-gray-200 rounded-lg text-sm"
                                            placeholder="https://images.unsplash..."
                                        />
                                        {currentPost.featured_image && (
                                            <div className="mt-2 aspect-video rounded-lg overflow-hidden border border-gray-100">
                                                <img src={currentPost.featured_image} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest leading-none">Etiquetas (Separadas por coma)</label>
                                        <input
                                            type="text"
                                            value={currentPost.tags?.join(', ')}
                                            onChange={(e) => setCurrentPost(prev => ({ ...prev, tags: e.target.value.split(',').map(s => s.trim()) }))}
                                            className="w-full border-gray-200 rounded-lg text-sm"
                                            placeholder="colonia, patrimonio, tips"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full mt-8 bg-ocean-600 text-white py-3 rounded-xl font-bold hover:bg-ocean-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-ocean-100"
                                >
                                    <Save className="w-5 h-5" /> Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white border-b border-gray-100 mb-8">
                <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-between">
                    <div>
                        <Link
                            to="/admin/control-tower"
                            className="flex items-center gap-2 text-xs font-bold text-ocean-600 uppercase tracking-widest mb-2 hover:translate-x-[-4px] transition-transform w-fit"
                        >
                            <ArrowLeft className="w-3 h-3" /> Volver al Panel Central
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">CMS Blog</h1>
                        <p className="text-gray-500">Administración de Historias y Experiencias de EscapaUY</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                setCurrentPost({ title: '', slug: '', content: '', published: false, tags: [] });
                                setIsEditing(true);
                            }}
                            className="px-6 py-3 bg-ocean-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-ocean-700 transition-all shadow-lg shadow-ocean-100"
                        >
                            <Plus className="w-5 h-5" /> Nueva Publicación
                        </button>
                        <button
                            onClick={async () => {
                                await supabase.auth.signOut();
                                window.location.href = '/';
                            }}
                            className="p-3 text-gray-400 hover:text-red-500 transition-colors border border-gray-100 rounded-xl hover:bg-red-50"
                            title="Cerrar Sesión"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Posts</p>
                            <p className="text-2xl font-bold">{posts.length}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Publicados</p>
                            <p className="text-2xl font-bold">{posts.filter(p => p.published).length}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Borradores</p>
                            <p className="text-2xl font-bold">{posts.filter(p => !p.published).length}</p>
                        </div>
                    </div>
                </div>

                {/* Search & List */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por título..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border-gray-200 rounded-xl focus:ring-ocean-500 focus:border-ocean-500"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <th className="px-6 py-4">Post</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-6"><div className="h-4 bg-gray-100 rounded w-48"></div></td>
                                            <td className="px-6 py-6"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                            <td className="px-6 py-6"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                            <td className="px-6 py-6 text-right"><div className="h-8 bg-gray-100 rounded w-24 ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : filteredPosts.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center text-gray-400">
                                            No se encontraron publicaciones.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPosts.map((post) => (
                                        <tr key={post.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                        <img src={post.featured_image || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 group-hover:text-ocean-600 transition-colors line-clamp-1">{post.title}</p>
                                                        <p className="text-xs text-gray-400 font-mono tracking-tighter">/blog/{post.slug}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                    post.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                                )}>
                                                    {post.published ? 'Publicado' : 'Borrador'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 text-sm text-gray-500">
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setCurrentPost(post);
                                                            setIsEditing(true);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-ocean-600 hover:bg-ocean-50 rounded-lg transition-all"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(post.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
