import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import OpenAI from "https://esm.sh/openai@4.24.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topic, partner, tone } = await req.json()
    const apiKey = Deno.env.get('OPENAI_API_KEY')

    if (!apiKey || apiKey.includes('tu_llave_aqui') || apiKey.length < 20) {
      console.error('[CONTENT_ENGINE] Invalid API Key detected');
      throw new Error('La API Key de OpenAI no está configurada correctamente en Supabase Secrets.');
    }

    const openai = new OpenAI({ apiKey })

    console.log(`[CONTENT_ENGINE] Generating content for: ${topic} - Partner: ${partner}`);

    const systemPrompt = `Eres un cronista de viajes de lujo para EscapaUY. Tu misión es contar historias cautivadoras sobre nuestros Partners.
Filosofía de Redacción:
1. El Protagonista es el Partner: Enfócate en su historia, la pasión de sus dueños, la arquitectura o el servicio único que ofrecen. No los vendas, descúbrelos.
2. Storytelling vs Marketing: No uses frases de venta agresivas como "Compra ya". Usa narrativa: "Al entrar a ${partner}, el tiempo se detiene...".
3. EscapaUY Sutil: Menciona a EscapaUY solo como el facilitador que garantiza que la experiencia sea perfecta (Plan B, control de aforo, exclusividad). 
4. Entorno Local: Investiga o sugiere sutilmente 2-3 actividades o lugares de interés cerca de la ubicación del Partner para crear un itinerario completo.
5. Llamado a la Acción (CTA) Claro: El artículo debe terminar con una invitación elegante a reservar esa experiencia específica a través del ecosistema de EscapaUY.

Reglas de Estilo:
- Tono: Sofisticado, bohemio-luxe, experto.
- Formato: Markdown rico con encabezados, citas y listas elegantes.
- Idioma: Siempre bilingüe (ES/EN).
- Disclaimer legal al final: 'Imágenes ilustrativas. EscapaUY es un PSPC registrado'.`

    const userPrompt = `Escribe una crónica de viaje sobre:
Tema: ${topic}
Partner Principal: ${partner}
Tono: ${tone}

Requisitos específicos:
- Narra la historia o el alma de ${partner}.
- Sugiere qué hacer en los alrededores de ${partner} para un fin de semana ideal.
- El CTA final debe ser directo hacia la reserva de ${partner}.

Estructura de respuesta JSON requerida:
{
  "blog": {
    "es": "Crónica detallada en español (Markdown con subtítulos)",
    "en": "Detailed chronicle in English (Markdown with subtitles)",
    "title_es": "Título evocador y literario en español",
    "title_en": "Evocative and literary title in English"
  },
  "social": {
    "instagram_carousel": {
      "slides": ["Historia breve 1", "El detalle único 2", "El entorno 3", "Reserva con EscapaUY 4"],
      "caption": "Narrativa corta inspiradora",
      "hashtags": "#EscapaUY #Storytelling"
    },
    "instagram_lifestyle": {
      "image_prompt": "Prompt visual artístico para Midjourney (estética editorial)",
      "caption": "Reflexión poética sobre el lugar"
    },
    "facebook_news": {
      "headline": "Título de noticia local o recomendación experta",
      "body": "Un párrafo que invite a leer la historia completa",
      "cta": "Reserva tu lugar ahora"
    }
  }
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    })

    const contentString = completion.choices[0].message.content;
    if (!contentString) {
      throw new Error('OpenAI devolvió una respuesta vacía.');
    }

    const content = JSON.parse(contentString)

    return new Response(
      JSON.stringify(content),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('[CONTENT_ENGINE_ERROR]', error);

    let message = error.message;
    if (error.status === 401) message = "Error de Autenticación: La API Key de OpenAI es inválida.";
    if (error.status === 429) message = "Error de Cuota: Has excedido el límite de OpenAI o no tienes fondos.";

    return new Response(
      JSON.stringify({
        error: message,
        details: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
