import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Flame, MessageSquare, TrendingUp, Send, Trophy, ArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const metrics = [
    { title: "Total de Leads", value: "1,284", change: "+12.5%", icon: Users, color: "text-blue-500" },
    { title: "Leads Quentes", value: "342", change: "+8.2%", icon: Flame, color: "text-orange-500" },
    { title: "Conversas Ativas", value: "89", change: "+23.1%", icon: MessageSquare, color: "text-green-500" },
    { title: "Taxa de Conversão", value: "24.8%", change: "+3.2%", icon: TrendingUp, color: "text-purple-500" },
    { title: "Mensagens Enviadas", value: "5,432", change: "+15.4%", icon: Send, color: "text-cyan-500" },
    { title: "Clientes Ganhos", value: "186", change: "+18.7%", icon: Trophy, color: "text-yellow-500" },
  ];

  const recentLeads = [
    { name: "Tech Solutions LTDA", cnpj: "12.345.678/0001-90", temp: "hot", score: 92 },
    { name: "Inovação Digital ME", cnpj: "98.765.432/0001-10", temp: "hot", score: 88 },
    { name: "Comércio XYZ", cnpj: "11.222.333/0001-44", temp: "warm", score: 65 },
    { name: "Serviços ABC", cnpj: "44.555.666/0001-77", temp: "cold", score: 38 },
  ];

  const recentConversations = [
    { lead: "Tech Solutions", channel: "whatsapp", message: "Olá, gostaria de saber mais sobre...", time: "2 min" },
    { lead: "Inovação Digital", channel: "instagram", message: "Qual o prazo de entrega?", time: "5 min" },
    { lead: "Comércio XYZ", channel: "whatsapp", message: "Podemos agendar uma reunião?", time: "12 min" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das suas métricas e atividades em tempo real</p>
        </div>
        <div className="glass-card px-4 py-2 rounded-lg">
          <p className="text-xs text-muted-foreground">Atualizado agora</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, index) => (
          <Card key={metric.title} className="glass-card shadow-card hover:shadow-glow transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <metric.icon className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{metric.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                <ArrowUp className="h-3 w-3 text-success" />
                <span className="text-success font-medium">{metric.change}</span> vs mês anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">Leads Recentes</CardTitle>
            <CardDescription>Últimos leads adicionados ao sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.cnpj} className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
                  <div>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.cnpj}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      className={`${lead.temp === "hot" ? "bg-destructive/20 text-destructive border-destructive" : lead.temp === "warm" ? "bg-warning/20 text-warning border-warning" : "bg-info/20 text-info border-info"} border`}
                    >
                      {lead.temp === "hot" && "🔥 Quente"}
                      {lead.temp === "warm" && "🌡️ Morno"}
                      {lead.temp === "cold" && "❄️ Frio"}
                    </Badge>
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary">{lead.score}</p>
                      <p className="text-xs text-muted-foreground">score</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">Conversas Recentes</CardTitle>
            <CardDescription>Últimas interações com leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentConversations.map((conv, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 border border-border/50 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
                  <div className="text-3xl flex-shrink-0">
                    {conv.channel === "whatsapp" ? "💬" : "📸"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{conv.lead}</p>
                      <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">{conv.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conv.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
