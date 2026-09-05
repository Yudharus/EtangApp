'use client';

import React from 'react';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { AppLayoutTemplate } from '@/components/templates/AppLayoutTemplate';
import { FinanceDashboardOverview } from '@/components/organisms/FinanceDashboardOverview';
import { TransactionTable } from '@/components/organisms/TransactionTable';
import { CategoryGrid } from '@/components/organisms/CategoryGrid';
import { SavingsGoalList } from '@/components/organisms/SavingsGoalList';

export default function WorkspacePage() {
  const { activeTab } = useFinanceStore();

  return (
    <AppLayoutTemplate>
      {activeTab === 'dashboard' && <FinanceDashboardOverview />}
      {activeTab === 'transactions' && <TransactionTable filterType="all" />}
      {activeTab === 'income' && <TransactionTable filterType="income" />}
      {activeTab === 'deposits' && <TransactionTable filterType="deposit" />}
      {activeTab === 'categories' && <CategoryGrid />}
      {activeTab === 'goals' && <SavingsGoalList />}
    </AppLayoutTemplate>
  );
}
