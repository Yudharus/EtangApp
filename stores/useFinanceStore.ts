import { create } from 'zustand';
import { Transaction, Category, SavingsGoal, TransactionType, ReceiptScanResult } from '@/types/finance';

interface FinanceStoreState {
  // Navigation State
  activeTab: 'dashboard' | 'transactions' | 'income' | 'deposits' | 'categories' | 'goals';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'income' | 'deposits' | 'categories' | 'goals') => void;

  // Modals UI state
  isScannerOpen: boolean;
  setScannerOpen: (isOpen: boolean) => void;
  isAddTransactionOpen: boolean;
  setAddTransactionOpen: (isOpen: boolean) => void;
  isAddCategoryOpen: boolean;
  setAddCategoryOpen: (isOpen: boolean) => void;
  isAddGoalOpen: boolean;
  setAddGoalOpen: (isOpen: boolean) => void;
  isDepositModalOpen: boolean;
  selectedGoalIdForDeposit: string | null;
  openDepositModal: (goalId: string) => void;
  closeDepositModal: () => void;

  // Data Collections
  transactions: Transaction[];
  categories: Category[];
  savingsGoals: SavingsGoal[];

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (cat: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  addDepositToGoal: (goalId: string, amount: number) => void;
  deleteSavingsGoal: (id: string) => void;

  // Filter state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (cat: string) => void;
}

const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Makanan & Minuman', icon: 'Utensils', color: 'emerald', type: 'expense', monthlyLimit: 2500000 },
  { id: 'cat-2', name: 'Belanja Bulanan', icon: 'ShoppingBag', color: 'blue', type: 'expense', monthlyLimit: 2000000 },
  { id: 'cat-3', name: 'Transportasi', icon: 'Car', color: 'amber', type: 'expense', monthlyLimit: 1000000 },
  { id: 'cat-4', name: 'Tagihan & Utilitas', icon: 'Zap', color: 'purple', type: 'expense', monthlyLimit: 1500000 },
  { id: 'cat-5', name: 'Hiburan', icon: 'Film', color: 'rose', type: 'expense', monthlyLimit: 800000 },
  { id: 'cat-6', name: 'Gaji Bulanan', icon: 'Wallet', color: 'teal', type: 'income' },
  { id: 'cat-7', name: 'Project Freelance', icon: 'Laptop', color: 'indigo', type: 'income' },
  { id: 'cat-8', name: 'Setoran Deposito', icon: 'PiggyBank', color: 'cyan', type: 'deposit' },
];

const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Superindo Grocery Refresh',
    merchant: 'Superindo Express',
    amount: 348500,
    category: 'Belanja Bulanan',
    type: 'expense',
    date: '2026-09-03',
    items: [
      { id: 'i-1', name: 'Beras Pandan Wangi 5kg', qty: 1, price: 92000 },
      { id: 'i-2', name: 'Minyak Goreng 2L', qty: 2, price: 38000 },
      { id: 'i-3', name: 'Telur Ayam 1kg', qty: 1, price: 31500 },
      { id: 'i-4', name: 'Daging Sapi Slice 500g', qty: 1, price: 68500 },
      { id: 'i-5', name: 'Susu UHT Full Cream 1L', qty: 3, price: 26500 },
    ],
    notes: 'Discan via Smart Receipt Scanner',
  },
  {
    id: 'tx-2',
    title: 'Kopi Susu Gula Aren & Croissant',
    merchant: 'Kopi Kenangan',
    amount: 45000,
    category: 'Makanan & Minuman',
    type: 'expense',
    date: '2026-09-02',
    notes: 'Nongkrong sore bareng tim',
  },
  {
    id: 'tx-3',
    title: 'Gaji Utama September',
    merchant: 'PT Tech Inovasi Indonesia',
    amount: 14500000,
    category: 'Gaji Bulanan',
    type: 'income',
    date: '2026-09-01',
  },
  {
    id: 'tx-4',
    title: 'Pembayaran Tagihan Listrik & WiFi',
    merchant: 'PLN & Indihome',
    amount: 680000,
    category: 'Tagihan & Utilitas',
    type: 'expense',
    date: '2026-08-30',
  },
  {
    id: 'tx-5',
    title: 'Isi Bensin Pertamax',
    merchant: 'SPBU Pertamina',
    amount: 250000,
    category: 'Transportasi',
    type: 'expense',
    date: '2026-08-29',
  },
  {
    id: 'tx-6',
    title: 'Pembayaran Landing Page UI Design',
    merchant: 'Client Startup SG',
    amount: 4200000,
    category: 'Project Freelance',
    type: 'income',
    date: '2026-08-28',
  },
  {
    id: 'tx-7',
    title: 'Setoran Alokasi Dana Darurat',
    merchant: 'Bank Mandiri Savings',
    amount: 2000000,
    category: 'Setoran Deposito',
    type: 'deposit',
    date: '2026-08-25',
  },
];

const initialGoals: SavingsGoal[] = [
  {
    id: 'goal-1',
    title: 'Dana Darurat 6 Bulan',
    targetAmount: 30000000,
    currentAmount: 18500000,
    targetDate: '2026-12-31',
    color: 'emerald',
    icon: 'ShieldCheck',
    notes: 'Minimal simpanan untuk kondisi tak terduga',
  },
  {
    id: 'goal-2',
    title: 'Liburan Akhir Tahun ke Japan',
    targetAmount: 25000000,
    currentAmount: 14200000,
    targetDate: '2026-11-15',
    color: 'sky',
    icon: 'Plane',
    notes: 'Tiket & akomodasi Tokyo-Kyoto',
  },
  {
    id: 'goal-3',
    title: 'MacBook M3 Pro Upgrade',
    targetAmount: 32000000,
    currentAmount: 22000000,
    targetDate: '2026-10-01',
    color: 'purple',
    icon: 'Laptop',
    notes: 'Alat kerja pendukung freelance',
  },
];

export const useFinanceStore = create<FinanceStoreState>((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  isScannerOpen: false,
  setScannerOpen: (isOpen) => set({ isScannerOpen: isOpen }),
  isAddTransactionOpen: false,
  setAddTransactionOpen: (isOpen) => set({ isAddTransactionOpen: isOpen }),
  isAddCategoryOpen: false,
  setAddCategoryOpen: (isOpen) => set({ isAddCategoryOpen: isOpen }),
  isAddGoalOpen: false,
  setAddGoalOpen: (isOpen) => set({ isAddGoalOpen: isOpen }),

  isDepositModalOpen: false,
  selectedGoalIdForDeposit: null,
  openDepositModal: (goalId) => set({ isDepositModalOpen: true, selectedGoalIdForDeposit: goalId }),
  closeDepositModal: () => set({ isDepositModalOpen: false, selectedGoalIdForDeposit: null }),

  transactions: initialTransactions,
  categories: initialCategories,
  savingsGoals: initialGoals,

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedCategoryFilter: 'all',
  setSelectedCategoryFilter: (cat) => set({ selectedCategoryFilter: cat }),

  addTransaction: (tx) =>
    set((state) => ({
      transactions: [{ ...tx, id: `tx-${Date.now()}` }, ...state.transactions],
    })),

  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),

  addCategory: (cat) =>
    set((state) => ({
      categories: [...state.categories, { ...cat, id: `cat-${Date.now()}` }],
    })),

  deleteCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    })),

  addSavingsGoal: (goal) =>
    set((state) => ({
      savingsGoals: [
        ...state.savingsGoals,
        { ...goal, id: `goal-${Date.now()}`, currentAmount: 0 },
      ],
    })),

  addDepositToGoal: (goalId, amount) =>
    set((state) => {
      const updatedGoals = state.savingsGoals.map((g) =>
        g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
      );
      const targetGoal = state.savingsGoals.find((g) => g.id === goalId);
      const depositTx: Transaction = {
        id: `tx-${Date.now()}`,
        title: `Setoran: ${targetGoal?.title || 'Savings Target'}`,
        amount: amount,
        category: 'Setoran Deposito',
        type: 'deposit',
        date: new Date().toISOString().split('T')[0],
        notes: `Penambahan tabungan otomatis`,
      };
      return {
        savingsGoals: updatedGoals,
        transactions: [depositTx, ...state.transactions],
      };
    }),

  deleteSavingsGoal: (id) =>
    set((state) => ({
      savingsGoals: state.savingsGoals.filter((g) => g.id !== id),
    })),
}));
