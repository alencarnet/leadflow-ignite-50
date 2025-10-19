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

    const { action, channelId, phone_number } = await req.json();

    console.log(`WhatsApp action: ${action} for user: ${user.id}`);

    if (action === 'init') {
      // Inicializar nova sessão WhatsApp
      const qrCode = `whatsapp-qr-${Date.now()}`; // Mock QR code - em produção usar Baileys
      
      const { data: channel, error } = await supabaseClient
        .from('connected_channels')
        .insert({
          user_id: user.id,
          channel_type: 'whatsapp',
          phone_number,
          status: 'connecting',
          qr_code: qrCode,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          success: true, 
          qrCode,
          channelId: channel.id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'check_status') {
      const { data: channel } = await supabaseClient
        .from('connected_channels')
        .select('*')
        .eq('id', channelId)
        .single();

      return new Response(
        JSON.stringify({ success: true, channel }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'disconnect') {
      await supabaseClient
        .from('connected_channels')
        .update({ status: 'disconnected', qr_code: null })
        .eq('id', channelId)
        .eq('user_id', user.id);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');
  } catch (error) {
    console.error('Error in whatsapp-connect:', error);
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
