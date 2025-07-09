import { Button } from "@/components/ui/button";
import { Home, Search, Bell, Settings } from "lucide-react";
import { useLocation } from "wouter";

const navItems = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "search", label: "Search", icon: Search, path: "/search" },
  { id: "reminders", label: "Reminders", icon: Bell, path: "/reminders" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-slate-900/95 border-t border-slate-700 px-4 py-2 backdrop-blur-lg z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`flex flex-col items-center py-1 px-3 h-auto hover:bg-slate-800/50 focus:bg-slate-800/50 focus:outline-none focus:ring-0 transition-colors duration-200 ${
                isActive 
                  ? "text-purple-400 bg-slate-800/50" 
                  : "text-slate-400 hover:text-purple-400"
              }`}
              style={{ color: isActive ? '#c084fc' : '#94a3b8' }}
              onClick={() => setLocation(item.path)}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
