import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Building2, MessageSquare, BarChart3, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: "",
    sector: "",
    channels: [] as string[],
    dashboardMetrics: [] as string[],
  });

  const handleNext = () => {
    if (step === 1) {
      if (!formData.businessName || !formData.sector) {
        toast.error("Por favor, preencha todos os campos");
        return;
      }
    }
    if (step === 2 && formData.channels.length === 0) {
      toast.error("Selecione pelo menos um canal de comunicação");
      return;
    }
    if (step === 3 && formData.dashboardMetrics.length === 0) {
      toast.error("Selecione pelo menos uma métrica");
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Salvar configuração completa
      const config = {
        ...formData,
        connectedChannels: formData.channels,
        configuredAt: new Date().toISOString(),
        isWhatsAppConnected: formData.channels.includes("whatsapp"),
        isInstagramConnected: formData.channels.includes("instagram")
      };
      
      localStorage.setItem("onboardingComplete", "true");
      localStorage.setItem("businessConfig", JSON.stringify(config));
      localStorage.setItem("connectedChannels", JSON.stringify(formData.channels));
      
      toast.success("Configuração concluída! Canais conectados com sucesso!");
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    }
  };

  const toggleChannel = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const toggleMetric = (metric: string) => {
    setFormData(prev => ({
      ...prev,
      dashboardMetrics: prev.dashboardMetrics.includes(metric)
        ? prev.dashboardMetrics.filter(m => m !== metric)
        : [...prev.dashboardMetrics, metric]
    }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-2xl relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-primary/10 rounded-2xl mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            Bem-vindo ao <span className="text-primary">FluxoLead AI</span>
          </h1>
          <p className="text-muted-foreground">Configure sua experiência em 3 passos simples</p>
        </div>

        <div className="flex items-center justify-center mb-8 gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && <div className={`w-16 h-1 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        <Card className="glass-card shadow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                {step === 1 && <Building2 className="w-6 h-6 text-primary" />}
                {step === 2 && <MessageSquare className="w-6 h-6 text-primary" />}
                {step === 3 && <BarChart3 className="w-6 h-6 text-primary" />}
              </div>
              <div>
                <CardTitle className="text-foreground">
                  {step === 1 && "Informações do Negócio"}
                  {step === 2 && "Canais de Comunicação"}
                  {step === 3 && "Preferências do Dashboard"}
                </CardTitle>
                <CardDescription>
                  {step === 1 && "Conte-nos sobre sua empresa"}
                  {step === 2 && "Escolha os canais que deseja utilizar"}
                  {step === 3 && "Personalize as métricas do seu dashboard"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nome da Empresa</Label>
                  <Input
                    id="businessName"
                    placeholder="Ex: Tech Solutions LTDA"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Setor de Atuação</Label>
                  <RadioGroup value={formData.sector} onValueChange={(value) => setFormData({ ...formData, sector: value })}>
                    {["Tecnologia", "Varejo", "Serviços", "Indústria", "Saúde", "Educação", "Outro"].map((sector) => (
                      <div key={sector} className="flex items-center space-x-2">
                        <RadioGroupItem value={sector} id={sector} />
                        <Label htmlFor={sector} className="cursor-pointer">{sector}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-4">
                {[
                  { id: "whatsapp", label: "WhatsApp Business", icon: "💬", description: "Conecte e gerencie conversas do WhatsApp" },
                  { id: "instagram", label: "Instagram Direct", icon: "📸", description: "Integre mensagens diretas do Instagram" }
                ].map((channel) => (
                  <div 
                    key={channel.id} 
                    className={`flex items-center space-x-3 p-5 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.channels.includes(channel.id)
                        ? 'border-primary bg-primary/10 glow-effect'
                        : 'border-border/50 hover:border-primary/50 hover:bg-muted/30'
                    }`}
                    onClick={() => toggleChannel(channel.id)}
                  >
                    <Checkbox checked={formData.channels.includes(channel.id)} />
                    <span className="text-3xl">{channel.icon}</span>
                    <div className="flex-1">
                      <Label className="cursor-pointer font-semibold text-foreground">{channel.label}</Label>
                      <p className="text-sm text-muted-foreground">{channel.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Total de Leads", icon: "👥" },
                  { name: "Leads Quentes", icon: "🔥" },
                  { name: "Conversas Ativas", icon: "💬" },
                  { name: "Taxa de Conversão", icon: "📈" },
                  { name: "Mensagens Enviadas", icon: "📨" },
                  { name: "Clientes Ganhos", icon: "✅" }
                ].map((metric) => (
                  <div 
                    key={metric.name} 
                    className={`flex flex-col items-center space-y-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.dashboardMetrics.includes(metric.name)
                        ? 'border-primary bg-primary/10 glow-effect'
                        : 'border-border/50 hover:border-primary/50 hover:bg-muted/30'
                    }`}
                    onClick={() => toggleMetric(metric.name)}
                  >
                    <Checkbox checked={formData.dashboardMetrics.includes(metric.name)} />
                    <span className="text-2xl">{metric.icon}</span>
                    <Label className="cursor-pointer text-center text-sm font-medium">{metric.name}</Label>
                  </div>
                ))}
              </div>
            )}

            <Button onClick={handleNext} className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground glow-effect" size="lg">
              {step === 3 ? "🚀 Começar Agora" : "Próximo Passo"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
