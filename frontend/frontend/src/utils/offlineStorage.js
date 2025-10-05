// Offline storage utilities for PWA
const OFFLINE_DB_NAME = 'JusGoPOS_Offline';
const OFFLINE_DB_VERSION = 1;

class OfflineStorage {
  constructor() {
    this.db = null;
    this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          transactionStore.createIndex('timestamp', 'timestamp', { unique: false });
          transactionStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { 
            keyPath: 'id' 
          });
          productStore.createIndex('name', 'name', { unique: false });
          productStore.createIndex('category', 'category', { unique: false });
        }

        if (!db.objectStoreNames.contains('stock_movements')) {
          const stockStore = db.createObjectStore('stock_movements', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          stockStore.createIndex('product_id', 'product_id', { unique: false });
          stockStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        console.log('IndexedDB schema created');
      };
    });
  }

  // Transaction methods
  async saveOfflineTransaction(transaction) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['transactions'], 'readwrite');
      const store = transaction.objectStore('transactions');
      
      const offlineTransaction = {
        ...transaction,
        timestamp: new Date().toISOString(),
        status: 'offline',
        synced: false
      };

      const request = store.add(offlineTransaction);
      
      request.onsuccess = () => {
        console.log('Transaction saved offline:', request.result);
        resolve(request.result);
      };
      
      request.onerror = () => {
        console.error('Failed to save offline transaction');
        reject(request.error);
      };
    });
  }

  async getOfflineTransactions() {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['transactions'], 'readonly');
      const store = transaction.objectStore('transactions');
      const index = store.index('status');
      const request = index.getAll('offline');

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = () => {
        console.error('Failed to get offline transactions');
        reject(request.error);
      };
    });
  }

  async markTransactionSynced(transactionId) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['transactions'], 'readwrite');
      const store = transaction.objectStore('transactions');
      const request = store.get(transactionId);

      request.onsuccess = () => {
        const transaction = request.result;
        if (transaction) {
          transaction.status = 'synced';
          transaction.synced = true;
          transaction.syncedAt = new Date().toISOString();
          
          const updateRequest = store.put(transaction);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Transaction not found'));
        }
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async removeOfflineTransaction(transactionId) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['transactions'], 'readwrite');
      const store = transaction.objectStore('transactions');
      const request = store.delete(transactionId);

      request.onsuccess = () => {
        console.log('Offline transaction removed:', transactionId);
        resolve();
      };
      
      request.onerror = () => {
        console.error('Failed to remove offline transaction');
        reject(request.error);
      };
    });
  }

  // Product cache methods
  async cacheProducts(products) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['products'], 'readwrite');
      const store = transaction.objectStore('products');
      
      // Clear existing products
      store.clear();
      
      // Add new products
      products.forEach(product => {
        store.add({
          ...product,
          cachedAt: new Date().toISOString()
        });
      });

      transaction.oncomplete = () => {
        console.log('Products cached successfully');
        resolve();
      };
      
      transaction.onerror = () => {
        console.error('Failed to cache products');
        reject(transaction.error);
      };
    });
  }

  async getCachedProducts() {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['products'], 'readonly');
      const store = transaction.objectStore('products');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = () => {
        console.error('Failed to get cached products');
        reject(request.error);
      };
    });
  }

  // Stock movement methods
  async saveOfflineStockMovement(movement) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stock_movements'], 'readwrite');
      const store = transaction.objectStore('stock_movements');
      
      const offlineMovement = {
        ...movement,
        timestamp: new Date().toISOString(),
        status: 'offline',
        synced: false
      };

      const request = store.add(offlineMovement);
      
      request.onsuccess = () => {
        console.log('Stock movement saved offline:', request.result);
        resolve(request.result);
      };
      
      request.onerror = () => {
        console.error('Failed to save offline stock movement');
        reject(request.error);
      };
    });
  }

  async getOfflineStockMovements() {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stock_movements'], 'readonly');
      const store = transaction.objectStore('stock_movements');
      const index = store.index('status');
      const request = index.getAll('offline');

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = () => {
        console.error('Failed to get offline stock movements');
        reject(request.error);
      };
    });
  }

  // Network status
  isOnline() {
    return navigator.onLine;
  }

  // Sync methods
  async syncOfflineData() {
    if (!this.isOnline()) {
      console.log('Device is offline, cannot sync');
      return;
    }

    try {
      // Sync offline transactions
      const offlineTransactions = await this.getOfflineTransactions();
      for (const transaction of offlineTransactions) {
        try {
          // Attempt to sync transaction
          const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(transaction)
          });

          if (response.ok) {
            await this.markTransactionSynced(transaction.id);
            console.log('Transaction synced:', transaction.id);
          }
        } catch (error) {
          console.error('Failed to sync transaction:', error);
        }
      }

      // Sync offline stock movements
      const offlineMovements = await this.getOfflineStockMovements();
      for (const movement of offlineMovements) {
        try {
          const response = await fetch('/api/stock-movements', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(movement)
          });

          if (response.ok) {
            await this.removeOfflineTransaction(movement.id);
            console.log('Stock movement synced:', movement.id);
          }
        } catch (error) {
          console.error('Failed to sync stock movement:', error);
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

// Create singleton instance
const offlineStorage = new OfflineStorage();

export default offlineStorage;
