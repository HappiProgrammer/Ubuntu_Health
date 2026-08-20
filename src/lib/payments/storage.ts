import fs from 'fs';
import path from 'path';
import { TransactionRecord } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');

// In-memory cache for speed
let inMemoryTransactions: Map<string, TransactionRecord> = new Map();
let isInitialized = false;

function initStorage() {
  if (isInitialized) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(TRANSACTIONS_FILE)) {
      const raw = fs.readFileSync(TRANSACTIONS_FILE, 'utf-8');
      const list: TransactionRecord[] = JSON.parse(raw || '[]');
      inMemoryTransactions.clear();
      for (const item of list) {
        inMemoryTransactions.set(item.id, item);
      }
    } else {
      fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
    isInitialized = true;
  } catch (err) {
    console.warn('Could not initialize file storage, using in-memory only:', err);
    isInitialized = true;
  }
}

function persistToFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const list = Array.from(inMemoryTransactions.values());
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist transactions to file:', err);
  }
}

export const transactionStorage = {
  save(transaction: TransactionRecord): TransactionRecord {
    initStorage();
    transaction.updatedAt = new Date().toISOString();
    inMemoryTransactions.set(transaction.id, transaction);
    persistToFile();
    return transaction;
  },

  getById(id: string): TransactionRecord | null {
    initStorage();
    return inMemoryTransactions.get(id) || null;
  },

  getByReferenceId(refId: string): TransactionRecord | null {
    initStorage();
    for (const txn of inMemoryTransactions.values()) {
      if (txn.referenceId === refId) {
        return txn;
      }
    }
    return null;
  },

  updateStatus(
    id: string, 
    status: TransactionRecord['status'], 
    details?: { financialTransactionId?: string; failureReason?: string }
  ): TransactionRecord | null {
    initStorage();
    const txn = inMemoryTransactions.get(id);
    if (!txn) return null;

    txn.status = status;
    txn.updatedAt = new Date().toISOString();
    if (status === 'successful') {
      txn.completedAt = new Date().toISOString();
    }
    if (details?.financialTransactionId) {
      txn.financialTransactionId = details.financialTransactionId;
    }
    if (details?.failureReason) {
      txn.failureReason = details.failureReason;
    }

    inMemoryTransactions.set(id, txn);
    persistToFile();
    return txn;
  },

  getAll(): TransactionRecord[] {
    initStorage();
    return Array.from(inMemoryTransactions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
};
