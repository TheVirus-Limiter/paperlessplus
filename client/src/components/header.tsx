import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Settings } from "lucide-react";
import { useLocation } from "wouter";

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  hideSearch?: boolean;
}

export default function Header({ searchQuery = "", onSearchChange, hideSearch = false }: HeaderProps) {
  const [, setLocation] = useLocation();

  return (
    <header className="bg-[var(--papertrail-primary)] text-white px-4 py-3 material-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-white rounded text-[var(--papertrail-primary)] flex items-center justify-center text-sm font-bold">
            P
          </div>
          <h1 className="text-lg font-semibold">PaperTrail</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => setLocation("/settings")}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      
      {!hideSearch && (
        <div className="mt-3 relative">
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full bg-white/10 backdrop-blur border-white/20 text-white placeholder:text-white/70 focus:bg-white/20 focus:border-white/40"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
        </div>
      )}
    </header>
  );
}
