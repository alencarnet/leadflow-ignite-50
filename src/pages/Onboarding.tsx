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
      localStorage.setItem("onboardingComplete", "true");
      localStorage.setItem("businessConfig", JSON.stringify(formData));
      toast.success("Configuração concluída! Bem-vindo ao SaaSCapture");
      navigate("/dashboard");
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SaaSCapture
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

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              {step === 1 && <Building2 className="w-8 h-8 text-primary" />}
              {step === 2 && <MessageSquare className="w-8 h-8 text-primary" />}
              {step === 3 && <BarChart3 className="w-8 h-8 text-primary" />}
              <div>
                <CardTitle>
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
                  { id: "whatsapp", label: "WhatsApp Business", icon: "💬" },
                  { id: "instagram", label: "Instagram Direct", icon: "📸" }
                ].map((channel) => (
                  <div key={channel.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => toggleChannel(channel.id)}>
                    <Checkbox checked={formData.channels.includes(channel.id)} />
                    <span className="text-2xl">{channel.icon}</span>
                    <Label className="cursor-pointer flex-1">{channel.label}</Label>
                  </div>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                {[
                  "Total de Leads",
                  "Leads Quentes",
                  "Conversas Ativas",
                  "Taxa de Conversão",
                  "Mensagens Enviadas",
                  "Clientes Ganhos"
                ].map((metric) => (
                  <div key={metric} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => toggleMetric(metric)}>
                    <Checkbox checked={formData.dashboardMetrics.includes(metric)} />
                    <Label className="cursor-pointer flex-1">{metric}</Label>
                  </div>
                ))}
              </div>
            )}

            <Button onClick={handleNext} className="w-full" size="lg">
              {step === 3 ? "Concluir Configuração" : "Próximo"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
