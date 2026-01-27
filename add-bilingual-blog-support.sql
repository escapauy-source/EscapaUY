-- ACTUALIZACIÓN DEL BLOG PARA SOPORTE BILINGÜE
-- Añade columnas para inglés si no existen

ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS content_en TEXT;

-- Actualizar registros existentes para heredar el español si el inglés está vacío (opcional)
UPDATE public.blog_posts 
SET title_en = title 
WHERE title_en IS NULL;

UPDATE public.blog_posts 
SET content_en = content 
WHERE content_en IS NULL;
