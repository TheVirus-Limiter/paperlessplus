import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./auth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Get all documents
  app.get("/api/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const documents = await storage.getAllDocuments(userId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Search documents
  app.get("/api/documents/search", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const documents = await storage.searchDocuments(query, userId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to search documents" });
    }
  });

  // Get documents by category
  app.get("/api/documents/category/:category", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { category } = req.params;
      const documents = await storage.getDocumentsByCategory(category, userId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents by category" });
    }
  });

  // Get expiring documents
  app.get("/api/documents/expiring", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const days = req.query.days ? parseInt(req.query.days as string) : 90;
      const documents = await storage.getExpiringDocuments(days, userId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expiring documents" });
    }
  });

  // Get document stats
  app.get("/api/documents/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const stats = await storage.getDocumentStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document stats" });
    }
  });

  // Get single document
  app.get("/api/documents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const id = req.params.id;
      const document = await storage.getDocument(id, userId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  // Create document
  app.post("/api/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const validatedData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(validatedData, userId);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid document data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  // Update document
  app.patch("/api/documents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const id = req.params.id;
      const updates = insertDocumentSchema.partial().parse(req.body);
      const document = await storage.updateDocument(id, updates, userId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid document data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const id = req.params.id;
      const deleted = await storage.deleteDocument(id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Sync and device management routes
  app.post("/api/devices/register", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { deviceName, deviceType, userAgent } = req.body;
      
      const device = await storage.registerDevice({
        userId,
        deviceName: deviceName || "Unknown Device",
        deviceType: deviceType || "desktop",
        userAgent: userAgent || req.get("User-Agent") || "Unknown"
      });
      
      res.json(device);
    } catch (error) {
      console.error("Error registering device:", error);
      res.status(500).json({ message: "Failed to register device" });
    }
  });

  app.get("/api/devices", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const devices = await storage.getUserDevices(userId);
      res.json(devices);
    } catch (error) {
      console.error("Error fetching devices:", error);
      res.status(500).json({ message: "Failed to fetch devices" });
    }
  });

  app.put("/api/devices/:deviceId/heartbeat", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { deviceId } = req.params;
      
      await storage.updateDeviceLastSeen(deviceId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating device heartbeat:", error);
      res.status(500).json({ message: "Failed to update device" });
    }
  });

  app.delete("/api/devices/:deviceId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { deviceId } = req.params;
      
      const success = await storage.deactivateDevice(deviceId, userId);
      res.json({ success });
    } catch (error) {
      console.error("Error deactivating device:", error);
      res.status(500).json({ message: "Failed to deactivate device" });
    }
  });

  // Sync operations
  app.get("/api/sync/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const lastSyncParam = req.query.lastSync as string;
      const lastSyncAt = lastSyncParam ? new Date(lastSyncParam) : undefined;
      
      const documents = await storage.getDocumentsForSync(userId, lastSyncAt);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents for sync:", error);
      res.status(500).json({ message: "Failed to fetch documents for sync" });
    }
  });

  app.post("/api/sync/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { documentIds, deviceId, action } = req.body;
      
      if (documentIds && documentIds.length > 0) {
        await storage.markDocumentsAsSynced(documentIds, userId);
      }
      
      const syncRecord = await storage.createSyncHistory({
        userId,
        deviceId,
        action: action || "sync_down",
        documentCount: documentIds?.length?.toString() || "0",
        status: "success"
      });
      
      // Update user's last sync time
      await storage.updateUserSyncSettings(userId, true);
      
      res.json({ success: true, syncRecord });
    } catch (error) {
      console.error("Error completing sync:", error);
      res.status(500).json({ message: "Failed to complete sync" });
    }
  });

  app.get("/api/sync/history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const history = await storage.getSyncHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching sync history:", error);
      res.status(500).json({ message: "Failed to fetch sync history" });
    }
  });

  app.get("/api/sync/conflicts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const conflicts = await storage.handleSyncConflicts(userId);
      res.json(conflicts);
    } catch (error) {
      console.error("Error fetching sync conflicts:", error);
      res.status(500).json({ message: "Failed to fetch sync conflicts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
