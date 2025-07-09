import { Button } from "@/components/ui/button";
import { Clock, CreditCard, Gavel, Heart, FileText } from "lucide-react";

interface QuickFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { id: "all", label: "All Documents", icon: FileText },
  { id: "expiring", label: "Expiring Soon", icon: Clock },
  { id: "id", label: "ID Documents", icon: CreditCard },
  { id: "legal", label: "Legal", icon: Gavel },
  { id: "medical", label: "Medical", icon: Heart },
];

export default function QuickFilters({ activeFilter, onFilterChange }: QuickFiltersProps) {
  return (
    <section className="mb-4">
      <h2 className="text-sm font-medium text-gray-500 mb-2">Quick Filters</h2>
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          
          return (
            <Button
              key={filter.id}
              variant={isActive ? "default" : "secondary"}
              size="sm"
              className={`whitespace-nowrap ${
                isActive 
                  ? "bg-[var(--papertrail-primary)] hover:bg-[var(--papertrail-primary-dark)]" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => onFilterChange(filter.id)}
            >
              <Icon className="h-3 w-3 mr-1" />
              {filter.label}
            </Button>
          );
        })}
      </div>
    </section>
  );
}
