-- TABLA PARA GUARDAR GENERACIONES DEL CONTENT ENGINE (V2) - REUTILIZABLE
-- Almacena artículos de blog, posts de redes sociales y fotos para su posterior consulta

-- 1. Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS public.content_generations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic TEXT NOT NULL,
    partner TEXT NOT NULL,
    tone TEXT NOT NULL,
    result JSONB NOT NULL,
    partner_photos TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'saved',
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- 2. Asegurarse de que la columna partner_photos exista (por si usaste la V1)
ALTER TABLE public.content_generations ADD COLUMN IF NOT EXISTS partner_photos TEXT[] DEFAULT '{}';

-- 3. Habilitar RLS
ALTER TABLE public.content_generations ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar política previa para evitar el error "policy already exists"
DROP POLICY IF EXISTS "Gestión total de generaciones para Admin" ON public.content_generations;

-- 5. Crear la política limpia
CREATE POLICY "Gestión total de generaciones para Admin" 
ON public.content_generations 
FOR ALL 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE public.profiles.id = auth.uid() 
        AND public.profiles.role = 'admin'
    )
);
