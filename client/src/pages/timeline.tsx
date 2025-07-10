import { useState } from "react";
import Header from "@/components/header";
import BottomNavigation from "@/components/bottom-navigation";
import DocumentTimeline from "@/components/document-timeline";
import ImageViewer from "@/components/image-viewer";
import EditDocumentModal from "@/components/edit-document-modal";
import { Clock } from "lucide-react";

export default function Timeline() {
  const [viewingImage, setViewingImage] = useState<{doc: any} | null>(null);
  const [editingDocument, setEditingDocument] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDocumentClick = (doc: any) => {
    if (doc.imageData) {
      setViewingImage({doc});
    } else {
      setEditingDocument(doc);
      setIsEditModalOpen(true);
    }
  };

  const handleEditComplete = () => {
    setIsEditModalOpen(false);
    setEditingDocument(null);
    // Timeline will auto-refresh when documents change
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 min-h-screen relative text-white">
      <Header hideSearch />
      
      <main className="pb-20 px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="h-6 w-6 text-purple-400" />
          <h1 className="text-xl font-semibold text-white">Timeline</h1>
        </div>

        <DocumentTimeline onDocumentClick={handleDocumentClick} />
      </main>
      
      <BottomNavigation />

      {/* Image Viewer */}
      {viewingImage && (
        <ImageViewer
          isOpen={true}
          onClose={() => setViewingImage(null)}
          imageData={viewingImage.doc.imageData}
          documentTitle={viewingImage.doc.title}
        />
      )}

      {/* Edit Document Modal */}
      <EditDocumentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        document={editingDocument}
        onUpdate={handleEditComplete}
      />
    </div>
  );
}