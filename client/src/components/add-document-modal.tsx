import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X, CreditCard, Gavel, Heart, DollarSign, Camera, Image } from "lucide-react";
import { documentDB } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { CATEGORIES, URGENCY_TAGS } from "@shared/schema";
import CameraCapture from "./camera-capture";

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentAdded?: () => void;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  location: z.string().min(1, "Location is required"), 
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  urgencyTags: z.array(z.string()).default([]),
  expirationDate: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const categoryIcons = {
  id: CreditCard,
  legal: Gavel,
  medical: Heart,
  financial: DollarSign,
};

export default function AddDocumentModal({ isOpen, onClose, onDocumentAdded }: AddDocumentModalProps) {
  const [selectedUrgencyTags, setSelectedUrgencyTags] = useState<string[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      location: "",
      description: "",
      category: "",
      urgencyTags: [],
      expirationDate: "",
    },
  });

  const createDocument = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        ...data,
        urgencyTags: selectedUrgencyTags,
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
      };
      await documentDB.addDocument(submitData);
      toast({
        title: "Document Added",
        description: "Your document has been successfully added.",
      });
      if (onDocumentAdded) onDocumentAdded();
      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error adding your document.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedUrgencyTags([]);
    setCapturedImage(null);
    onClose();
  };

  const handleCameraCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setIsCameraOpen(false);
  };

  const onSubmit = (data: FormData) => {
    createDocument(data);
  };

  const toggleUrgencyTag = (tagId: string) => {
    setSelectedUrgencyTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <>
      {/* Custom Mobile Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto"
          onClick={handleClose}
        >
          <div 
            className="bg-slate-800 border border-slate-700 text-white rounded-lg w-full max-w-md my-8 min-h-fit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Add Document</h2>
                <button
                  onClick={handleClose}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-slate-300 text-sm mb-6">
                Track a new document by adding its details below. This helps you organize and remember important paperwork.
              </p>

              {/* Camera Preview */}
              {capturedImage && (
                <div className="bg-slate-700 p-4 rounded-lg border border-slate-600 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Document Photo
                    </h4>
                    <button
                      onClick={() => setCapturedImage(null)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <img
                    src={capturedImage}
                    alt="Captured document"
                    className="w-full h-32 object-cover rounded border"
                  />
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Passport, Lease Agreement" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Bedroom safe, Google Drive" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes about this document..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map((category) => {
                        const Icon = categoryIcons[category.id];
                        const isSelected = field.value === category.id;
                        
                        return (
                          <Card
                            key={category.id}
                            className={`cursor-pointer transition-all duration-200 hover-lift ${
                              isSelected 
                                ? "border-primary bg-primary/10 modern-shadow" 
                                : "border-border hover:border-primary/50 glass-card"
                            }`}
                            onClick={() => field.onChange(category.id)}
                          >
                            <CardContent className="p-3 text-center">
                              <Icon className={`h-5 w-5 mx-auto mb-1 ${
                                isSelected ? "text-primary" : "text-muted-foreground"
                              }`} />
                              <div className="text-sm font-medium">{category.label}</div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Priority Tags (optional)</FormLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  {URGENCY_TAGS.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedUrgencyTags.includes(tag.id) ? "default" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        selectedUrgencyTags.includes(tag.id)
                          ? "bg-primary hover:bg-primary/90"
                          : "hover:bg-primary/10"
                      }`}
                      onClick={() => toggleUrgencyTag(tag.id)}
                    >
                      <i className={`${tag.icon} text-xs mr-1`}></i>
                      {tag.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration Date (optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Camera Button */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCameraOpen(true)}
                  className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {capturedImage ? "Retake Photo" : "Take Photo"}
                </Button>
              </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button" 
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-md hover:bg-slate-600"
                      onClick={handleClose}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Adding..." : "Add Document"}
                    </button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </>
  );
}