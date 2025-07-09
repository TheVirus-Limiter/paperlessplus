import { useState } from "react";
import Header from "@/components/header";
import StatsCards from "@/components/stats-cards";
import QuickFilters from "@/components/quick-filters";
import DocumentList from "@/components/document-list";
import AddDocumentModal from "@/components/add-document-modal";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Home() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      <Header 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
      />
      
      <main className="pb-20 px-4">
        <StatsCards />
        <QuickFilters 
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
        <DocumentList 
          searchQuery={searchQuery}
          activeFilter={activeFilter}
        />
      </main>

      {/* Floating Action Button */}
      <Button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full material-shadow-lg bg-[var(--papertrail-primary)] hover:bg-[var(--papertrail-primary-dark)] transition-all duration-200 active:scale-95"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddDocumentModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      
      <BottomNavigation />
    </div>
  );
}
