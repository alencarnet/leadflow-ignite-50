import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, Phone, Instagram, Image, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Conversation {
  id: string;
  contact_name: string;
  contact_avatar?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
  channel_id: string;
  channel_type?: "whatsapp" | "instagram";
}

interface Message {
  id: string;
  content: string;
  sender_type: "user" | "contact";
  timestamp: string;
  status?: "sending" | "sent" | "delivered" | "read";
  media_url?: string;
  media_type?: string;
}

export default function Chat() {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    subscribeToConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      subscribeToMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select(`
        *,
        connected_channels!inner(channel_type)
      `)
      .order("last_message_time", { ascending: false });

    if (error) {
      console.error("Erro ao carregar conversas:", error);
      return;
    }

    const conversationsWithType = data.map((conv: any) => ({
      ...conv,
      channel_type: conv.connected_channels?.channel_type
    }));

    setConversations(conversationsWithType as Conversation[]);
  };

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("timestamp", { ascending: true });

    if (error) {
      console.error("Erro ao carregar mensagens:", error);
      return;
    }

    setMessages((data || []) as Message[]);
  };

  const subscribeToConversations = () => {
    const channel = supabase
      .channel("conversations_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToMessages = (conversationId: string) => {
    const channel = supabase
      .channel(`messages_${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-message", {
        body: {
          conversationId: selectedConversation,
          content: newMessage,
        },
      });

      if (error) throw error;

      setNewMessage("");
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro",
        description: "Falha ao enviar mensagem",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-4">
      {/* Lista de conversas */}
      <Card className="w-80 p-4 flex flex-col">
        <h2 className="text-lg font-bold mb-4">Conversas</h2>
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversation === conv.id
                    ? "bg-primary/10 border-2 border-primary"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={conv.contact_avatar} />
                    <AvatarFallback>
                      {conv.contact_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{conv.contact_name}</p>
                      {conv.channel_type === "whatsapp" && (
                        <Phone className="w-3 h-3 text-[#25D366]" />
                      )}
                      {conv.channel_type === "instagram" && (
                        <Instagram className="w-3 h-3 text-[#E1306C]" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.last_message || "Sem mensagens"}
                    </p>
                  </div>
                  {conv.unread_count && conv.unread_count > 0 ? (
                    <Badge variant="default" className="ml-auto">
                      {conv.unread_count}
                    </Badge>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Área de mensagens */}
      <Card className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            {/* Cabeçalho */}
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar>
                <AvatarImage src={selectedConv.contact_avatar} />
                <AvatarFallback>
                  {selectedConv.contact_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedConv.contact_name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {selectedConv.channel_type === "whatsapp" && (
                    <>
                      <Phone className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </>
                  )}
                  {selectedConv.channel_type === "instagram" && (
                    <>
                      <Instagram className="w-3 h-3" />
                      <span>Instagram</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender_type === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.media_url && (
                        <div className="mb-2">
                          {message.media_type?.startsWith("image") ? (
                            <img
                              src={message.media_url}
                              alt="Media"
                              className="rounded max-w-full"
                            />
                          ) : (
                            <a
                              href={message.media_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm underline"
                            >
                              <Paperclip className="w-4 h-4" />
                              Arquivo anexado
                            </a>
                          )}
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender_type === "user"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input de mensagem */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Image className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
                <Button onClick={sendMessage} disabled={loading || !newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Selecione uma conversa para começar</p>
          </div>
        )}
      </Card>
    </div>
  );
}
