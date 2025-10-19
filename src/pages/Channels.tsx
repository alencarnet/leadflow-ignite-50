import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Phone, Instagram, QrCode, CheckCircle2, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ConnectedChannel {
  id: string;
  channel_type: "whatsapp" | "instagram";
  phone_number?: string;
  status: "disconnected" | "connecting" | "connected" | "error";
  qr_code?: string;
  last_connected_at?: string;
}

export default function Channels() {
  const { toast } = useToast();
  const [channels, setChannels] = useState<ConnectedChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [currentQR, setCurrentQR] = useState<string | null>(null);
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");
  const [instagramPassword, setInstagramPassword] = useState("");

  useEffect(() => {
    loadChannels();
    subscribeToChannelUpdates();
  }, []);

  const loadChannels = async () => {
    const { data, error } = await supabase
      .from("connected_channels")
      .select("*");

    if (error) {
      console.error("Erro ao carregar canais:", error);
      return;
    }

    setChannels((data || []) as ConnectedChannel[]);
  };

  const subscribeToChannelUpdates = () => {
    const channel = supabase
      .channel("connected_channels_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "connected_channels",
        },
        (payload) => {
          console.log("Channel update:", payload);
          loadChannels();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const connectWhatsApp = async () => {
    if (!whatsappPhone.trim()) {
      toast({
        title: "Erro",
        description: "Digite um número de telefone",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-connect", {
        body: { phone: whatsappPhone },
      });

      if (error) throw error;

      if (data.qr_code) {
        setCurrentQR(data.qr_code);
        setQrDialogOpen(true);
        toast({
          title: "QR Code Gerado",
          description: "Escaneie o QR Code com seu WhatsApp",
        });
      }
    } catch (error) {
      console.error("Erro ao conectar WhatsApp:", error);
      toast({
        title: "Erro",
        description: "Falha ao conectar WhatsApp",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const connectInstagram = async () => {
    if (!instagramUsername.trim() || !instagramPassword.trim()) {
      toast({
        title: "Erro",
        description: "Preencha usuário e senha do Instagram",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("instagram-connect", {
        body: { 
          username: instagramUsername,
          password: instagramPassword 
        },
      });

      if (error) throw error;

      toast({
        title: "Conectado",
        description: "Instagram conectado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao conectar Instagram:", error);
      toast({
        title: "Erro",
        description: "Falha ao conectar Instagram",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnectChannel = async (channelId: string) => {
    const { error } = await supabase
      .from("connected_channels")
      .delete()
      .eq("id", channelId);

    if (error) {
      toast({
        title: "Erro",
        description: "Falha ao desconectar canal",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Desconectado",
        description: "Canal desconectado com sucesso",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "connecting":
        return <Loader2 className="w-5 h-5 text-warning animate-spin" />;
      default:
        return <XCircle className="w-5 h-5 text-danger" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Canais de Comunicação</h1>
        <p className="text-muted-foreground">Conecte WhatsApp e Instagram para gerenciar conversas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WhatsApp Card */}
        <Card className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#25D366]/20 flex items-center justify-center">
              <Phone className="w-6 h-6 text-[#25D366]" />
            </div>
            <div>
              <h2 className="text-xl font-bold">WhatsApp</h2>
              <p className="text-sm text-muted-foreground">Solução não oficial via Baileys</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="whatsapp-phone">
                Número do WhatsApp
              </Label>
              <Input
                id="whatsapp-phone"
                type="tel"
                placeholder="+55 11 99999-9999"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button
              onClick={connectWhatsApp}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <QrCode className="w-4 h-4 mr-2" />
              )}
              Conectar WhatsApp
            </Button>
          </div>

          <div className="space-y-2">
            {channels
              .filter((ch) => ch.channel_type === "whatsapp")
              .map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(channel.status)}
                    <div>
                      <p className="text-sm font-medium">
                        {channel.phone_number}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{channel.status}</p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => disconnectChannel(channel.id)}
                  >
                    Desconectar
                  </Button>
                </div>
              ))}
          </div>
        </Card>

        {/* Instagram Card */}
        <Card className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E1306C] to-[#FD8D32] flex items-center justify-center">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Instagram Direct</h2>
              <p className="text-sm text-muted-foreground">Solução não oficial</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="instagram-username">
                Usuário do Instagram
              </Label>
              <Input
                id="instagram-username"
                type="text"
                placeholder="seu_usuario"
                value={instagramUsername}
                onChange={(e) => setInstagramUsername(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="instagram-password">
                Senha
              </Label>
              <Input
                id="instagram-password"
                type="password"
                placeholder="••••••••"
                value={instagramPassword}
                onChange={(e) => setInstagramPassword(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button
              onClick={connectInstagram}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Instagram className="w-4 h-4 mr-2" />
              )}
              Conectar Instagram
            </Button>
          </div>

          <div className="space-y-2">
            {channels
              .filter((ch) => ch.channel_type === "instagram")
              .map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(channel.status)}
                    <div>
                      <p className="text-sm font-medium">Instagram</p>
                      <p className="text-xs text-muted-foreground capitalize">{channel.status}</p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => disconnectChannel(channel.id)}
                  >
                    Desconectar
                  </Button>
                </div>
              ))}
          </div>
        </Card>
      </div>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Escanear QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 p-4">
            {currentQR && (
              <div className="bg-white p-4 rounded-lg">
                <img src={currentQR} alt="QR Code" className="w-64 h-64" />
              </div>
            )}
            <p className="text-muted-foreground text-center text-sm">
              Abra o WhatsApp no seu celular e escaneie este QR Code
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
