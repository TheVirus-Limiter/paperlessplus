import { useState, useEffect } from "react";
import Header from "@/components/header";
import BottomNavigation from "@/components/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Download, Upload, Trash2, RefreshCw } from "lucide-react";

import { exportDocuments, importDocuments } from "@/lib/export";
import { documentDB } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const { toast } = useToast();





  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportDocuments();
      toast({
        title: "Export Complete",
        description: "Your documents have been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your documents.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsImporting(true);
      try {
        const importedCount = await importDocuments(file);
        toast({
          title: "Import Complete",
          description: `Successfully imported ${importedCount} documents.`,
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "There was an error importing your documents.",
          variant: "destructive",
        });
      } finally {
        setIsImporting(false);
      }
    };

    input.click();
  };

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to delete all your documents? This action cannot be undone.")) {
      return;
    }

    setIsClearingData(true);
    try {
      const documents = await documentDB.getAllDocuments();
      for (const doc of documents) {
        await documentDB.deleteDocument(doc.id!);
      }
      
      toast({
        title: "Data Cleared",
        description: "All documents have been deleted.",
      });
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: "There was an error clearing your data.",
        variant: "destructive",
      });
    } finally {
      setIsClearingData(false);
    }
  };



  return (
    <div className="max-w-md mx-auto bg-slate-900 min-h-screen relative text-white">
      <Header hideSearch />
      
      <main className="pb-20 px-4 pt-4">
        <h1 className="text-xl font-semibold text-white mb-6">Settings</h1>



        {/* Data Management */}
        <Card className="material-shadow bg-slate-800 border-slate-700 mb-4">
          <CardHeader>
            <CardTitle className="text-white">Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full justify-start bg-slate-700 hover:bg-slate-600 text-white"
            >
              {isExporting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export Documents
            </Button>
            
            <Button
              onClick={handleImport}
              disabled={isImporting}
              className="w-full justify-start bg-slate-700 hover:bg-slate-600 text-white"
            >
              {isImporting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Import Documents
            </Button>
            
            <Button
              onClick={handleClearData}
              disabled={isClearingData}
              variant="destructive"
              className="w-full justify-start"
            >
              {isClearingData ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Clear All Data
            </Button>
          </CardContent>
        </Card>



        {/* About */}
        <Card className="material-shadow bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">About Paperless+</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300 mb-2">
              Privacy-focused document tracking for a paperless lifestyle.
            </p>
            <p className="text-xs text-slate-400">
              Your documents stay on your device • Made by Rehan Raj
            </p>
          </CardContent>
        </Card>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
