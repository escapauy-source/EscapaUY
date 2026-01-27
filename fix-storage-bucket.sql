-- SCRIPT CORREGIDO (V3) - TOTALMENTE REUTILIZABLE
-- Esto solucionará el error de "policy already exists"

-- 1. Eliminar CUALQUIER política previa para evitar conflictos
DROP POLICY IF EXISTS "Acceso Público para Lectura" ON storage.objects;
DROP POLICY IF EXISTS "Subida permitida para Admin" ON storage.objects;
DROP POLICY IF EXISTS "Borrado permitido para Admin" ON storage.objects;
DROP POLICY IF EXISTS "Lectura pública blog-images" ON storage.objects;
DROP POLICY IF EXISTS "Subida permitida usuarios logueados" ON storage.objects;
DROP POLICY IF EXISTS "Borrado permitido usuarios logueados" ON storage.objects;

-- 2. Asegurarse de que el bucket exista y sea público
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Crear política de LECTURA
CREATE POLICY "Lectura pública blog-images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'blog-images' );

-- 4. Crear política de SUBIDA
CREATE POLICY "Subida permitida usuarios logueados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'blog-images' );

-- 5. Crear política de BORRADO
CREATE POLICY "Borrado permitido usuarios logueados"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'blog-images' );
