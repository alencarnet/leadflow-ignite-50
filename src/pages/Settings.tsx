import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const Settings = () => {
  const handleSave = () => {
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
            <CardDescription>Atualize os dados da sua empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Nome da Empresa</Label>
              <Input id="businessName" defaultValue="Tech Solutions LTDA" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sector">Setor</Label>
              <Input id="sector" defaultValue="Tecnologia" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" placeholder="+55 11 99999-9999" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="contato@empresa.com" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrações</CardTitle>
            <CardDescription>Configure as integrações com APIs externas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whapiToken">Whapi.Cloud Token</Label>
              <Input id="whapiToken" type="password" placeholder="Digite seu token" />
              <p className="text-xs text-muted-foreground">
                Obtenha em: <a href="https://whapi.cloud" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">whapi.cloud</a>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="openaiKey">OpenAI API Key</Label>
              <Input id="openaiKey" type="password" placeholder="Digite sua API key" />
              <p className="text-xs text-muted-foreground">
                Para qualificação de leads por IA
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpjApi">API de CNPJ</Label>
              <Input id="cnpjApi" defaultValue="https://brasilapi.com.br/api/cnpj/v1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>Configure como deseja receber notificações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Novas Mensagens</Label>
                <p className="text-sm text-muted-foreground">Receba notificações de novas mensagens</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Novos Leads</Label>
                <p className="text-sm text-muted-foreground">Notificação quando um novo lead for adicionado</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mudanças no Pipeline</Label>
                <p className="text-sm text-muted-foreground">Quando um lead mudar de estágio</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Relatórios Semanais</Label>
                <p className="text-sm text-muted-foreground">Receba resumo semanal por e-mail</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Qualificação de Leads</CardTitle>
            <CardDescription>Configure os parâmetros de qualificação por IA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Qualificação Automática</Label>
                <p className="text-sm text-muted-foreground">Qualificar leads automaticamente ao adicionar</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Threshold para "Quente"</Label>
              <Input type="number" defaultValue="70" min="0" max="100" />
              <p className="text-xs text-muted-foreground">Score mínimo para classificar como quente</p>
            </div>
            <div className="space-y-2">
              <Label>Threshold para "Morno"</Label>
              <Input type="number" defaultValue="40" min="0" max="100" />
              <p className="text-xs text-muted-foreground">Score mínimo para classificar como morno</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancelar</Button>
          <Button onClick={handleSave}>Salvar Configurações</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
