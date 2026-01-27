import { supabase } from '@/lib/supabase';

/**
 * Upload an image to Supabase Storage
 * Returns the public URL or null if upload fails
 */
export async function uploadServiceImage(
    partnerId: string,
    file: File
): Promise<string | null> {
    try {
        console.log('[imageUpload] Uploading:', file.name, file.size);

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            console.error('[imageUpload] Invalid file type:', file.type);
            return null;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            console.error('[imageUpload] File too large:', file.size);
            return null;
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${partnerId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('service-images')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('[imageUpload] Upload error:', error);
            return null;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('service-images')
            .getPublicUrl(fileName);

        console.log('[imageUpload] ✅ Upload successful:', urlData.publicUrl);
        return urlData.publicUrl;
    } catch (error) {
        console.error('[imageUpload] ❌ Unexpected error:', error);
        return null;
    }
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteServiceImage(imageUrl: string): Promise<boolean> {
    try {
        // Extract filename from URL
        const urlParts = imageUrl.split('/');
        const fileName = urlParts.slice(-2).join('/'); // partner_id/filename.ext

        console.log('[imageUpload] Deleting:', fileName);

        const { error } = await supabase.storage
            .from('service-images')
            .remove([fileName]);

        if (error) {
            console.error('[imageUpload] Delete error:', error);
            return false;
        }

        console.log('[imageUpload] ✅ Image deleted');
        return true;
    } catch (error) {
        console.error('[imageUpload] ❌ Delete failed:', error);
        return false;
    }
}
