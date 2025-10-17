import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Upload, MessageCircle, Filter, Download } from "lucide-react";
import { toast } from "sonner";

const Leads = () => {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cnpjSearch, setCnpjSearch] = useState("");


  const toggleLead = (id: string) => {
    setSelectedLeads(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const [leads, setLeads] = useState([
    { id: "1", name: "Tech Solutions LTDA", cnpj: "12.345.678/0001-90", sector: "Tecnologia", temp: "hot", score: 92, status: "Primeiro Contato", phone: "+5511999999999" },
    { id: "2", name: "Inovação Digital ME", cnpj: "98.765.432/0001-10", sector: "Marketing", temp: "hot", score: 88, status: "Em Andamento", phone: "+5511988888888" },
    { id: "3", name: "Comércio XYZ", cnpj: "11.222.333/0001-44", sector: "Varejo", temp: "warm", score: 65, status: "Primeiro Contato", phone: "+5511977777777" },
    { id: "4", name: "Serviços ABC", cnpj: "44.555.666/0001-77", sector: "Serviços", temp: "cold", score: 38, status: "Primeiro Contato", phone: "+5511966666666" },
    { id: "5", name: "Indústria 4.0 S/A", cnpj: "22.333.444/0001-88", sector: "Indústria", temp: "hot", score: 85, status: "Aguardando Pagamento", phone: "+5511955555555" },
  ]);

  const handleBuscarCNPJ = async () => {
    if (!cnpjSearch) {
      toast.error("Digite um CNPJ para buscar");
      return;
    }
    
    const cleanCNPJ = cnpjSearch.replace(/\D/g, '');
    if (cleanCNPJ.length !== 14) {
      toast.error("CNPJ inválido. Digite 14 dígitos.");
      return;
    }

    toast.loading("Buscando informações do CNPJ...");
    
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`);
      
      if (!response.ok) {
        toast.error("CNPJ não encontrado na base de dados");
        return;
      }

      const data = await response.json();
      
      const newLead = {
        id: Date.now().toString(),
        name: data.razao_social || data.nome_fantasia || "Empresa sem nome",
        cnpj: cnpjSearch,
        sector: data.cnae_fiscal_descricao || "Não especificado",
        temp: "warm" as const,
        score: 50,
        status: "Novo Lead",
        phone: data.ddd_telefone_1 ? `+55${data.ddd_telefone_1}` : "+5500000000000"
      };

      setLeads(prev => [newLead, ...prev]);
      toast.success(`Lead "${newLead.name}" adicionado com sucesso!`);
      setCnpjSearch("");
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      toast.error("Erro ao buscar CNPJ. Tente novamente.");
    }
  };

  const handleImportarCNPJ = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`Importando ${file.name}...`);
      setTimeout(() => {
        toast.success("15 leads importados com sucesso!");
      }, 2000);
    }
  };

  const handleSendWhatsApp = () => {
    if (selectedLeads.length === 0) {
      toast.error("Selecione pelo menos um lead");
      return;
    }
    toast.success(`Enviando mensagem para ${selectedLeads.length} lead(s)...`);
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.cnpj.includes(searchQuery) ||
    lead.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gerenciamento de Leads</h1>
          <p className="text-muted-foreground">Gerencie seus leads e prospecções</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Buscar CNPJ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buscar CNPJ</DialogTitle>
                <DialogDescription>Digite o CNPJ para buscar informações da empresa</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>CNPJ</Label>
                  <Input
                    placeholder="00.000.000/0000-00"
                    value={cnpjSearch}
                    onChange={(e) => setCnpjSearch(e.target.value)}
                  />
                </div>
                <Button onClick={handleBuscarCNPJ} className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Importar CNPJ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar CNPJs</DialogTitle>
                <DialogDescription>Faça upload de um arquivo CSV ou Excel com os CNPJs</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">Clique para selecionar ou arraste o arquivo</p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleImportarCNPJ}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" asChild>
                      <span>Selecionar Arquivo</span>
                    </Button>
                  </label>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Leads</CardTitle>
              <CardDescription>{filteredLeads.length} leads encontrados</CardDescription>
            </div>
            {selectedLeads.length > 0 && (
              <Button onClick={handleSendWhatsApp}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Enviar WhatsApp ({selectedLeads.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CNPJ ou setor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>

          <div className="space-y-2">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  checked={selectedLeads.includes(lead.id)}
                  onCheckedChange={() => toggleLead(lead.id)}
                />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.cnpj}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Setor</p>
                    <p className="text-sm text-muted-foreground">{lead.sector}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Qualificação</p>
                    <Badge variant={lead.temp === "hot" ? "default" : lead.temp === "warm" ? "secondary" : "outline"}>
                      {lead.temp === "hot" && "🔥 Quente"}
                      {lead.temp === "warm" && "🌡️ Morno"}
                      {lead.temp === "cold" && "❄️ Frio"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Score</p>
                    <p className="text-sm font-semibold">{lead.score}/100</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">{lead.status}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leads;
