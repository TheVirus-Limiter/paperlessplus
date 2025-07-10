import { useState } from "react";
import Header from "@/components/header";
import StatsCards from "@/components/stats-cards";
import QuickFilters from "@/components/quick-filters";
import DocumentList from "@/components/document-list";
import AddDocumentModal from "@/components/add-document-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Home() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <div className="max-w-md mx-auto bg-slate-900 min-h-screen relative text-white pb-20">
      <Header 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
      />
      
      <main className="px-4 pb-24">
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
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full modern-shadow-lg gradient-primary hover:opacity-90 transition-all duration-200 active:scale-95 hover-lift"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddDocumentModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
