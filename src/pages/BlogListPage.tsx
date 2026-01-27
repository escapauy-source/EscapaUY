import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '@/services/blogService';
import { BlogPost } from '@/types';
import { Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function BlogListPage() {
    const { t, i18n } = useTranslation();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadPosts() {
            try {
                const data = await blogService.getAllPosts();
                setPosts(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        loadPosts();
    }, []);

    // Helper to extract a text snippet from content (removing basic tags if any)
    const getExcerpt = (content: string, length = 120) => {
        const text = content.replace(/<[^>]*>?/gm, '');
        return text.length > length ? text.substring(0, length) + '...' : text;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-ocean-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-20 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16">
                    <h1 className="font-playfair text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
                        {t('blog.title')}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                        {t('blog.subtitle')}
                    </p>
                </div>

                {posts.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('blog.empty_title')}</h2>
                        <p className="text-gray-500">{t('blog.empty_desc')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                to={`/blog/${post.slug}`}
                                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col border border-gray-100"
                            >
                                {/* Image Container */}
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={post.featured_image || 'https://images.unsplash.com/photo-1594911776517-152e90c6799f?auto=format&fit=crop&q=80'}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                        <span className="text-white text-sm font-medium flex items-center gap-2">
                                            {t('blog.read_more')} <ChevronRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                                        <Calendar className="w-4 h-4 text-ocean-400" />
                                        {new Date(post.created_at).toLocaleDateString(i18n.language === 'es' ? 'es-UY' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                    <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-3 group-hover:text-ocean-600 transition-colors leading-tight">
                                        {post.title}
                                    </h2>
                                    <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                                        {getExcerpt(post.content)}
                                    </p>

                                    {/* Tags */}
                                    <div className="mt-auto flex flex-wrap gap-2">
                                        {post.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] uppercase font-bold rounded-full tracking-wider">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
