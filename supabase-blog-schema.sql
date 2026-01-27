-- TABLA DE BLOG POSTS
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL, -- Soporta HTML/Markdown
    author_id UUID REFERENCES public.profiles(id) DEFAULT auth.uid(),
    featured_image TEXT,
    tags TEXT[] DEFAULT '{}',
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- HABILITAR RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE SEGURIDAD

-- 1. Lectura pública (Cualquiera puede leer posts publicados)
CREATE POLICY "Lectura pública de blog" 
ON public.blog_posts 
FOR SELECT 
USING (published = true);

-- 2. Gestión exclusiva para Administrador (escapauy@gmail.com)
CREATE POLICY "Gestión total para Admin" 
ON public.blog_posts 
FOR ALL 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE public.profiles.id = auth.uid() 
        AND public.profiles.role = 'admin'
    )
);

-- Trigger para actualización automática de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
