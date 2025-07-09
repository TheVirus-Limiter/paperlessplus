import {
  documents,
  users,
  type Document,
  type InsertDocument,
  type UpsertUser,
  type User,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, or } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations for auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
}

export const storage = new DatabaseStorage();
