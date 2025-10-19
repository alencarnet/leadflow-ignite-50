import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, MessageSquare, TrendingUp, Settings, Menu, Wifi } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Leads", path: "/leads" },
    { icon: MessageSquare, label: "Chat", path: "/chat" },
    { icon: TrendingUp, label: "CRM", path: "/crm" },
    { icon: Wifi, label: "Canais", path: "/channels" },
    { icon: Settings, label: "Configurações", path: "/settings" },
  ];

  const MenuItem = ({ item, onClick }: { item: typeof menuItems[0], onClick?: () => void }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
      >
        <item.icon className="w-5 h-5" />
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="md:hidden border-b glass-card px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-bold text-primary">
          SaaSCapture
        </h1>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-foreground">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 glass-card">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-primary">
                SaaSCapture
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Gestão Inteligente</p>
            </div>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <MenuItem key={item.path} item={item} onClick={() => setOpen(false)} />
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:flex-col w-64 border-r border-border/50 glass-card h-screen sticky top-0">
          <div className="p-6 border-b border-border/50">
            <h1 className="text-2xl font-bold text-primary">
              SaaSCapture
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Gestão Inteligente de Leads</p>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => (
              <MenuItem key={item.path} item={item} />
            ))}
          </nav>
          <div className="p-4 border-t border-border/50">
            <div className="glass-card p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">FluxoLead AI</p>
              <p className="text-sm font-medium">v3.0</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
