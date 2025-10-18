import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, MoreVertical } from "lucide-react";

const Chat = () => {
  const [selectedConversation, setSelectedConversation] = useState("1");
  const [message, setMessage] = useState("");

  const conversations = [
    {
      id: "1",
      lead: "Tech Solutions LTDA",
      channel: "whatsapp",
      lastMessage: "Olá, gostaria de saber mais sobre os planos disponíveis",
      time: "2 min",
      unread: 2,
      online: true
    },
    {
      id: "2",
      lead: "Inovação Digital ME",
      channel: "instagram",
      lastMessage: "Qual o prazo de entrega?",
      time: "5 min",
      unread: 0,
      online: true
    },
    {
      id: "3",
      lead: "Comércio XYZ",
      channel: "whatsapp",
      lastMessage: "Podemos agendar uma reunião?",
      time: "12 min",
      unread: 1,
      online: false
    },
    {
      id: "4",
      lead: "Serviços ABC",
      channel: "instagram",
      lastMessage: "Obrigado pelas informações!",
      time: "1h",
      unread: 0,
      online: false
    },
  ];

  const messages = [
    { id: "1", from: "lead", text: "Olá! Tudo bem?", time: "10:23" },
    { id: "2", from: "user", text: "Olá! Tudo ótimo, e você?", time: "10:24" },
    { id: "3", from: "lead", text: "Gostaria de saber mais sobre os planos disponíveis", time: "10:25" },
    { id: "4", from: "user", text: "Claro! Temos 3 planos principais: Básico, Profissional e Enterprise. Qual o seu interesse?", time: "10:26" },
    { id: "5", from: "lead", text: "Me fale mais sobre o plano Profissional", time: "10:28" },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending:", message);
      setMessage("");
    }
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Chat Omnichannel</h1>
          <p className="text-muted-foreground">Centralize WhatsApp e Instagram em um só lugar</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-success/20 text-success border-success">
            {conversations.filter(c => c.online).length} Online
          </Badge>
          <Badge className="bg-primary/20 text-primary border-primary">
            {conversations.reduce((acc, c) => acc + c.unread, 0)} Não lidas
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
        <Card className="md:col-span-1 glass-card shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Conversas</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar conversas..." className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-360px)]">
              <div className="space-y-1 p-4 pt-0">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conv.id ? 'bg-primary/10' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="text-2xl">
                      {conv.channel === "whatsapp" ? "💬" : "📸"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{conv.lead}</p>
                        <span className="text-xs text-muted-foreground">{conv.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <Badge variant="default" className="rounded-full px-2">
                        {conv.unread}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 flex flex-col glass-card shadow-card">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-2xl">
                  {selectedConv?.channel === "whatsapp" ? "💬" : "📸"}
                </div>
                <div>
                  <CardTitle className="text-base text-foreground">{selectedConv?.lead}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {selectedConv?.online && (
                      <>
                        <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
                        <span className="text-success">Online agora</span>
                      </>
                    )}
                    {!selectedConv?.online && (
                      <>
                        <span className="w-2 h-2 bg-muted-foreground rounded-full"></span>
                        <span className="text-muted-foreground">Offline</span>
                      </>
                    )}
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="glass-button">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 p-6 bg-background/50">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                >
                  <div className={`max-w-[70%] ${msg.from === 'user' ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-card border border-border/50'} rounded-2xl px-4 py-3`}>
                    <p className={`text-sm ${msg.from === 'user' ? 'text-primary-foreground' : 'text-foreground'}`}>{msg.text}</p>
                    <p className={`text-xs mt-2 ${msg.from === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <CardContent className="border-t border-border/50 p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="bg-muted/30"
              />
              <Button onClick={handleSendMessage} className="bg-primary hover:bg-primary/90 glow-effect">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;
