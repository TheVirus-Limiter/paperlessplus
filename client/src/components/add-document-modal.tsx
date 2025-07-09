import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
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
import { X, CreditCard, Gavel, Heart, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertDocumentSchema, CATEGORIES, URGENCY_TAGS } from "@shared/schema";

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = insertDocumentSchema.extend({
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
  const queryClient = useQueryClient();
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

  const createDocumentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const submitData = {
        ...data,
        urgencyTags: selectedUrgencyTags,
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
      };
      const response = await apiRequest("POST", "/api/documents", submitData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/stats"] });
      toast({
        title: "Document Added",
        description: "Your document has been successfully added.",
      });
      onClose();
      form.reset();
      setSelectedUrgencyTags([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error adding your document.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createDocumentMutation.mutate(data);
  };

  const toggleUrgencyTag = (tagId: string) => {
    setSelectedUrgencyTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleClose = () => {
    onClose();
    form.reset();
    setSelectedUrgencyTags([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Add Document
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

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
                          className={`cursor-pointer transition-colors ${
                            isSelected 
                              ? "border-[var(--papertrail-primary)] bg-blue-50" 
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                          onClick={() => field.onChange(category.id)}
                        >
                          <CardContent className="p-3 text-center">
                            <Icon className={`h-5 w-5 mx-auto mb-1 ${
                              isSelected ? "text-[var(--papertrail-primary)]" : "text-gray-600"
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
                    className={`cursor-pointer ${
                      selectedUrgencyTags.includes(tag.id)
                        ? "bg-[var(--papertrail-primary)] hover:bg-[var(--papertrail-primary-dark)]"
                        : ""
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

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-[var(--papertrail-primary)] hover:bg-[var(--papertrail-primary-dark)]"
                disabled={createDocumentMutation.isPending}
              >
                {createDocumentMutation.isPending ? "Adding..." : "Add Document"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
