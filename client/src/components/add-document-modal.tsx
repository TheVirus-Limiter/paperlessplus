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

export default function AddDocumentModal({ isOpen, onClose }: AddDocumentModalProps) {
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
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md h-[80vh] overflow-y-auto glass-card border-0 modern-shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Add Document
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-6 w-6 hover:bg-secondary/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Track a new document by adding its details below. This helps you organize and remember important paperwork.
            </DialogDescription>
          </DialogHeader>

          {/* Camera Preview */}
          {capturedImage && (
            <div className="glass-card p-4 rounded-lg modern-shadow">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Document Photo
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCapturedImage(null)}
                  className="hover:bg-destructive/20 text-destructive"
                >
                  Remove
                </Button>
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
                  className="w-full glass-card hover-lift focus-ring"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {capturedImage ? "Retake Photo" : "Take Photo"}
                </Button>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 hover-lift focus-ring"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 gradient-primary hover:opacity-90 transition-opacity focus-ring"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Document"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </>
  );
}