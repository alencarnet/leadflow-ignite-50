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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Não autorizado - Token ausente');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Erro de autenticação:', authError);
      throw new Error('Não autorizado - Token inválido');
    }

    const { username, password } = await req.json();

    console.log(`Iniciando conexão Instagram para usuário ${user.id}, username: ${username}`);

    // Criar ou atualizar canal no banco
    const { data: existingChannel } = await supabaseClient
      .from('connected_channels')
      .select('*')
      .eq('user_id', user.id)
      .eq('channel_type', 'instagram')
      .maybeSingle();

    if (existingChannel) {
      await supabaseClient
        .from('connected_channels')
        .update({
          status: 'connecting',
          session_data: { username },
        })
        .eq('id', existingChannel.id);
    } else {
      await supabaseClient
        .from('connected_channels')
        .insert({
          user_id: user.id,
          channel_type: 'instagram',
          status: 'connecting',
          session_data: { username },
        });
    }

    // Simular conexão após 3 segundos
    setTimeout(async () => {
      const { data: channel } = await supabaseClient
        .from('connected_channels')
        .select('*')
        .eq('user_id', user.id)
        .eq('channel_type', 'instagram')
        .maybeSingle();

      if (channel) {
        await supabaseClient
          .from('connected_channels')
          .update({
            status: 'connected',
            last_connected_at: new Date().toISOString(),
          })
          .eq('id', channel.id);

        console.log(`Instagram conectado para ${username}`);
      }
    }, 3000);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na conexão Instagram:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
