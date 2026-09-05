export type TransactionType = 'expense' | 'income' | 'deposit';

export interface PurchasedItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  merchant?: string;
  items?: PurchasedItem[];
  receiptImage?: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string; // Tailwind color or hex
  type: TransactionType;
  monthlyLimit?: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  color: string;
  icon: string;
  notes?: string;
}

export interface ReceiptScanResult {
  merchantName: string;
  date: string;
  totalAmount: number;
  subtotalAmount?: number;
  taxAmount?: number;
  changeAmount?: number;
  cashAmount?: number;
  purchasedItems: PurchasedItem[];
  suggestedCategory: string;
  rawOcrText: string;
  confidenceScore: number;
  mathVerified?: boolean;
}
