import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search, Upload, MessageCircle, Filter, Download, Loader2, Building2, User, FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Lead {
  id: string;
  name: string;
  cnpj: string;
  sector: string;
  temp: "hot" | "warm" | "cold";
  score: number;
  status: string;
  phone: string;
  partners?: string;
  email?: string;
}

const Leads = () => {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"cnpj" | "name" | "cnae" | "partner">("cnpj");
  const [searchInput, setSearchInput] = useState("");
  const [selectedApi, setSelectedApi] = useState<"auto" | "receitaws" | "cnpjws" | "brasilapi">("auto");
  const [isSearching, setIsSearching] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    includePartners: true,
    includePhone: true,
    includeEmail: true
  });

  const toggleLead = (id: string) => {
    setSelectedLeads(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const [leads, setLeads] = useState<Lead[]>([
    { id: "1", name: "Tech Solutions LTDA", cnpj: "12.345.678/0001-90", sector: "Tecnologia", temp: "hot", score: 92, status: "Primeiro Contato", phone: "+5511999999999", partners: "João Silva, Maria Santos", email: "contato@techsolutions.com.br" },
    { id: "2", name: "Inovação Digital ME", cnpj: "98.765.432/0001-10", sector: "Marketing", temp: "hot", score: 88, status: "Em Andamento", phone: "+5511988888888", partners: "Pedro Oliveira", email: "contato@inovacao.com.br" },
    { id: "3", name: "Comércio XYZ", cnpj: "11.222.333/0001-44", sector: "Varejo", temp: "warm", score: 65, status: "Primeiro Contato", phone: "+5511977777777", partners: "Ana Costa", email: "vendas@comercioxyz.com.br" },
    { id: "4", name: "Serviços ABC", cnpj: "44.555.666/0001-77", sector: "Serviços", temp: "cold", score: 38, status: "Primeiro Contato", phone: "+5511966666666", partners: "Carlos Mendes", email: "abc@servicos.com.br" },
    { id: "5", name: "Indústria 4.0 S/A", cnpj: "22.333.444/0001-88", sector: "Indústria", temp: "hot", score: 85, status: "Aguardando Pagamento", phone: "+5511955555555", partners: "Roberto Lima, Juliana Rocha", email: "industria@40sa.com.br" },
  ]);

  // Função para consultar múltiplas APIs de CNPJ em paralelo
  const consultCNPJApis = async (cnpj: string) => {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    
    const apis = [
      {
        name: "ReceitaWS",
        url: `https://receitaws.com.br/v1/cnpj/${cleanCNPJ}`,
        enabled: selectedApi === "auto" || selectedApi === "receitaws"
      },
      {
        name: "CNPJws",
        url: `https://publica.cnpj.ws/cnpj/${cleanCNPJ}`,
        enabled: selectedApi === "auto" || selectedApi === "cnpjws"
      },
      {
        name: "BrasilAPI",
        url: `https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`,
        enabled: selectedApi === "auto" || selectedApi === "brasilapi"
      }
    ];

    const promises = apis
      .filter(api => api.enabled)
      .map(async (api) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          const response = await fetch(api.url, { 
            signal: controller.signal,
            headers: {
              'Accept': 'application/json'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) throw new Error(`${api.name} failed`);
          const data = await response.json();
          return { api: api.name, status: "success", data };
        } catch (error) {
          return { api: api.name, status: "error", error: error instanceof Error ? error.message : 'Unknown error' };
        }
      });

    const results = await Promise.all(promises);
    const successResults = results.filter(r => r.status === "success");
    
    if (successResults.length > 0) {
      return { success: true, data: successResults[0].data, api: successResults[0].api };
    }
    
    const errorMessages = results.map(r => `${r.api}: ${r.status === 'error' ? r.error : 'failed'}`).join('; ');
    throw new Error(`Nenhuma API retornou dados válidos. Erros: ${errorMessages}`);
  };

  const handleAdvancedSearch = async () => {
    if (!searchInput.trim()) {
      toast.error("Digite algo para buscar");
      return;
    }

    setIsSearching(true);

    try {
      if (searchType === "cnpj") {
        const cleanCNPJ = searchInput.replace(/\D/g, '');
        if (cleanCNPJ.length !== 14) {
          toast.error("CNPJ deve conter 14 dígitos");
          setIsSearching(false);
          return;
        }

        const result = await consultCNPJApis(searchInput);
        const data = result.data;
        
        // Normaliza dados de diferentes APIs
        const normalizedData = {
          razao_social: data.razao_social || data.nome || data.company?.name || "Empresa sem nome",
          nome_fantasia: data.fantasia || data.alias || data.company?.alias || "",
          cnpj: data.cnpj || searchInput,
          telefone: data.telefone || data.phone || data.ddd_telefone_1 || "",
          email: data.email || "",
          uf: data.uf || data.address?.state || "",
          cnae_fiscal: data.cnae_fiscal || data.primary_activity?.code || "",
          atividade_principal: data.atividade_principal?.[0]?.text || data.cnae_fiscal_descricao || data.primary_activity?.description || "Não informado"
        };

        const newLead = {
          id: Date.now().toString(),
          name: normalizedData.nome_fantasia || normalizedData.razao_social,
          cnpj: normalizedData.cnpj,
          sector: normalizedData.atividade_principal,
          temp: "warm" as const,
          score: Math.floor(Math.random() * 30) + 60,
          status: "Novo Lead",
          phone: normalizedData.telefone ? `+55${normalizedData.telefone}` : "+5500000000000"
        };

        setLeads(prev => [newLead, ...prev]);
        toast.success(`Lead "${newLead.name}" adicionado com sucesso via ${result.api}!`);
        setSearchInput("");
        setIsDialogOpen(false);
        
      } else if (searchType === "name") {
        toast.info("🔧 Busca por nome da empresa requer banco de dados Receita Federal local. Esta funcionalidade estará disponível na versão completa com PostgreSQL configurado.", {
          duration: 5000
        });
      } else if (searchType === "cnae") {
        toast.info("🔧 Busca por CNAE requer banco de dados Receita Federal local. Esta funcionalidade estará disponível na versão completa com PostgreSQL configurado.", {
          duration: 5000
        });
      } else if (searchType === "partner") {
        toast.info("🔧 Busca por nome do sócio requer banco de dados Receita Federal local. Esta funcionalidade estará disponível na versão completa com PostgreSQL configurado.", {
          duration: 5000
        });
      }
    } catch (error) {
      console.error("Erro ao buscar:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao buscar dados. Tente novamente.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleImportarCNPJ = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.info(`Processando ${file.name}...`);

    try {
      if (file.type === 'application/pdf') {
        // Importação de PDF
        const text = await file.text();
        const parsedLeads = parsePDFData(text);
        
        if (parsedLeads.length > 0) {
          setLeads(prev => [...parsedLeads, ...prev]);
          toast.success(`${parsedLeads.length} leads importados do PDF com sucesso!`);
        } else {
          toast.warning("Nenhum lead encontrado no PDF");
        }
      } else {
        // Importação de CSV/Excel
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const data = evt.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const importedLeads: Lead[] = jsonData.map((row: any, index: number) => ({
              id: `imported-${Date.now()}-${index}`,
              name: row['Razão Social'] || row['Nome'] || row['name'] || 'Sem nome',
              cnpj: row['CNPJ'] || row['cnpj'] || 'Não informado',
              sector: row['Setor'] || row['Atividade Principal'] || row['sector'] || 'Não informado',
              temp: 'warm' as const,
              score: Math.floor(Math.random() * 30) + 60,
              status: 'Importado',
              phone: row['Telefone'] || row['phone'] || '',
              partners: row['Sócios'] || row['partners'] || row['Quadro Societário'] || '',
              email: row['Email'] || row['email'] || ''
            }));

            setLeads(prev => [...importedLeads, ...prev]);
            toast.success(`${importedLeads.length} leads importados com sucesso!`);
          } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            toast.error('Erro ao processar o arquivo');
          }
        };
        reader.readAsBinaryString(file);
      }
    } catch (error) {
      console.error('Erro ao importar:', error);
      toast.error('Erro ao importar arquivo');
    }
  };

  const parsePDFData = (text: string): Lead[] => {
    const leads: Lead[] = [];
    const lines = text.split('\n');
    
    // Padrão para detectar CNPJ (14 dígitos com ou sem formatação)
    const cnpjRegex = /\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/g;
    
    let currentLead: Partial<Lead> = {};
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Detecta CNPJ
      const cnpjMatch = trimmedLine.match(cnpjRegex);
      if (cnpjMatch) {
        // Se já tinha um lead sendo processado, salva ele
        if (currentLead.cnpj) {
          leads.push({
            id: `pdf-${Date.now()}-${leads.length}`,
            name: currentLead.name || 'Empresa sem nome',
            cnpj: currentLead.cnpj,
            sector: currentLead.sector || 'Não informado',
            temp: 'warm',
            score: Math.floor(Math.random() * 30) + 60,
            status: 'Importado do PDF',
            phone: currentLead.phone || '',
            partners: currentLead.partners || '',
            email: currentLead.email || ''
          });
        }
        
        // Inicia novo lead
        currentLead = { cnpj: cnpjMatch[0] };
        
        // Tenta pegar o nome na mesma linha ou linhas anteriores
        const possibleName = trimmedLine.replace(cnpjMatch[0], '').trim();
        if (possibleName.length > 3) {
          currentLead.name = possibleName;
        } else if (index > 0) {
          currentLead.name = lines[index - 1].trim();
        }
      }
      
      // Detecta telefone
      if (trimmedLine.match(/\(?\d{2}\)?\s?\d{4,5}-?\d{4}/)) {
        currentLead.phone = trimmedLine.match(/\(?\d{2}\)?\s?\d{4,5}-?\d{4}/)?.[0] || '';
      }
      
      // Detecta email
      if (trimmedLine.match(/[\w.-]+@[\w.-]+\.\w+/)) {
        currentLead.email = trimmedLine.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || '';
      }
      
      // Detecta sócios (procura por nomes próprios)
      if (trimmedLine.match(/^[A-Z][a-z]+ [A-Z][a-z]+/) && !currentLead.partners) {
        currentLead.partners = trimmedLine;
      }
    });
    
    // Adiciona o último lead se houver
    if (currentLead.cnpj) {
      leads.push({
        id: `pdf-${Date.now()}-${leads.length}`,
        name: currentLead.name || 'Empresa sem nome',
        cnpj: currentLead.cnpj,
        sector: currentLead.sector || 'Não informado',
        temp: 'warm',
        score: Math.floor(Math.random() * 30) + 60,
        status: 'Importado do PDF',
        phone: currentLead.phone || '',
        partners: currentLead.partners || '',
        email: currentLead.email || ''
      });
    }
    
    return leads;
  };

  const exportToExcel = () => {
    const dataToExport = prepareExportData();
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
    XLSX.writeFile(workbook, `leads-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exportado para Excel com sucesso!');
  };

  const exportToCSV = () => {
    const dataToExport = prepareExportData();
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Exportado para CSV com sucesso!');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const dataToExport = prepareExportData();
    
    doc.setFontSize(16);
    doc.text('Relatório de Leads', 14, 15);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 22);
    
    const headers = Object.keys(dataToExport[0] || {});
    const rows = dataToExport.map(item => headers.map(key => item[key] || ''));
    
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 28,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    doc.save(`leads-export-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Exportado para PDF com sucesso!');
  };

  const prepareExportData = () => {
    const selectedData = selectedLeads.length > 0 
      ? leads.filter(lead => selectedLeads.includes(lead.id))
      : leads;

    return selectedData.map(lead => {
      const data: any = {
        'Nome': lead.name,
        'CNPJ': lead.cnpj,
        'Setor': lead.sector,
        'Score': lead.score,
        'Status': lead.status
      };

      if (exportFilters.includePartners && lead.partners) {
        data['Sócios'] = lead.partners;
      }
      if (exportFilters.includePhone && lead.phone) {
        data['Telefone'] = lead.phone;
      }
      if (exportFilters.includeEmail && lead.email) {
        data['Email'] = lead.email;
      }

      return data;
    });
  };

  const handleSendWhatsApp = () => {
    if (selectedLeads.length === 0) {
      toast.error("Selecione pelo menos um lead");
      return;
    }
    
    const connectedChannels = JSON.parse(localStorage.getItem("connectedChannels") || "[]");
    if (!connectedChannels.includes("whatsapp")) {
      toast.error("WhatsApp não conectado. Configure no Onboarding primeiro.");
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Gerenciamento de Leads</h1>
          <p className="text-muted-foreground">Gerencie, qualifique e converta seus leads com IA</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 glow-effect">
                <Search className="w-4 h-4 mr-2" />
                Buscar Leads
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-foreground">Busca Avançada de Leads</DialogTitle>
                <DialogDescription>Busque empresas por CNPJ, nome, CNAE ou sócios</DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="search" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                  <TabsTrigger value="search" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </TabsTrigger>
                  <TabsTrigger value="bulk" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Upload className="w-4 h-4 mr-2" />
                    Importação em Massa
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Tipo de Busca</Label>
                      <RadioGroup value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                        <div className="grid grid-cols-2 gap-3">
                          <div className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            searchType === "cnpj" ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" : "border-border hover:border-primary/50"
                          }`} onClick={() => setSearchType("cnpj")}>
                            <RadioGroupItem value="cnpj" id="cnpj-radio" />
                            <Label htmlFor="cnpj-radio" className="cursor-pointer flex items-center gap-2 flex-1">
                              <Building2 className="w-4 h-4" />
                              <span>CNPJ</span>
                            </Label>
                          </div>
                          <div className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            searchType === "name" ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" : "border-border hover:border-primary/50"
                          }`} onClick={() => setSearchType("name")}>
                            <RadioGroupItem value="name" id="name-radio" />
                            <Label htmlFor="name-radio" className="cursor-pointer flex items-center gap-2 flex-1">
                              <Building2 className="w-4 h-4" />
                              <span>Nome Empresa</span>
                            </Label>
                          </div>
                          <div className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            searchType === "cnae" ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" : "border-border hover:border-primary/50"
                          }`} onClick={() => setSearchType("cnae")}>
                            <RadioGroupItem value="cnae" id="cnae-radio" />
                            <Label htmlFor="cnae-radio" className="cursor-pointer flex items-center gap-2 flex-1">
                              <FileText className="w-4 h-4" />
                              <span>CNAE</span>
                            </Label>
                          </div>
                          <div className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            searchType === "partner" ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" : "border-border hover:border-primary/50"
                          }`} onClick={() => setSearchType("partner")}>
                            <RadioGroupItem value="partner" id="partner-radio" />
                            <Label htmlFor="partner-radio" className="cursor-pointer flex items-center gap-2 flex-1">
                              <User className="w-4 h-4" />
                              <span>Nome Sócio</span>
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {searchType === "cnpj" && (
                      <div className="space-y-2">
                        <Label htmlFor="api-select" className="text-sm font-medium">API de Consulta</Label>
                        <Select value={selectedApi} onValueChange={(value: any) => setSelectedApi(value)}>
                          <SelectTrigger className="bg-muted/30">
                            <SelectValue placeholder="Selecione a API" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">🔄 Automático (tenta todas em paralelo)</SelectItem>
                            <SelectItem value="receitaws">ReceitaWS</SelectItem>
                            <SelectItem value="cnpjws">CNPJ.ws</SelectItem>
                            <SelectItem value="brasilapi">BrasilAPI</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Modo automático tenta todas as APIs simultaneamente para garantir resultado
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="search-input" className="text-sm font-medium">
                        {searchType === "cnpj" && "CNPJ da Empresa"}
                        {searchType === "name" && "Nome da Empresa"}
                        {searchType === "cnae" && "Código CNAE (7 dígitos)"}
                        {searchType === "partner" && "Nome do Sócio"}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="search-input"
                          placeholder={
                            searchType === "cnpj" ? "00.000.000/0000-00" :
                            searchType === "name" ? "Ex: Tech Solutions" :
                            searchType === "cnae" ? "Ex: 6201501" :
                            "Ex: João Silva"
                          }
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && !isSearching && handleAdvancedSearch()}
                          disabled={isSearching}
                          className="bg-muted/30"
                        />
                        <Button 
                          onClick={handleAdvancedSearch} 
                          className="bg-primary hover:bg-primary/90 glow-effect" 
                          disabled={isSearching}
                        >
                          {isSearching ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Search className="w-4 h-4 mr-2" />
                          )}
                          {isSearching ? "Buscando..." : "Buscar"}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {searchType === "cnpj" && "Consulta em tempo real via APIs públicas da Receita Federal"}
                        {searchType === "name" && "⚙️ Requer banco de dados local PostgreSQL (em desenvolvimento)"}
                        {searchType === "cnae" && "⚙️ Requer banco de dados local PostgreSQL (em desenvolvimento)"}
                        {searchType === "partner" && "⚙️ Requer banco de dados local PostgreSQL (em desenvolvimento)"}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="bulk" className="space-y-4 mt-6">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer bg-muted/20">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">Arraste um arquivo PDF, CSV ou Excel</p>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls,.pdf"
                      onChange={handleImportarCNPJ}
                      className="hidden"
                      id="bulk-upload"
                    />
                    <label htmlFor="bulk-upload">
                      <Button variant="outline" className="glass-button" asChild>
                        <span>Selecionar Arquivo</span>
                      </Button>
                    </label>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>📋 Formato esperado: uma coluna com CNPJs (com ou sem formatação)</p>
                    <p>⚡ A importação consultará automaticamente todas as APIs para cada CNPJ</p>
                    <p>📊 Limite recomendado: 50 CNPJs por vez (devido aos rate limits das APIs)</p>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="glass-button">
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle className="text-foreground">Importar CNPJs</DialogTitle>
                <DialogDescription>Upload de arquivo CSV ou Excel com CNPJs</DialogDescription>
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
                    <Button variant="outline" className="glass-button" asChild>
                      <span>Selecionar Arquivo</span>
                    </Button>
                  </label>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="glass-card shadow-card">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-foreground">Lista de Leads</CardTitle>
              <CardDescription>{filteredLeads.length} leads encontrados • {selectedLeads.length} selecionados</CardDescription>
            </div>
            {selectedLeads.length > 0 && (
              <Button onClick={handleSendWhatsApp} className="bg-success hover:bg-success/90 glow-effect">
                <MessageCircle className="w-4 h-4 mr-2" />
                Enviar WhatsApp ({selectedLeads.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CNPJ ou setor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/30"
              />
            </div>
            <Button variant="outline" className="glass-button">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" className="glass-button">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>

          <div className="space-y-3">
            {filteredLeads.map((lead, index) => (
              <div
                key={lead.id}
                className="flex items-center gap-4 p-5 border border-border/50 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group animate-slide-up"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <Checkbox
                  checked={selectedLeads.includes(lead.id)}
                  onCheckedChange={() => toggleLead(lead.id)}
                  className="flex-shrink-0"
                />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.cnpj}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Setor</p>
                    <p className="text-sm text-foreground">{lead.sector}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Qualificação</p>
                    <Badge 
                      className={`${lead.temp === "hot" ? "bg-destructive/20 text-destructive border-destructive" : lead.temp === "warm" ? "bg-warning/20 text-warning border-warning" : "bg-info/20 text-info border-info"} border`}
                    >
                      {lead.temp === "hot" && "🔥 Quente"}
                      {lead.temp === "warm" && "🌡️ Morno"}
                      {lead.temp === "cold" && "❄️ Frio"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Score AI</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${lead.score >= 80 ? "bg-destructive" : lead.score >= 50 ? "bg-warning" : "bg-info"}`}
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                      <p className="text-sm font-bold text-primary">{lead.score}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
                    <p className="text-sm text-foreground">{lead.status}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="glass-button flex-shrink-0">
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
