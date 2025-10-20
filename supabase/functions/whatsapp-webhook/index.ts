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

    const payload = await req.json();
    console.log('WhatsApp webhook payload:', payload);

    // Processar mensagem recebida
    if (payload.message) {
      const { from, body, mediaUrl, mediaType } = payload.message;

      // Buscar ou criar conversa
      let { data: conversation } = await supabaseClient
        .from('conversations')
        .select('*')
        .eq('contact_id', from)
        .maybeSingle();

      if (!conversation) {
        const { data: newConv, error: convError } = await supabaseClient
          .from('conversations')
          .insert({
            contact_id: from,
            contact_name: payload.contact_name || from,
            contact_avatar: payload.contact_avatar,
            channel_id: payload.channel_id,
            last_message: body,
            last_message_time: new Date().toISOString(),
          })
          .select()
          .single();

        if (convError) throw convError;
        conversation = newConv;
      } else {
        // Atualizar última mensagem
        await supabaseClient
          .from('conversations')
          .update({
            last_message: body,
            last_message_time: new Date().toISOString(),
            unread_count: (conversation.unread_count || 0) + 1,
          })
          .eq('id', conversation.id);
      }

      // Inserir mensagem
      await supabaseClient
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          message_id: payload.message_id || crypto.randomUUID(),
          content: body,
          sender_type: 'contact',
          media_url: mediaUrl,
          media_type: mediaType,
          timestamp: new Date().toISOString(),
          status: 'delivered',
        });

      console.log('Mensagem processada com sucesso');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro no webhook WhatsApp:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
