import {
  documents,
  users,
  userDevices,
  syncHistory,
  type Document,
  type InsertDocument,
  type UpsertUser,
  type User,
  type UserDevice,
  type InsertUserDevice,
  type SyncHistory,
  type InsertSyncHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, or, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations for auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserSyncSettings(userId: string, syncEnabled: boolean): Promise<void>;
  
  // Document operations
  getDocument(id: string, userId: string): Promise<Document | undefined>;
  getAllDocuments(userId: string): Promise<Document[]>;
  searchDocuments(query: string, userId: string): Promise<Document[]>;
  getDocumentsByCategory(category: string, userId: string): Promise<Document[]>;
  getExpiringDocuments(daysAhead: number, userId: string): Promise<Document[]>;
  createDocument(document: InsertDocument, userId: string): Promise<Document>;
  updateDocument(id: string, updates: Partial<InsertDocument>, userId: string): Promise<Document | undefined>;
  deleteDocument(id: string, userId: string): Promise<boolean>;
  getDocumentStats(userId: string): Promise<{
    totalDocs: number;
    expiringDocs: number;
    categories: number;
  }>;
  
  // Device management
  registerDevice(device: InsertUserDevice, userId: string): Promise<UserDevice>;
  getUserDevices(userId: string): Promise<UserDevice[]>;
  updateDeviceLastSeen(deviceId: string, userId: string): Promise<void>;
  deactivateDevice(deviceId: string, userId: string): Promise<boolean>;
  
  // Sync operations
  getDocumentsForSync(userId: string, lastSyncAt?: Date): Promise<Document[]>;
  markDocumentsAsSynced(documentIds: string[], userId: string): Promise<void>;
  createSyncHistory(syncData: InsertSyncHistory): Promise<SyncHistory>;
  getSyncHistory(userId: string, limit?: number): Promise<SyncHistory[]>;
  handleSyncConflicts(userId: string): Promise<Document[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations for auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserSyncSettings(userId: string, syncEnabled: boolean): Promise<void> {
    await db
      .update(users)
      .set({ 
        syncEnabled: syncEnabled ? "true" : "false",
        lastSyncAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Document operations
  async getDocument(id: string, userId: string): Promise<Document | undefined> {
    const [document] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)));
    return document;
  }

  async getAllDocuments(userId: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(documents.updatedAt);
  }

  async searchDocuments(query: string, userId: string): Promise<Document[]> {
    const lowercaseQuery = `%${query.toLowerCase()}%`;
    return await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.userId, userId),
          or(
            like(documents.title, lowercaseQuery),
            like(documents.location, lowercaseQuery),
            like(documents.description, lowercaseQuery),
            like(documents.category, lowercaseQuery)
          )
        )
      );
  }

  async getDocumentsByCategory(category: string, userId: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(and(eq(documents.userId, userId), eq(documents.category, category)));
  }

  async getExpiringDocuments(daysAhead: number, userId: string): Promise<Document[]> {
    const today = new Date();
    const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    
    return await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.userId, userId),
          // Add expiration date filtering here - simplified for now
        )
      );
  }

  async createDocument(insertDocument: InsertDocument, userId: string): Promise<Document> {
    const id = nanoid();
    const now = new Date();
    const documentData = {
      ...insertDocument,
      id,
      userId,
      createdAt: now,
      updatedAt: now,
      urgencyTags: insertDocument.urgencyTags || [],
    };

    const [document] = await db
      .insert(documents)
      .values(documentData)
      .returning();
    return document;
  }

  async updateDocument(id: string, updates: Partial<InsertDocument>, userId: string): Promise<Document | undefined> {
    const [document] = await db
      .update(documents)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .returning();
    return document;
  }

  async deleteDocument(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getDocumentStats(userId: string): Promise<{
    totalDocs: number;
    expiringDocs: number;
    categories: number;
  }> {
    const userDocs = await this.getAllDocuments(userId);
    const expiringDocs = await this.getExpiringDocuments(90, userId);
    const categories = new Set(userDocs.map(doc => doc.category)).size;

    return {
      totalDocs: userDocs.length,
      expiringDocs: expiringDocs.length,
      categories,
    };
  }

  // Device management methods
  async registerDevice(device: InsertUserDevice): Promise<UserDevice> {
    const deviceData = {
      ...device,
      id: nanoid(),
      lastSeenAt: new Date(),
    };

    const [newDevice] = await db
      .insert(userDevices)
      .values(deviceData)
      .returning();
    return newDevice;
  }

  async getUserDevices(userId: string): Promise<UserDevice[]> {
    return await db
      .select()
      .from(userDevices)
      .where(and(eq(userDevices.userId, userId), eq(userDevices.isActive, "true")))
      .orderBy(desc(userDevices.lastSeenAt));
  }

  async updateDeviceLastSeen(deviceId: string, userId: string): Promise<void> {
    await db
      .update(userDevices)
      .set({ lastSeenAt: new Date() })
      .where(and(eq(userDevices.id, deviceId), eq(userDevices.userId, userId)));
  }

  async deactivateDevice(deviceId: string, userId: string): Promise<boolean> {
    const result = await db
      .update(userDevices)
      .set({ isActive: "false" })
      .where(and(eq(userDevices.id, deviceId), eq(userDevices.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Sync operations
  async getDocumentsForSync(userId: string, lastSyncAt?: Date): Promise<Document[]> {
    if (lastSyncAt) {
      return await db
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.userId, userId),
            sql`${documents.updatedAt} > ${lastSyncAt}`
          )
        )
        .orderBy(desc(documents.updatedAt));
    }

    return await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.updatedAt));
  }

  async markDocumentsAsSynced(documentIds: string[], userId: string): Promise<void> {
    if (documentIds.length === 0) return;
    
    await db
      .update(documents)
      .set({ syncStatus: "synced" })
      .where(
        and(
          eq(documents.userId, userId),
          sql`${documents.id} = ANY(${documentIds})`
        )
      );
  }

  async createSyncHistory(syncData: InsertSyncHistory): Promise<SyncHistory> {
    const syncHistoryData = {
      ...syncData,
      id: nanoid(),
    };

    const [syncRecord] = await db
      .insert(syncHistory)
      .values(syncHistoryData)
      .returning();
    return syncRecord;
  }

  async getSyncHistory(userId: string, limit: number = 10): Promise<SyncHistory[]> {
    return await db
      .select()
      .from(syncHistory)
      .where(eq(syncHistory.userId, userId))
      .orderBy(desc(syncHistory.createdAt))
      .limit(limit);
  }

  async handleSyncConflicts(userId: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(and(eq(documents.userId, userId), eq(documents.syncStatus, "conflict")));
  }
}

export const storage = new DatabaseStorage();
