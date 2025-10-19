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

    const { conversationId, content, mediaUrl, mediaType } = await req.json();

    console.log(`Sending message to conversation: ${conversationId}`);

    // Verificar se a conversa pertence ao usuário
    const { data: conversation } = await supabaseClient
      .from('conversations')
      .select('*, channel:connected_channels(*)')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Inserir mensagem no banco
    const { data: message, error } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id: conversationId,
        message_id: `msg_${Date.now()}`,
        sender_type: 'user',
        content,
        media_url: mediaUrl,
        media_type: mediaType,
        status: 'sending',
      })
      .select()
      .single();

    if (error) throw error;

    // Aqui seria a integração com Baileys/Instagram para enviar a mensagem real
    // Por enquanto, apenas simular o envio
    await supabaseClient
      .from('messages')
      .update({ status: 'sent' })
      .eq('id', message.id);

    // Atualizar última mensagem da conversa
    await supabaseClient
      .from('conversations')
      .update({ 
        last_message: content,
        last_message_time: new Date().toISOString() 
      })
      .eq('id', conversationId);

    return new Response(
      JSON.stringify({ success: true, message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-message:', error);
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
