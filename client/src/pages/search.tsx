import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import DocumentList from "@/components/document-list";
import BottomNavigation from "@/components/bottom-navigation";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="max-w-md mx-auto bg-slate-900 min-h-screen relative text-white">
      <Header hideSearch />
      
      <main className="pb-20 px-4 pt-4">
        <div className="relative mb-6">
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-3 text-base border-gray-300 focus:border-[var(--papertrail-primary)]"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>

        {searchQuery ? (
          <DocumentList 
            searchQuery={searchQuery}
            activeFilter="all"
          />
        ) : (
          <div className="text-center py-8">
            <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Search Documents</h3>
            <p className="text-gray-500 text-sm">
              Enter a search term to find your documents
            </p>
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
}
