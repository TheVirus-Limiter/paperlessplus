import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, X, Image, Camera } from "lucide-react";
import { format } from "date-fns";
import { documentDB } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { CATEGORIES, URGENCY_TAGS } from "@shared/schema";
import CameraCapture from "./camera-capture";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  expirationDate: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: any;
  onUpdate: () => void;
}

export default function EditDocumentModal({ isOpen, onClose, document, onUpdate }: EditDocumentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUrgencyTags, setSelectedUrgencyTags] = useState<string[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      location: "",
      description: "",
      category: "",
      expirationDate: "",
    },
  });

  // Update form when document changes
  useEffect(() => {
    if (document && isOpen) {
      form.reset({
        title: document.title || "",
        location: document.location || "",
        description: document.description || "",
        category: document.category || "",
        expirationDate: document.expirationDate 
          ? format(new Date(document.expirationDate), "yyyy-MM-dd")
          : "",
      });
      setSelectedUrgencyTags(document.urgencyTags || []);
      setCapturedImage(document.imageData || null);
    }
  }, [document, isOpen, form]);

  const updateDocument = async (data: FormData) => {
    if (!document?.id) return;
    
    setIsSubmitting(true);
    try {
      const updateData = {
        ...data,
        urgencyTags: selectedUrgencyTags,
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
        imageData: capturedImage || document.imageData,
      };
      
      await documentDB.updateDocument(document.id, updateData);
      toast({
        title: "Document Updated",
        description: "Your document has been successfully updated.",
      });
      handleClose();
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating your document.",
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
    updateDocument(data);
  };

  const toggleUrgencyTag = (tagId: string) => {
    setSelectedUrgencyTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  if (!document) return null;

  return (
    <>
      {/* Custom Edit Modal */}
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
                <h2 className="text-lg font-semibold text-white">Edit Document</h2>
                <button
                  onClick={handleClose}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-slate-300 text-sm mb-6">
                Update your document details below.
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
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expirationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiration Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="date"
                              {...field}
                              className="pr-10"
                            />
                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Urgency Tags */}
                  <div className="space-y-2">
                    <FormLabel>Urgency Tags</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {URGENCY_TAGS.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleUrgencyTag(tag.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                            selectedUrgencyTags.includes(tag.id)
                              ? 'bg-purple-600 border-purple-500 text-white'
                              : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-md hover:bg-slate-600 flex items-center justify-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Camera
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-md hover:bg-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md disabled:opacity-50"
                    >
                      {isSubmitting ? "Updating..." : "Update"}
                    </button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </>
  );
}