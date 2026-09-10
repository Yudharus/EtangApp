import { create } from 'zustand';
import { Transaction, Category, SavingsGoal, TransactionType } from '@/types/finance';
import { supabase } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

interface FinanceStoreState {
  // Navigation State
  activeTab: 'dashboard' | 'transactions' | 'income' | 'categories' | 'goals';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'income' | 'categories' | 'goals') => void;

  // Authentication State
  user: User | null;
  authLoading: boolean;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (isOpen: boolean) => void;
  initAuth: () => () => void;
  signOut: () => Promise<void>;

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
  dataLoading: boolean;
  transactions: Transaction[];
  categories: Category[];
  savingsGoals: SavingsGoal[];

  // Actions
  fetchUserData: (userId?: string) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (cat: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => Promise<void>;
  addDepositToGoal: (goalId: string, amount: number) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;

  // Filter state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (cat: string) => void;
}

const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Makanan & Minuman', icon: 'Utensils', color: 'emerald', type: 'expense', monthlyLimit: 2500000 },
  { id: 'cat-2', name: 'Belanja Bulanan', icon: 'ShoppingBag', color: 'blue', type: 'expense', monthlyLimit: 2000000 },
  { id: 'cat-3', name: 'Transportasi', icon: 'Car', color: 'amber', type: 'expense', monthlyLimit: 1000000 },
  { id: 'cat-4', name: 'Tagihan & Utilitas', icon: 'Zap', color: 'purple', type: 'expense', monthlyLimit: 1500000 },
  { id: 'cat-5', name: 'Hiburan', icon: 'Film', color: 'rose', type: 'expense', monthlyLimit: 800000 },
  { id: 'cat-6', name: 'Gaji Bulanan', icon: 'Wallet', color: 'teal', type: 'income' },
  { id: 'cat-7', name: 'Project Freelance', icon: 'Laptop', color: 'indigo', type: 'income' },
];

export const useFinanceStore = create<FinanceStoreState>((set, get) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  user: null,
  authLoading: true,
  isAuthModalOpen: false,
  setAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),

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

  dataLoading: false,
  transactions: [],
  categories: defaultCategories,
  savingsGoals: [],

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedCategoryFilter: 'all',
  setSelectedCategoryFilter: (cat) => set({ selectedCategoryFilter: cat }),

  initAuth: () => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      set({ user: currentUser, authLoading: false });
      if (currentUser) {
        get().fetchUserData(currentUser.id);
      }
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      set({ user: currentUser, authLoading: false });
      if (currentUser) {
        get().fetchUserData(currentUser.id);
      } else {
        // Reset to default empty state when logged out
        set({
          transactions: [],
          categories: defaultCategories,
          savingsGoals: [],
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      transactions: [],
      categories: defaultCategories,
      savingsGoals: [],
    });
  },

  fetchUserData: async (userId) => {
    const currentUserId = userId || get().user?.id;
    if (!currentUserId) return;

    set({ dataLoading: true });
    try {
      // 1. Fetch Categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (catError) console.error('Error fetching categories:', catError);

      if (catData && catData.length > 0) {
        set({
          categories: catData.map((c) => ({
            id: c.id,
            name: c.name,
            icon: c.icon,
            color: c.color,
            type: c.type as TransactionType,
            monthlyLimit: c.monthly_limit ? Number(c.monthly_limit) : undefined,
          })),
        });
      } else {
        // Seed default categories if none exist for this user
        const seedRows = defaultCategories.map((c) => ({
          user_id: currentUserId,
          name: c.name,
          icon: c.icon,
          color: c.color,
          type: c.type,
          monthly_limit: c.monthlyLimit ?? null,
        }));
        const { data: seeded } = await supabase
          .from('categories')
          .insert(seedRows)
          .select('*');

        if (seeded && seeded.length > 0) {
          set({
            categories: seeded.map((c) => ({
              id: c.id,
              name: c.name,
              icon: c.icon,
              color: c.color,
              type: c.type as TransactionType,
              monthlyLimit: c.monthly_limit ? Number(c.monthly_limit) : undefined,
            })),
          });
        }
      }

      // 2. Fetch Transactions
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (txError) console.error('Error fetching transactions:', txError);
      if (txData) {
        set({
          transactions: txData.map((t) => ({
            id: t.id,
            title: t.title,
            amount: Number(t.amount),
            category: t.category,
            type: t.type as TransactionType,
            date: t.date,
            merchant: t.merchant || undefined,
            items: t.items || undefined,
            notes: t.notes || undefined,
          })),
        });
      }

      // 3. Fetch Savings Goals
      const { data: goalData, error: goalError } = await supabase
        .from('savings_goals')
        .select('*')
        .order('created_at', { ascending: true });

      if (goalError) console.error('Error fetching savings goals:', goalError);
      if (goalData) {
        set({
          savingsGoals: goalData.map((g) => ({
            id: g.id,
            title: g.title,
            targetAmount: Number(g.target_amount),
            currentAmount: Number(g.current_amount),
            targetDate: g.target_date,
            color: g.color,
            icon: g.icon,
            notes: g.notes || undefined,
          })),
        });
      }
    } catch (err) {
      console.error('Error in fetchUserData:', err);
    } finally {
      set({ dataLoading: false });
    }
  },

  addTransaction: async (tx) => {
    const user = get().user;
    // Optimistic ID
    const tempId = `tx-${Date.now()}`;
    const newTx: Transaction = {
      ...tx,
      id: tempId,
    };

    set((state) => ({
      transactions: [newTx, ...state.transactions],
    }));

    if (user) {
      // Persist to Supabase without receiptImage
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          title: tx.title,
          amount: tx.amount,
          category: tx.category,
          type: tx.type,
          date: tx.date,
          merchant: tx.merchant || null,
          items: tx.items || [],
          notes: tx.notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting transaction:', error);
      } else if (data) {
        // Replace tempId with Supabase real UUID
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === tempId ? { ...t, id: data.id } : t
          ),
        }));
      }
    }
  },

  deleteTransaction: async (id) => {
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));

    if (get().user) {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) console.error('Error deleting transaction:', error);
    }
  },

  addCategory: async (cat) => {
    const trimmedName = cat.name.trim();
    if (!trimmedName) return;

    // Check duplicate
    const isDuplicate = get().categories.some(
      (c) => c.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      console.warn(`Category "${trimmedName}" already exists. Aborted.`);
      return;
    }

    const user = get().user;
    const tempId = `cat-${Date.now()}`;
    const newCat: Category = {
      ...cat,
      name: trimmedName,
      id: tempId,
    };

    set((state) => ({
      categories: [...state.categories, newCat],
    }));

    if (user) {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: trimmedName,
          icon: cat.icon,
          color: cat.color,
          type: cat.type,
          monthly_limit: cat.monthlyLimit || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting category:', error);
      } else if (data) {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === tempId ? { ...c, id: data.id } : c
          ),
        }));
      }
    }
  },

  deleteCategory: async (id) => {
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));

    if (get().user) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) console.error('Error deleting category:', error);
    }
  },

  addSavingsGoal: async (goal) => {
    const trimmedTitle = goal.title.trim();
    if (!trimmedTitle) return;

    // Check duplicate
    const isDuplicate = get().savingsGoals.some(
      (g) => g.title.trim().toLowerCase() === trimmedTitle.toLowerCase()
    );
    if (isDuplicate) {
      console.warn(`Savings goal "${trimmedTitle}" already exists. Aborted.`);
      return;
    }

    const user = get().user;
    const tempId = `goal-${Date.now()}`;
    const newGoal: SavingsGoal = {
      ...goal,
      title: trimmedTitle,
      id: tempId,
      currentAmount: 0,
    };

    set((state) => ({
      savingsGoals: [...state.savingsGoals, newGoal],
    }));

    if (user) {
      const { data, error } = await supabase
        .from('savings_goals')
        .insert({
          user_id: user.id,
          title: trimmedTitle,
          target_amount: goal.targetAmount,
          current_amount: 0,
          target_date: goal.targetDate,
          color: goal.color,
          icon: goal.icon,
          notes: goal.notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting savings goal:', error);
      } else if (data) {
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) =>
            g.id === tempId ? { ...g, id: data.id } : g
          ),
        }));
      }
    }
  },

  addDepositToGoal: async (goalId, amount) => {
    const targetGoal = get().savingsGoals.find((g) => g.id === goalId);
    if (!targetGoal) return;

    const updatedAmount = targetGoal.currentAmount + amount;

    // Optimistic update
    set((state) => ({
      savingsGoals: state.savingsGoals.map((g) =>
        g.id === goalId ? { ...g, currentAmount: updatedAmount } : g
      ),
    }));

    // Record as expense transaction for tabungan
    await get().addTransaction({
      title: `Alokasi Tabungan: ${targetGoal.title}`,
      amount: amount,
      category: 'Tagihan & Utilitas', // or general savings category
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      notes: `Alokasi dana ke target tabungan ${targetGoal.title}`,
    });

    if (get().user) {
      const { error } = await supabase
        .from('savings_goals')
        .update({ current_amount: updatedAmount })
        .eq('id', goalId);

      if (error) console.error('Error updating goal amount:', error);
    }
  },

  deleteSavingsGoal: async (id) => {
    set((state) => ({
      savingsGoals: state.savingsGoals.filter((g) => g.id !== id),
    }));

    if (get().user) {
      const { error } = await supabase.from('savings_goals').delete().eq('id', id);
      if (error) console.error('Error deleting goal:', error);
    }
  },
}));
