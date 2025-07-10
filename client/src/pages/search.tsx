import { useState } from "react";
import Header from "@/components/header";
import BottomNavigation from "@/components/bottom-navigation";
import DocumentList from "@/components/document-list";
import QuickFilters from "@/components/quick-filters";
import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <div className="max-w-md mx-auto bg-slate-900 min-h-screen relative text-white">
      <Header 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
      />
      
      <main className="pb-20 px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <SearchIcon className="h-6 w-6 text-purple-400" />
          <h1 className="text-xl font-semibold text-white">Search Documents</h1>
        </div>

        <QuickFilters 
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
        
        <DocumentList 
          searchQuery={searchQuery}
          activeFilter={activeFilter}
        />
      </main>
      
      <BottomNavigation />
    </div>
  );
}