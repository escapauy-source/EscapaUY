
import { supabase } from '@/lib/supabase';

export interface AiItineraryItem {
    activity: string;
    activity_id?: string;
    location: string;
    type: string;
}

export interface AiDayPlan {
    day: number;
    morning?: AiItineraryItem;
    midday?: AiItineraryItem;
    afternoon?: AiItineraryItem;
    evening?: AiItineraryItem;
}

export interface AiResponse {
    message: string;
    result: string; // The JSON string stringified inside
    warning?: string;
}

export const fetchAiItinerary = async (userId: string, tripDetails?: any): Promise<any> => {
    try {
        console.log('[AiService] Invoking agent-orchestrator...', tripDetails);
        const { data, error } = await supabase.functions.invoke('agent-orchestrator', {
            body: { user_id: userId, ...tripDetails }
        });

        if (error) {
            console.error('[AiService] Function Error:', error);
            throw error;
        }

        console.log('[AiService] Raw Response:', data);

        // Parse the inner result if it's a string
        let itineraryData = data.result;
        if (typeof data.result === 'string') {
            try {
                itineraryData = JSON.parse(data.result);
            } catch (e) {
                console.error('[AiService] Failed to parse inner JSON result', e);
                // Fallback if it's just text
                return null;
            }
        }

        return itineraryData;
    } catch (err) {
        console.error('[AiService] Request Failed:', err);
        throw err;
    }
};
