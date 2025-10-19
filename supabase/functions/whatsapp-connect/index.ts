import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Não autorizado');
    }

    const { phone } = await req.json();

    console.log(`Iniciando conexão WhatsApp para usuário ${user.id}, phone: ${phone}`);

    // Gerar QR Code simulado (em produção, usar Baileys)
    const qrCodeSVG = `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
        <rect width="200" height="200" fill="white"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="14" fill="black">
          QR Code WhatsApp
        </text>
        <text x="50%" y="60%" text-anchor="middle" dy=".3em" font-size="12" fill="gray">
          ${phone}
        </text>
      </svg>
    `)}`;

    // Criar ou atualizar canal no banco
    const { data: existingChannel } = await supabaseClient
      .from('connected_channels')
      .select('*')
      .eq('user_id', user.id)
      .eq('channel_type', 'whatsapp')
      .eq('phone_number', phone)
      .maybeSingle();

    if (existingChannel) {
      await supabaseClient
        .from('connected_channels')
        .update({
          status: 'connecting',
          qr_code: qrCodeSVG,
        })
        .eq('id', existingChannel.id);
    } else {
      await supabaseClient
        .from('connected_channels')
        .insert({
          user_id: user.id,
          channel_type: 'whatsapp',
          phone_number: phone,
          status: 'connecting',
          qr_code: qrCodeSVG,
        });
    }

    // Simular conexão após 5 segundos
    setTimeout(async () => {
      const { data: channel } = await supabaseClient
        .from('connected_channels')
        .select('*')
        .eq('user_id', user.id)
        .eq('channel_type', 'whatsapp')
        .eq('phone_number', phone)
        .maybeSingle();

      if (channel) {
        await supabaseClient
          .from('connected_channels')
          .update({
            status: 'connected',
            qr_code: null,
            last_connected_at: new Date().toISOString(),
          })
          .eq('id', channel.id);

        console.log(`WhatsApp conectado para ${phone}`);
      }
    }, 5000);

    return new Response(
      JSON.stringify({ success: true, qr_code: qrCodeSVG }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na conexão WhatsApp:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
