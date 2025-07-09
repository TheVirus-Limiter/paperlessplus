import { documents, type Document, type InsertDocument } from "@shared/schema";

export interface IStorage {
  getDocument(id: number): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  searchDocuments(query: string): Promise<Document[]>;
  getDocumentsByCategory(category: string): Promise<Document[]>;
  getExpiringDocuments(daysAhead?: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, updates: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  getDocumentStats(): Promise<{
    totalDocs: number;
    expiringDocs: number;
    categories: number;
  }>;
}

export class MemStorage implements IStorage {
  private documents: Map<number, Document>;
  private currentId: number;

  constructor() {
    this.documents = new Map();
    this.currentId = 1;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).sort(
      (a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()
    );
  }

  async searchDocuments(query: string): Promise<Document[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.documents.values()).filter(
      (doc) =>
        doc.title.toLowerCase().includes(lowercaseQuery) ||
        doc.location.toLowerCase().includes(lowercaseQuery) ||
        doc.description?.toLowerCase().includes(lowercaseQuery) ||
        doc.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getDocumentsByCategory(category: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.category === category
    );
  }

  async getExpiringDocuments(daysAhead: number = 90): Promise<Document[]> {
    const today = new Date();
    const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    
    return Array.from(this.documents.values()).filter((doc) => {
      if (!doc.expirationDate) return false;
      const expDate = new Date(doc.expirationDate);
      return expDate >= today && expDate <= futureDate;
    });
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentId++;
    const now = new Date();
    const document: Document = {
      ...insertDocument,
      id,
      createdAt: now,
      updatedAt: now,
      urgencyTags: insertDocument.urgencyTags || [],
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: number, updates: Partial<InsertDocument>): Promise<Document | undefined> {
    const existing = this.documents.get(id);
    if (!existing) return undefined;

    const updated: Document = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.documents.set(id, updated);
    return updated;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  async getDocumentStats(): Promise<{
    totalDocs: number;
    expiringDocs: number;
    categories: number;
  }> {
    const docs = Array.from(this.documents.values());
    const expiringDocs = await this.getExpiringDocuments(90);
    const categories = new Set(docs.map(doc => doc.category)).size;

    return {
      totalDocs: docs.length,
      expiringDocs: expiringDocs.length,
      categories,
    };
  }
}

export const storage = new MemStorage();
