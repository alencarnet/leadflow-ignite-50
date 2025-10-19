import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { action, channelId, username } = await req.json();

    console.log(`Instagram action: ${action} for user: ${user.id}`);

    if (action === 'init') {
      // Inicializar conexão Instagram
      const { data: channel, error } = await supabaseClient
        .from('connected_channels')
        .insert({
          user_id: user.id,
          channel_type: 'instagram',
          phone_number: username, // Usando phone_number para armazenar username
          status: 'connecting',
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          success: true,
          channelId: channel.id,
          message: 'Instagram connection initialized' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'authenticate') {
      // Simular autenticação Instagram - em produção integrar com Instagram API
      await supabaseClient
        .from('connected_channels')
        .update({ 
          status: 'connected',
          last_connected_at: new Date().toISOString()
        })
        .eq('id', channelId)
        .eq('user_id', user.id);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'disconnect') {
      await supabaseClient
        .from('connected_channels')
        .update({ status: 'disconnected' })
        .eq('id', channelId)
        .eq('user_id', user.id);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');
  } catch (error) {
    console.error('Error in instagram-connect:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
