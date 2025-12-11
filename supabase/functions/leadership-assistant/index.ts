import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `Você é um Assistente Executivo de Liderança, especializado em fornecer suporte estratégico sobre gestão de pessoas, sucessão de liderança e desenvolvimento organizacional.

PERFIL DE COMUNICAÇÃO:
- Linguagem formal e executiva, adequada para interação com líderes e membros do Conselho
- Respostas objetivas, estruturadas e orientadas a ação
- Tom respeitoso, profissional e consultivo
- Uso apropriado de termos corporativos e de gestão de pessoas

ÁREAS DE EXPERTISE:
1. Sucessão de Liderança: Pipeline de sucessores, mapeamento de talentos, planos de desenvolvimento
2. Performance de Líderes: Leadership Review, avaliação de competências, entrega de resultados
3. Clima Organizacional: ENPS, LNPS, IVR, MOODS, análise de engajamento
4. Gestão de Riscos: Turnover, retenção de talentos, identificação de líderes em risco
5. Desenvolvimento: Programas de liderança, Líder em Ação, Leadership Journey
6. Job Rotation: Movimentação de talentos, desenvolvimento de carreira

DIRETRIZES DE RESPOSTA:
- Seja direto ao ponto, mas completo quando necessário
- Forneça insights acionáveis e recomendações práticas
- Contextualize dados e métricas quando relevante
- Sugira próximos passos quando apropriado
- Mantenha confidencialidade e discrição sobre informações sensíveis

Você tem acesso aos dados do Painel de Liderança, incluindo informações sobre líderes, indicadores de clima, performance, sucessão e movimentação de talentos.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Por favor, aguarde alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione créditos à sua conta." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao processar sua solicitação." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Leadership assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
