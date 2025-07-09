import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Edit, Trash2, FileText, SortDesc } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Document } from "@shared/schema";
import { CATEGORIES, URGENCY_TAGS } from "@shared/schema";

interface DocumentListProps {
  searchQuery: string;
  activeFilter: string;
}

export default function DocumentList({ searchQuery, activeFilter }: DocumentListProps) {
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Build query key based on filters
  const getQueryKey = () => {
    if (searchQuery) {
      return ["/api/documents/search", { q: searchQuery }];
    }
    if (activeFilter === "expiring") {
      return ["/api/documents/expiring"];
    }
    if (activeFilter !== "all") {
      return ["/api/documents/category", activeFilter];
    }
    return ["/api/documents"];
  };

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: getQueryKey(),
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/stats"] });
      toast({
        title: "Document Deleted",
        description: "The document has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "There was an error deleting the document.",
        variant: "destructive",
      });
    },
  });

  // Sort documents
  const sortedDocuments = [...documents].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime();
    }
    return a.title.localeCompare(b.title);
  });

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(cat => cat.id === category) || CATEGORIES[0];
  };

  const getUrgencyInfo = (tag: string) => {
    return URGENCY_TAGS.find(urgency => urgency.id === tag);
  };

  const getBorderColor = (category: string) => {
    const categoryInfo = getCategoryInfo(category);
    switch (categoryInfo.color) {
      case "blue": return "border-l-blue-500";
      case "green": return "border-l-green-500";
      case "purple": return "border-l-purple-500";
      case "orange": return "border-l-orange-500";
      default: return "border-l-gray-500";
    }
  };

  if (isLoading) {
    return (
      <section>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="material-shadow">
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-3 w-full mb-3" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-1/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">
          {searchQuery ? "Search Results" : "Your Documents"}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSortBy(sortBy === "date" ? "title" : "date")}
          className="text-[var(--papertrail-primary)] text-sm font-medium"
        >
          <SortDesc className="h-3 w-3 mr-1" />
          Sort by {sortBy === "date" ? "Title" : "Date"}
        </Button>
      </div>

      {sortedDocuments.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? "No documents found" : "No documents yet"}
          </h3>
          <p className="text-gray-500 text-sm">
            {searchQuery 
              ? "Try adjusting your search terms" 
              : "Start by adding your first document using the + button below"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedDocuments.map((doc) => {
            const categoryInfo = getCategoryInfo(doc.category);
            const borderClass = getBorderColor(doc.category);
            
            return (
              <Card key={doc.id} className={`material-shadow border-l-4 ${borderClass}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 flex-1">{doc.title}</h3>
                    <div className="flex gap-1 ml-2">
                      <Badge variant="secondary" className="text-xs">
                        {categoryInfo.label}
                      </Badge>
                      {doc.urgencyTags?.map((tag) => {
                        const urgencyInfo = getUrgencyInfo(tag);
                        if (!urgencyInfo) return null;
                        
                        const urgencyClass = urgencyInfo.color === "red" 
                          ? "bg-red-100 text-red-800"
                          : urgencyInfo.color === "yellow"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800";
                        
                        return (
                          <Badge key={tag} className={`text-xs ${urgencyClass}`}>
                            {urgencyInfo.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {doc.location}
                  </p>
                  
                  {doc.description && (
                    <p className="text-gray-500 text-xs mb-3 line-clamp-2">
                      {doc.description}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Updated {format(new Date(doc.updatedAt!), "MMM d, yyyy")}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-[var(--papertrail-primary)]"
                        onClick={() => {
                          // TODO: Implement edit functionality
                          toast({
                            title: "Edit Document",
                            description: "Edit functionality coming soon!",
                          });
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-500"
                        onClick={() => deleteDocumentMutation.mutate(doc.id)}
                        disabled={deleteDocumentMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
