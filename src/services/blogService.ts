import { supabase } from '@/lib/supabase';
import { BlogPost } from '@/types';

export const blogService = {
    /**
     * Obtiene todos los posts publicados ordenados por fecha descendente
     */
    async getAllPosts(): Promise<BlogPost[]> {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('published', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[BlogService] Error fetching posts:', error);
            throw error;
        }

        return data || [];
    },

    /**
     * Obtiene un post individual por su slug
     */
    async getPostBySlug(slug: string): Promise<BlogPost | null> {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            console.error(`[BlogService] Error fetching post with slug ${slug}:`, error);
            return null;
        }

        return data;
    },
    /**
     * Obtiene TODOS los posts (incluyendo borradores) para administración
     */
    async getAdminPosts(): Promise<BlogPost[]> {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[BlogService] Error fetching admin posts:', error);
            throw error;
        }

        return data || [];
    },

    /**
     * Crea un nuevo post
     */
    async createPost(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost> {
        const { data, error } = await supabase
            .from('blog_posts')
            .insert([post])
            .select()
            .single();

        if (error) {
            console.error('[BlogService] Error creating post:', error);
            throw error;
        }

        return data;
    },

    /**
     * Actualiza un post existente
     */
    async updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
        const { data, error } = await supabase
            .from('blog_posts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[BlogService] Error updating post:', error);
            throw error;
        }

        return data;
    },

    /**
     * Elimina un post
     */
    async deletePost(id: string): Promise<void> {
        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[BlogService] Error deleting post:', error);
            throw error;
        }
    }
};
