import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogService } from '@/services/blogService';
import { BlogPost } from '@/types';
import { ArrowLeft, Calendar, Loader2, Tag, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';

export function BlogPostPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadPost() {
            if (!slug) return;
            try {
                const data = await blogService.getPostBySlug(slug);
                setPost(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        loadPost();
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 animate-spin text-ocean-600" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
                <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-4">{t('blog.not_found')}</h2>
                <button
                    onClick={() => navigate('/blog')}
                    className="flex items-center gap-2 text-ocean-600 font-bold hover:underline"
                >
                    <ArrowLeft className="w-5 h-5" /> {t('blog.back')}
                </button>
            </div>
        );
    }

    return (
        <article className="min-h-screen bg-white animate-fade-in pb-20">
            {/* Hero Header */}
            <header className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
                <img
                    src={post.featured_image || 'https://images.unsplash.com/photo-1594911776517-152e90c6799f?auto=format&fit=crop&q=80'}
                    className="w-full h-full object-cover"
                    alt={post.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
                        <button
                            onClick={() => navigate('/blog')}
                            className="flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" /> {t('blog.back')}
                        </button>
                        <div className="flex items-center gap-4 text-white/70 text-sm mb-6 uppercase tracking-widest font-bold">
                            <span className="flex items-center gap-2 italic">
                                <Calendar className="w-4 h-4 text-ocean-400" />
                                {new Date(post.created_at).toLocaleDateString(i18n.language === 'es' ? 'es-UY' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <span className="w-1 h-1 bg-white/30 rounded-full" />
                            <span className="text-ocean-300">{t('blog.category_label')}</span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-playfair font-bold text-white leading-tight">
                            {i18n.language === 'en' ? (post.title_en || post.title) : post.title}
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-gray-200/50">
                    {/* Article Meta */}
                    <div className="flex flex-wrap items-center justify-between gap-6 mb-12 pb-8 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-ocean-50 rounded-full flex items-center justify-center overflow-hidden">
                                <img
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=escapauy"
                                    alt="Author"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-tighter">{t('blog.author_label')}</p>
                                <p className="font-bold text-gray-900">{t('blog.author_name')}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-ocean-50 hover:text-ocean-600 transition-all">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Body Content */}
                    <div className="prose prose-lg md:prose-xl prose-ocean max-w-none text-gray-700 leading-relaxed space-y-6">
                        <ReactMarkdown>
                            {i18n.language === 'en' ? (post.content_en || post.content) : post.content}
                        </ReactMarkdown>
                    </div>

                    {/* Tags Footer */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="mt-20 pt-8 border-t border-gray-100 italic">
                            <div className="flex items-center gap-3 text-gray-400 mb-4">
                                <Tag className="w-5 h-5" />
                                <span className="text-sm font-medium uppercase tracking-wider">{t('blog.tags_label')}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map(tag => (
                                    <span key={tag} className="px-4 py-2 bg-ocean-50 text-ocean-700 text-xs font-bold rounded-lg uppercase tracking-tight">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
