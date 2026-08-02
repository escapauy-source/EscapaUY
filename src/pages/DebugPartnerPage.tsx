import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { partners } from '@/data/mockData';
import { LayoutDashboard } from 'lucide-react';

/**
 * DebugPartnerPage - Development Bypass
 * Allows selecting a partner to view their specific dashboard
 */
export function DebugPartnerPage() {
    const navigate = useNavigate();
    const [selectedId, setSelectedId] = useState(partners[0]?.id || '');

    const handleLogin = () => {
        const partner = partners.find(p => p.id === selectedId);
        if (!partner) return;

        console.log('[DEBUG_PARTNER] 🚀 Logging in as:', partner.name);

        // Set localStorage mock data
        localStorage.setItem('escapauy_debug_mode', 'true');
        localStorage.setItem('escapauy_debug_partner', JSON.stringify({
            id: partner.id,
            email: 'debug@escapauy.com',
            name: partner.name,
            role: 'partner',
        }));

        // Redirect
        navigate('/partner/dashboard', { replace: true });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-100 p-4 rounded-full">
                        <LayoutDashboard className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Debug Partner Access</h1>
                <p className="text-center text-gray-500 mb-8">Select a partner to inspect their bookings</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Partner</label>
                        <select
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {partners.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleLogin}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-200"
                    >
                        Access Dashboard
                    </button>

                    <div className="text-center mt-4">
                        <a href="/" className="text-sm text-gray-400 hover:text-gray-600">Back to Landing</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
