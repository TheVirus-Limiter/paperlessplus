import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Settings, LogOut, FileText } from "lucide-react";
// Logo will be loaded from public folder
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  hideSearch?: boolean;
}

export default function Header({ searchQuery = "", onSearchChange, hideSearch = false }: HeaderProps) {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <img 
              src="./header-logo.png" 
              alt="Paperless+ Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-gradient">Paperless+</h1>
        </div>
        
        {isAuthenticated && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-secondary/20 focus-ring"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-0 modern-shadow-lg">
              <DropdownMenuItem onClick={() => setLocation("/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {!hideSearch && isAuthenticated && (
        <div className="mt-3 relative">
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full bg-secondary/10 backdrop-blur border-border/20 focus:bg-secondary/20 focus:border-primary/40 focus-ring"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        </div>
      )}
    </header>
  );
}
