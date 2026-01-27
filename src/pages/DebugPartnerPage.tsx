import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * DebugPartnerPage - Development Bypass
 * Redirige inmediatamente al dashboard sin autenticación
 */
export function DebugPartnerPage() {
    const navigate = useNavigate();

    useEffect(() => {
        console.log('[DEBUG_PARTNER] 🚀 Redirecting to dashboard immediately...');

        // Set localStorage mock data
        localStorage.setItem('escapauy_debug_mode', 'true');
        localStorage.setItem('escapauy_debug_partner', JSON.stringify({
            id: 'debug-partner-001',
            email: 'debug@bodega-el-legado.com',
            name: 'Bodega El Legado',
            role: 'partner',
        }));

        // Redirect immediately without waiting
        navigate('/partner/dashboard', { replace: true });
    }, []); // Empty deps - run only once

    // Show nothing - immediate redirect
    return null;
}
