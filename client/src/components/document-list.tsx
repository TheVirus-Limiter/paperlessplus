import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Edit, Trash2, FileText, SortDesc, Image } from "lucide-react";
import { format } from "date-fns";
import { documentDB } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { CATEGORIES, URGENCY_TAGS } from "@shared/schema";
import EditDocumentModal from "./edit-document-modal";
import ImageViewer from "./image-viewer";

interface DocumentListProps {
  searchQuery: string;
  activeFilter: string;
  onDocumentChange?: () => void;
}

export default function DocumentList({ searchQuery, activeFilter, onDocumentChange }: DocumentListProps) {
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingDocument, setEditingDocument] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingImage, setViewingImage] = useState<{doc: any} | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      try {
        let docs: any[] = [];
        
        if (searchQuery) {
          docs = await documentDB.searchDocuments(searchQuery);
        } else if (activeFilter === "expiring") {
          docs = await documentDB.getExpiringDocuments(30);
        } else if (activeFilter !== "all") {
          const allDocs = await documentDB.getAllDocuments();
          docs = allDocs.filter(doc => doc.category === activeFilter);
        } else {
          docs = await documentDB.getAllDocuments();
        }
        
        setDocuments(docs);
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDocuments();
  }, [searchQuery, activeFilter]);

  const deleteDocument = async (id: number) => {
    try {
      await documentDB.deleteDocument(id);
      setDocuments(docs => docs.filter(doc => doc.id !== id));
      // Notify parent to refresh stats
      if (onDocumentChange) onDocumentChange();
      toast({
        title: "Document Deleted",
        description: "The document has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "There was an error deleting the document.",
        variant: "destructive",
      });
    }
  };

  const handleEditDocument = (document: any) => {
    setEditingDocument(document);
    setIsEditModalOpen(true);
  };

  const handleEditComplete = () => {
    setIsEditModalOpen(false);
    setEditingDocument(null);
    // Reload documents and notify parent
    const loadDocuments = async () => {
      try {
        let docs: any[] = [];
        
        if (searchQuery) {
          docs = await documentDB.searchDocuments(searchQuery);
        } else if (activeFilter === "expiring") {
          docs = await documentDB.getExpiringDocuments(30);
        } else if (activeFilter !== "all") {
          const allDocs = await documentDB.getAllDocuments();
          docs = allDocs.filter(doc => doc.category === activeFilter);
        } else {
          docs = await documentDB.getAllDocuments();
        }
        
        setDocuments(docs);
        if (onDocumentChange) onDocumentChange();
      } catch (error) {
        console.error('Error reloading documents:', error);
      }
    };
    
    loadDocuments();
  };

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

  const getCategoryBadgeColor = (category: string) => {
    const categoryInfo = getCategoryInfo(category);
    switch (categoryInfo.color) {
      case "blue": return "bg-blue-600 text-white";
      case "green": return "bg-green-600 text-white";
      case "purple": return "bg-purple-600 text-white";
      case "orange": return "bg-orange-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  if (isLoading) {
    return (
      <section>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="material-shadow bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2 bg-slate-700" />
                <Skeleton className="h-4 w-1/2 mb-2 bg-slate-700" />
                <Skeleton className="h-3 w-full mb-3 bg-slate-700" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-1/3 bg-slate-700" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-6 bg-slate-700" />
                    <Skeleton className="h-6 w-6 bg-slate-700" />
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
        <h2 className="text-lg font-semibold text-white">
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
          <FileText className="h-12 w-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white mb-2">
            {searchQuery ? "No documents found" : "No documents yet"}
          </h3>
          <p className="text-slate-400 text-sm">
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
              <Card key={doc.id} className={`material-shadow bg-slate-800 border-slate-700 border-l-4 ${borderClass}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white flex-1">{doc.title}</h3>
                    <div className="flex gap-1 ml-2">
                      <Badge className={`text-xs ${getCategoryBadgeColor(doc.category)}`}>
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
                  
                  <p className="text-slate-400 text-sm mb-2 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {doc.location}
                  </p>
                  
                  {doc.description && (
                    <p className="text-slate-300 text-xs mb-3 line-clamp-2">
                      {doc.description}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">
                      Updated {format(new Date(doc.updatedAt!), "MMM d, yyyy")}
                    </span>
                    <div className="flex gap-2">
                      {doc.imageData && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-blue-400"
                          onClick={() => setViewingImage({doc})}
                        >
                          <Image className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-purple-400"
                        onClick={() => handleEditDocument(doc)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-400"
                        onClick={() => deleteDocument(doc.id)}
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

      {/* Edit Document Modal */}
      <EditDocumentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        document={editingDocument}
        onUpdate={handleEditComplete}
      />

      {/* Image Viewer */}
      {viewingImage && (
        <ImageViewer
          isOpen={true}
          onClose={() => setViewingImage(null)}
          imageData={viewingImage.doc.imageData}
          documentTitle={viewingImage.doc.title}
        />
      )}
    </section>
  );
}
