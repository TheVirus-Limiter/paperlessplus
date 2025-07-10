import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, X, RotateCcw, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture?: (imageData: string) => void;
}

export default function CameraCapture({ isOpen, onClose, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraReady(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
    setCapturedImage(null);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    setIsCapturing(true);
  }, []);

  const handleSavePhoto = useCallback(() => {
    if (capturedImage && onCapture) {
      onCapture(capturedImage);
      toast({
        title: "Photo Captured",
        description: "Document photo saved successfully.",
      });
    }
    handleClose();
  }, [capturedImage, onCapture, toast]);

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setIsCapturing(false);
  }, []);

  const handleClose = useCallback(() => {
    stopCamera();
    setIsCapturing(false);
    onClose();
  }, [stopCamera, onClose]);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen && !streamRef.current) {
      startCamera();
    }
    
    return () => {
      if (!isOpen) {
        stopCamera();
      }
    };
  }, [isOpen, startCamera, stopCamera]);

  return (
    <>
      {/* Custom Camera Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div 
            className="bg-slate-800 border border-slate-700 text-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  <h2 className="text-lg font-semibold text-white">Document Camera</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-slate-300 text-sm mb-6">
                Take a photo of your document for reference. The image will be stored locally on your device.
              </p>

              <div className="space-y-4">
                {/* Camera View */}
                <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
                  {!capturedImage ? (
                    <>
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                      />
                      {!isCameraReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="text-center text-white">
                            <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Starting camera...</p>
                          </div>
                        </div>
                      )}
                      {isCameraReady && (
                        <div className="camera-overlay absolute inset-0 pointer-events-none" />
                      )}
                    </>
                  ) : (
                    <img
                      src={capturedImage}
                      alt="Captured document"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Hidden canvas for capture */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Controls */}
                <div className="flex justify-center gap-4">
                {!isCapturing ? (
                  <>
                    <button
                      onClick={handleClose}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-md hover:bg-slate-600 flex items-center justify-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      onClick={capturePhoto}
                      disabled={!isCameraReady}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Capture
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleRetake}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-md hover:bg-slate-600 flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Retake
                    </button>
                    <button
                      onClick={handleSavePhoto}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md flex items-center justify-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Save
                    </button>
                  </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}