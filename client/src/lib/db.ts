// IndexedDB wrapper for local document storage
// This provides offline functionality and privacy-focused local storage

interface Document {
  id?: number;
  title: string;
  location: string;
  description?: string;
  category: string;
  urgencyTags: string[];
  expirationDate?: Date;
  imageData?: string; // Base64 encoded image
  createdAt: Date;
  updatedAt: Date;
}

class DocumentDB {
  private dbName = "papertrail-db";
  private version = 1;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains("documents")) {
          const store = db.createObjectStore("documents", { 
            keyPath: "id", 
            autoIncrement: true 
          });
          
          // Create indexes for efficient querying
          store.createIndex("category", "category", { unique: false });
          store.createIndex("title", "title", { unique: false });
          store.createIndex("expirationDate", "expirationDate", { unique: false });
          store.createIndex("updatedAt", "updatedAt", { unique: false });
        }
      };
    });
  }

  async addDocument(document: Omit<Document, "id">): Promise<Document> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["documents"], "readwrite");
      const store = transaction.objectStore("documents");
      
      const docWithTimestamps = {
        ...document,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const request = store.add(docWithTimestamps);
      
      request.onsuccess = () => {
        resolve({ ...docWithTimestamps, id: request.result as number });
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllDocuments(): Promise<Document[]> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["documents"], "readonly");
      const store = transaction.objectStore("documents");
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["documents"], "readwrite");
      const store = transaction.objectStore("documents");
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error("Document not found"));
          return;
        }
        
        const updated = {
          ...existing,
          ...updates,
          updatedAt: new Date(),
        };
        
        const putRequest = store.put(updated);
        putRequest.onsuccess = () => resolve(updated);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteDocument(id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["documents"], "readwrite");
      const store = transaction.objectStore("documents");
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async searchDocuments(query: string): Promise<Document[]> {
    const documents = await this.getAllDocuments();
    const lowercaseQuery = query.toLowerCase();
    
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(lowercaseQuery) ||
      doc.location.toLowerCase().includes(lowercaseQuery) ||
      doc.description?.toLowerCase().includes(lowercaseQuery) ||
      doc.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getExpiringDocuments(daysAhead: number = 90): Promise<Document[]> {
    const documents = await this.getAllDocuments();
    const today = new Date();
    const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    
    return documents.filter(doc => {
      if (!doc.expirationDate) return false;
      const expDate = new Date(doc.expirationDate);
      return expDate >= today && expDate <= futureDate;
    });
  }
}

export const documentDB = new DocumentDB();
