import { X, Download, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageData: string;
  documentTitle: string;
}

export default function ImageViewer({ isOpen, onClose, imageData, documentTitle }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);

  if (!isOpen) return null;

  const handleDownload = () => {
    // Create a download link for the image
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `${documentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="relative max-w-full max-h-full overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between bg-black/50 backdrop-blur-sm rounded-lg p-3">
          <h3 className="text-white font-medium truncate flex-1 mr-4">{documentTitle}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-2 text-white hover:bg-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={resetZoom}
              className="px-3 py-2 text-white hover:bg-white/20 rounded-lg text-sm font-medium"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="p-2 text-white hover:bg-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-white hover:bg-white/20 rounded-lg"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white/20 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="p-8 pt-20">
          <img
            src={imageData}
            alt={documentTitle}
            style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'center',
              transition: 'transform 0.2s ease-in-out'
            }}
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            draggable={false}
          />
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-lg p-3">
          <p className="text-white text-sm text-center">
            Tap image to close • Use zoom controls to resize • Download to save
          </p>
        </div>
      </div>
    </div>
  );
}