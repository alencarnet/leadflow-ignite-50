import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const CRM = () => {
  const stages = [
    { id: "contact", name: "Primeiro Contato", color: "bg-blue-500", leads: 45 },
    { id: "progress", name: "Em Andamento", color: "bg-yellow-500", leads: 32 },
    { id: "payment", name: "Aguardando Pagamento", color: "bg-purple-500", leads: 18 },
    { id: "won", name: "Cliente Ganho", color: "bg-green-500", leads: 12 },
    { id: "lost", name: "Cliente Perdido", color: "bg-red-500", leads: 8 },
  ];

  const leadsInStages = {
    contact: [
      { id: "1", name: "Tech Solutions LTDA", score: 92, temp: "hot" },
      { id: "2", name: "Inovação Digital ME", score: 88, temp: "hot" },
      { id: "3", name: "Comércio XYZ", score: 65, temp: "warm" },
    ],
    progress: [
      { id: "4", name: "Indústria 4.0 S/A", score: 85, temp: "hot" },
      { id: "5", name: "Serviços Premium", score: 78, temp: "warm" },
    ],
    payment: [
      { id: "6", name: "TechCorp Brasil", score: 95, temp: "hot" },
    ],
    won: [
      { id: "7", name: "Digital Plus", score: 90, temp: "hot" },
      { id: "8", name: "Smart Business", score: 87, temp: "hot" },
    ],
    lost: [
      { id: "9", name: "Old Company", score: 42, temp: "cold" },
    ],
  };

  const totalLeads = stages.reduce((sum, stage) => sum + stage.leads, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Pipeline de CRM</h1>
        <p className="text-muted-foreground">Acompanhe visualmente o progresso dos seus leads</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((stage) => (
          <Card key={stage.id} className="border-t-4" style={{ borderTopColor: stage.color.replace('bg-', '#') }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
              <CardDescription className="text-2xl font-bold">{stage.leads}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {leadsInStages[stage.id as keyof typeof leadsInStages]?.map((lead) => (
                <div key={lead.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <p className="font-medium text-sm mb-2">{lead.name}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant={lead.temp === "hot" ? "default" : lead.temp === "warm" ? "secondary" : "outline"} className="text-xs">
                      {lead.temp === "hot" && "🔥"}
                      {lead.temp === "warm" && "🌡️"}
                      {lead.temp === "cold" && "❄️"}
                    </Badge>
                    <span className="text-xs font-semibold">{lead.score}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análise do Funil</CardTitle>
          <CardDescription>Distribuição de leads por estágio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stages.map((stage) => (
            <div key={stage.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{stage.name}</span>
                <span className="text-muted-foreground">
                  {stage.leads} leads ({((stage.leads / totalLeads) * 100).toFixed(1)}%)
                </span>
              </div>
              <Progress value={(stage.leads / totalLeads) * 100} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">24.8%</div>
            <p className="text-sm text-muted-foreground mt-1">+3.2% vs mês anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tempo Médio no Funil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">14.5 dias</div>
            <p className="text-sm text-muted-foreground mt-1">-2.3 dias vs mês anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Valor Total em Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">R$ 487.2k</div>
            <p className="text-sm text-muted-foreground mt-1">+18.7% vs mês anterior</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CRM;
