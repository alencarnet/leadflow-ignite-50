import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Instagram, Loader2, QrCode, CheckCircle2, XCircle } from 'lucide-react';

interface Channel {
  id: string;
  channel_type: 'whatsapp' | 'instagram';
  phone_number: string | null;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  qr_code: string | null;
  last_connected_at: string | null;
}

export default function Channels() {
  const { toast } = useToast();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [instagramUsername, setInstagramUsername] = useState('');
  const [connectingWhatsApp, setConnectingWhatsApp] = useState(false);
  const [connectingInstagram, setConnectingInstagram] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    loadChannels();
    
    // Realtime para atualizações de status
    const channelsSubscription = supabase
      .channel('connected_channels_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connected_channels'
        },
        () => loadChannels()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelsSubscription);
    };
  }, []);

  const loadChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('connected_channels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChannels((data || []) as Channel[]);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar canais',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const connectWhatsApp = async () => {
    if (!whatsappPhone) {
      toast({
        title: 'Telefone obrigatório',
        description: 'Por favor, insira um número de telefone',
        variant: 'destructive',
      });
      return;
    }

    setConnectingWhatsApp(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-connect', {
        body: { action: 'init', phone_number: whatsappPhone }
      });

      if (error) throw error;

      setQrCode(data.qrCode);
      toast({
        title: 'QR Code Gerado',
        description: 'Escaneie o QR Code com seu WhatsApp',
      });

      // Simular conexão bem-sucedida após 5 segundos
      setTimeout(async () => {
        await supabase
          .from('connected_channels')
          .update({ status: 'connected', last_connected_at: new Date().toISOString() })
          .eq('id', data.channelId);
        
        setQrCode(null);
        toast({
          title: 'WhatsApp Conectado!',
          description: 'Seu WhatsApp foi conectado com sucesso',
        });
      }, 5000);
    } catch (error: any) {
      toast({
        title: 'Erro ao conectar WhatsApp',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setConnectingWhatsApp(false);
    }
  };

  const connectInstagram = async () => {
    if (!instagramUsername) {
      toast({
        title: 'Username obrigatório',
        description: 'Por favor, insira seu username do Instagram',
        variant: 'destructive',
      });
      return;
    }

    setConnectingInstagram(true);
    try {
      const { data, error } = await supabase.functions.invoke('instagram-connect', {
        body: { action: 'init', username: instagramUsername }
      });

      if (error) throw error;

      // Simular autenticação
      setTimeout(async () => {
        await supabase.functions.invoke('instagram-connect', {
          body: { action: 'authenticate', channelId: data.channelId }
        });

        toast({
          title: 'Instagram Conectado!',
          description: 'Seu Instagram foi conectado com sucesso',
        });
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Erro ao conectar Instagram',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setConnectingInstagram(false);
    }
  };

  const disconnectChannel = async (channelId: string, type: string) => {
    try {
      const functionName = type === 'whatsapp' ? 'whatsapp-connect' : 'instagram-connect';
      const { error } = await supabase.functions.invoke(functionName, {
        body: { action: 'disconnect', channelId }
      });

      if (error) throw error;

      toast({
        title: 'Canal Desconectado',
        description: `${type === 'whatsapp' ? 'WhatsApp' : 'Instagram'} desconectado com sucesso`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao desconectar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      connected: <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Conectado</Badge>,
      connecting: <Badge className="bg-yellow-500"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Conectando</Badge>,
      disconnected: <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" /> Desconectado</Badge>,
      error: <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Erro</Badge>,
    };
    return variants[status] || variants.disconnected;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          Canais de Comunicação
        </h1>
        <p className="text-muted-foreground">Conecte WhatsApp e Instagram para gerenciar conversas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WhatsApp */}
        <Card className="bg-card/50 backdrop-blur border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-green-500" />
              WhatsApp
            </CardTitle>
            <CardDescription>Conecte seu WhatsApp Business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {qrCode && (
              <div className="p-4 bg-white rounded-lg flex flex-col items-center gap-4">
                <QrCode className="w-32 h-32 text-gray-400" />
                <p className="text-sm text-center text-muted-foreground">
                  Escaneie este QR Code com seu WhatsApp
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Número de Telefone</Label>
              <Input
                placeholder="+55 11 99999-9999"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
              />
            </div>

            <Button
              onClick={connectWhatsApp}
              disabled={connectingWhatsApp}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              {connectingWhatsApp && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Conectar WhatsApp
            </Button>

            {/* Canais WhatsApp conectados */}
            <div className="space-y-2">
              {channels.filter(c => c.channel_type === 'whatsapp').map((channel) => (
                <div key={channel.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <div>
                    <p className="font-medium">{channel.phone_number}</p>
                    {getStatusBadge(channel.status)}
                  </div>
                  {channel.status === 'connected' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => disconnectChannel(channel.id, 'whatsapp')}
                    >
                      Desconectar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instagram */}
        <Card className="bg-card/50 backdrop-blur border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="w-6 h-6 text-pink-500" />
              Instagram
            </CardTitle>
            <CardDescription>Conecte seu Instagram Business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Username do Instagram</Label>
              <Input
                placeholder="@seu_usuario"
                value={instagramUsername}
                onChange={(e) => setInstagramUsername(e.target.value)}
              />
            </div>

            <Button
              onClick={connectInstagram}
              disabled={connectingInstagram}
              className="w-full bg-pink-500 hover:bg-pink-600"
            >
              {connectingInstagram && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Conectar Instagram
            </Button>

            {/* Canais Instagram conectados */}
            <div className="space-y-2">
              {channels.filter(c => c.channel_type === 'instagram').map((channel) => (
                <div key={channel.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <div>
                    <p className="font-medium">@{channel.phone_number}</p>
                    {getStatusBadge(channel.status)}
                  </div>
                  {channel.status === 'connected' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => disconnectChannel(channel.id, 'instagram')}
                    >
                      Desconectar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
