'use client';

import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Briefcase, 
  User, 
  Calendar, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  Copy, 
  Shield, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  Building2, 
  Receipt,
  FileText,
  Lock,
  Sparkles,
  Fingerprint
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Transaction, TransactionType, ExpenseType } from '@/utils/seedData';
import { 
  calculateFinancialMetrics, 
  filterTransactionsByDateRange, 
  formatCurrency 
} from '@/utils/calculations';

const EXPENSE_CATEGORIES = [
  'Company Travel & Meetings',
  'Tech & Software Subscriptions',
  'Office Supplies & Hardware',
  'Food & Dining',
  'Transport & Fuel',
  'Utilities & Bills',
  'Health & Fitness',
  'Personal & Family',
  'Education & Books',
  'Other'
];

const INCOME_CATEGORIES = [
  'Salary & Payroll',
  'Bonus & Performance',
  'Freelance & Consulting',
  'Investments & Dividends',
  'Other Income'
];

export const MoneyTrackerView: React.FC = () => {
  const { 
    data, 
    todayStr, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction, 
    toggleReimbursementStatus,
    triggerSound, 
    confirmAction,
    setIsAppLocked
  } = useApp();

  const transactions: Transaction[] = data.transactions || [];
  const currency = data.profile?.currency || 'ETB';

  // Filters
  const [timeRange, setTimeRange] = useState<'today' | '7days' | 'month' | 'all'>('month');
  const [typeFilter, setTypeFilter] = useState<'all' | 'personal' | 'company' | 'income'>('all');
  // Privacy mode hides amounts by default for banking privacy
  const [privacyMode, setPrivacyMode] = useState<boolean>(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFinanceReportOpen, setIsFinanceReportOpen] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [type, setType] = useState<TransactionType>('expense');
  const [expenseType, setExpenseType] = useState<ExpenseType>('personal');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [txDate, setTxDate] = useState(todayStr);
  const [notes, setNotes] = useState('');
  const [isReimbursed, setIsReimbursed] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Calculations
  const metrics = useMemo(() => {
    return calculateFinancialMetrics(transactions);
  }, [transactions]);

  // Filtered transactions for the list
  const filteredTransactions = useMemo(() => {
    const rangeFiltered = filterTransactionsByDateRange(transactions, timeRange, todayStr);
    return rangeFiltered.filter((tx) => {
      if (typeFilter === 'income') return tx.type === 'income';
      if (typeFilter === 'personal') return tx.type === 'expense' && tx.expenseType !== 'company';
      if (typeFilter === 'company') return tx.type === 'expense' && tx.expenseType === 'company';
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, timeRange, typeFilter, todayStr]);

  // Company unreimbursed transactions (for weekly finance report submission)
  const pendingCompanyExpenses = useMemo(() => {
    return transactions.filter(
      (tx) => tx.type === 'expense' && tx.expenseType === 'company' && !tx.reimbursed
    ).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions]);

  const totalPendingAmount = pendingCompanyExpenses.reduce(
    (sum, tx) => sum + (Number(tx.amount) || 0), 
    0
  );

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setType('expense');
    setExpenseType('personal');
    setCategory(EXPENSE_CATEGORIES[0]);
    setTxDate(todayStr);
    setNotes('');
    setIsReimbursed(false);
    setEditingTxId(null);
    setFormError('');
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTxId(tx.id);
    setTitle(tx.title);
    setAmount(tx.amount);
    setType(tx.type);
    setExpenseType(tx.expenseType || 'personal');
    setCategory(tx.category || (tx.type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]));
    setTxDate(tx.date);
    setNotes(tx.notes || '');
    setIsReimbursed(!!tx.reimbursed);
    setIsAddModalOpen(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Please enter a description or vendor name');
      return;
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setFormError('Please enter a valid amount greater than 0');
      return;
    }

    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 150));

    const payload = {
      title: title.trim(),
      amount: numAmount,
      type,
      expenseType: type === 'expense' ? expenseType : undefined,
      category,
      date: txDate,
      reimbursed: type === 'expense' && expenseType === 'company' ? isReimbursed : false,
      notes: notes.trim(),
      createdAt: new Date().toISOString()
    };

    if (editingTxId) {
      updateTransaction(editingTxId, payload);
    } else {
      addTransaction(payload);
    }

    setIsSaving(false);
    setIsAddModalOpen(false);
    resetForm();
    triggerSound('level-up');
  };

  const handleDelete = (tx: Transaction) => {
    confirmAction({
      title: 'Delete Transaction?',
      message: `Are you sure you want to delete "${tx.title}" (${formatCurrency(tx.amount, currency)})? This will adjust your financial balance.`,
      confirmText: 'Delete Transaction',
      variant: 'danger',
      onConfirm: () => {
        deleteTransaction(tx.id);
        triggerSound('pop');
      }
    });
  };

  const handleCopyFinanceSummary = () => {
    if (pendingCompanyExpenses.length === 0) return;

    let text = `========================================\n`;
    text += `WEEKLY COMPANY EXPENSE REIMBURSEMENT REPORT\n`;
    text += `Employee: ${data.profile?.name || 'Abdulaziz'}\n`;
    text += `Date Generated: ${todayStr}\n`;
    text += `========================================\n\n`;

    pendingCompanyExpenses.forEach((tx, idx) => {
      text += `${idx + 1}. [${tx.date}] ${tx.title}\n`;
      text += `   Category: ${tx.category}\n`;
      text += `   Amount: ${formatCurrency(tx.amount, currency)}\n`;
      if (tx.notes) text += `   Notes: ${tx.notes}\n`;
      text += `\n`;
    });

    text += `----------------------------------------\n`;
    text += `TOTAL REIMBURSEMENT OWED: ${formatCurrency(totalPendingAmount, currency)}\n`;
    text += `========================================\n`;

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    triggerSound('level-up');
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const mask = (val: string) => (privacyMode ? '••••••' : val);

  return (
    <div className="page-container" style={{ paddingBottom: '5rem' }}>
      {/* Top Banner Deck */}
      <div 
        className="card"
        style={{
          background: 'var(--bg-card-header)',
          border: '1px solid var(--border-color)',
          padding: '1.5rem',
          marginBottom: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <DollarSign size={22} />
              </div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
                Money & Expense Management
              </h1>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '640px' }}>
              Track personal expenses, monthly salary payroll, and company-reimbursable out-of-pocket expenses with weekly finance reports.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Privacy Mode Toggle */}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setPrivacyMode(!privacyMode)}
              title={privacyMode ? 'Show amounts' : 'Hide amounts (Privacy Mode)'}
              style={{ gap: '0.35rem', color: 'var(--text-secondary)' }}
            >
              {privacyMode ? <Eye size={15} /> : <EyeOff size={15} />}
              <span>{privacyMode ? 'Show' : 'Hide'}</span>
            </button>

            {/* Instant Lock Button */}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setIsAppLocked(true)}
              title="Lock financial vault immediately"
              style={{ gap: '0.35rem', color: 'var(--text-muted)' }}
            >
              <Lock size={15} />
              <span className="hide-mobile">Lock Vault</span>
            </button>

            {/* Add Transaction Button */}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              style={{ gap: '0.35rem', fontWeight: 700 }}
            >
              <Plus size={16} />
              <span>Record Transaction</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Executive Financial KPI Cards (2x2 on mobile, 4-col on desktop) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
        gap: '0.75rem',
        marginBottom: '1rem'
      }}>
        {/* Net Cash Balance */}
        <div className="card" style={{ padding: '0.95rem 1rem', borderLeft: '4px solid #10b981', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
              NET BALANCE
            </span>
            <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <DollarSign size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.28rem', fontWeight: 900, color: metrics.netBalance >= 0 ? '#10b981' : '#ef4444', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            {mask(formatCurrency(metrics.netBalance, currency))}
          </div>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Inflow minus personal
          </p>
        </div>

        {/* Company Reimbursable Owed */}
        <div 
          className="card" 
          onClick={() => setIsFinanceReportOpen(true)}
          style={{ 
            padding: '0.95rem 1rem', 
            borderLeft: '4px solid #f59e0b',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.02))',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
          title="Click to view weekly finance reimbursement report"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.02em' }}>
              COMPANY OWED
            </span>
            <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <Building2 size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.28rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            {mask(formatCurrency(metrics.pendingCompanyReimbursement, currency))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {metrics.pendingCount} pending
            </span>
            <span style={{ fontSize: '0.66rem', color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              Claim <ChevronRight size={12} />
            </span>
          </div>
        </div>

        {/* Total Income */}
        <div className="card" style={{ padding: '0.95rem 1rem', borderLeft: '4px solid var(--primary-light)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
              TOTAL INFLOW
            </span>
            <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
              <ArrowDownLeft size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.28rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            {mask(formatCurrency(metrics.totalIncome, currency))}
          </div>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Payroll deposits
          </p>
        </div>

        {/* Personal Outflow */}
        <div className="card" style={{ padding: '0.95rem 1rem', borderLeft: '4px solid #ef4444', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
              PERSONAL OUTFLOW
            </span>
            <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
              <ArrowUpRight size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.28rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            {mask(formatCurrency(metrics.totalPersonalExpense, currency))}
          </div>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Living costs (non-refundable)
          </p>
        </div>
      </div>

      {/* Filter Toolbar & Actions (Mobile First Horizontal Scrolling) */}
      <div 
        className="card"
        style={{
          padding: '0.75rem 0.85rem',
          marginBottom: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}
      >
        {/* Row 1: Category / Type Tabs (Swipeable on Mobile) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          paddingBottom: '2px',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch'
        }}>
          {[
            { id: 'all', label: 'All Activity' },
            { id: 'personal', label: '👤 Personal' },
            { id: 'company', label: '💼 Company (Reimbursable)' },
            { id: 'income', label: '💰 Income' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`btn btn-sm ${typeFilter === tab.id ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTypeFilter(tab.id as any)}
              style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                flexShrink: 0
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Row 2: Time Range Pills & Quick Summary */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.35rem',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }}>
            {[
              { id: 'today', label: 'Today' },
              { id: '7days', label: '7 Days' },
              { id: 'month', label: 'This Month' },
              { id: 'all', label: 'All Time' }
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                className={`btn btn-sm ${timeRange === r.id ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => setTimeRange(r.id as any)}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '0.28rem 0.6rem',
                  borderRadius: '6px',
                  flexShrink: 0,
                  borderColor: timeRange === r.id ? 'var(--primary-light)' : 'transparent'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            Showing <strong>{filteredTransactions.length}</strong> record(s)
          </span>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Receipt size={16} color="var(--primary-light)" />
            <span>Transaction Ledger ({filteredTransactions.length})</span>
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {timeRange.toUpperCase()} View
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Receipt size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.35rem 0' }}>No transactions recorded for this period</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Click "Record Transaction" to add your payroll or expense.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredTransactions.map((tx, idx) => {
              const isIncome = tx.type === 'income';
              const isCompany = tx.type === 'expense' && tx.expenseType === 'company';

              return (
                <div
                  key={tx.id || idx}
                  style={{
                    padding: '0.85rem 1rem',
                    borderBottom: idx < filteredTransactions.length - 1 ? '1px solid var(--border-color)' : 'none',
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)'
                  }}
                >
                  {/* Top Row: Icon + Title + Amount (Never Collides) */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    gap: '0.75rem', 
                    marginBottom: '0.45rem' 
                  }}>
                    {/* Left: Icon & Title & Category */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: isIncome 
                          ? 'rgba(16, 185, 129, 0.15)' 
                          : isCompany 
                            ? 'rgba(245, 158, 11, 0.15)' 
                            : 'rgba(99, 102, 241, 0.12)',
                        color: isIncome ? '#10b981' : isCompany ? '#f59e0b' : 'var(--primary-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {isIncome ? <ArrowDownLeft size={19} /> : isCompany ? <Building2 size={19} /> : <User size={19} />}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h4 style={{ 
                          fontSize: '0.92rem', 
                          fontWeight: 800, 
                          color: 'var(--text-primary)', 
                          margin: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {tx.title}
                        </h4>
                        <div style={{ 
                          fontSize: '0.72rem', 
                          color: 'var(--text-muted)', 
                          marginTop: '2px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.4rem', 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis' 
                        }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{tx.category}</span>
                          <span>•</span>
                          <span>{tx.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Big Clean Amount */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontSize: '1.05rem',
                        fontWeight: 900,
                        color: isIncome ? '#10b981' : isCompany ? '#f59e0b' : 'var(--text-primary)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.15
                      }}>
                        {isIncome ? '+' : '-'}{mask(formatCurrency(tx.amount, currency))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Status Badges & Action Buttons */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    paddingTop: '0.35rem',
                    borderTop: '1px dashed rgba(255, 255, 255, 0.05)',
                    fontSize: '0.72rem'
                  }}>
                    {/* Badges / Reimbursement Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {isCompany && (
                        <button
                          type="button"
                          onClick={() => toggleReimbursementStatus(tx.id)}
                          className="badge"
                          title="Click to toggle repayment status"
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.22rem 0.55rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            background: tx.reimbursed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: tx.reimbursed ? '#10b981' : '#f59e0b',
                            border: `1px solid ${tx.reimbursed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                          }}
                        >
                          <span>{tx.reimbursed ? '✓ Reimbursed by Company' : '⏳ Pending Finance Claim'}</span>
                          <span style={{ textDecoration: 'underline', opacity: 0.85, fontSize: '0.64rem' }}>
                            ({tx.reimbursed ? 'Mark Unpaid' : 'Mark Repaid'})
                          </span>
                        </button>
                      )}

                      {!isIncome && !isCompany && (
                        <span className="badge" style={{ fontSize: '0.66rem', background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                          👤 Personal Outflow
                        </span>
                      )}

                      {isIncome && (
                        <span className="badge" style={{ fontSize: '0.66rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                          💰 Payroll Deposit
                        </span>
                      )}

                      {tx.notes && (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          "{tx.notes}"
                        </span>
                      )}
                    </div>

                    {/* Edit & Delete Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginLeft: 'auto' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => openEditModal(tx)}
                        style={{ padding: '0.3rem', color: 'var(--text-muted)' }}
                        title="Edit entry"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => handleDelete(tx)}
                        style={{ padding: '0.3rem', color: '#ef4444' }}
                        title="Delete entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: ADD / EDIT TRANSACTION */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', padding: '1.75rem', borderRadius: '20px' }}
          >
            <div className="modal-header" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
                  <Receipt size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                    {editingTxId ? 'Edit Transaction' : 'Record Transaction'}
                  </h3>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
                    Log income, personal expense, or reimbursable company expense
                  </p>
                </div>
              </div>
            </div>

            {formError && (
              <div style={{ padding: '0.6rem 0.85rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveTransaction}>
              {/* Type Switcher: Expense vs Income */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Transaction Type *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={`btn ${type === 'expense' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => {
                      setType('expense');
                      setCategory(EXPENSE_CATEGORIES[0]);
                    }}
                    style={{ justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem' }}
                  >
                    <ArrowUpRight size={15} /> Expense
                  </button>
                  <button
                    type="button"
                    className={`btn ${type === 'income' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => {
                      setType('income');
                      setCategory(INCOME_CATEGORIES[0]);
                    }}
                    style={{ justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem' }}
                  >
                    <ArrowDownLeft size={15} /> Income / Payroll
                  </button>
                </div>
              </div>

              {/* If Expense: Personal vs Company Reimbursable Radio */}
              {type === 'expense' && (
                <div style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1.1rem'
                }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    Who owns this expense? *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div
                      onClick={() => setExpenseType('personal')}
                      style={{
                        padding: '0.65rem',
                        borderRadius: '10px',
                        border: expenseType === 'personal' ? '2px solid var(--primary-light)' : '1px solid var(--border-color)',
                        background: expenseType === 'personal' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: 800, fontSize: '0.82rem' }}>
                        <User size={15} /> Personal
                      </div>
                      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                        Non-refundable cost
                      </p>
                    </div>

                    <div
                      onClick={() => setExpenseType('company')}
                      style={{
                        padding: '0.65rem',
                        borderRadius: '10px',
                        border: expenseType === 'company' ? '2px solid #f59e0b' : '1px solid var(--border-color)',
                        background: expenseType === 'company' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-card)',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: 800, fontSize: '0.82rem', color: '#f59e0b' }}>
                        <Building2 size={15} /> Company
                      </div>
                      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                        Claim back from finance
                      </p>
                    </div>
                  </div>

                  {expenseType === 'company' && (
                    <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input
                        type="checkbox"
                        id="reimbursedCheck"
                        checked={isReimbursed}
                        onChange={(e) => setIsReimbursed(e.target.checked)}
                      />
                      <label htmlFor="reimbursedCheck" style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        Already repaid by the company finance team
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Title & Amount Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Title / Description *
                  </label>
                  <input
                    type="text"
                    className="input"
                    required
                    placeholder={type === 'income' ? 'e.g. Monthly Full-time Salary' : 'e.g. Client Dinner, Taxi ride, WiFi'}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Amount ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="input"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ width: '100%', fontWeight: 700 }}
                  />
                </div>
              </div>

              {/* Category & Date Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Category *
                  </label>
                  <select
                    className="input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    {(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Date *
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    style={{ width: '100%' }}
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Notes / Receipt Details (Optional)
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Receipt reference, finance approval notes, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                  style={{ fontWeight: 700 }}
                >
                  {isSaving ? (
                    <>
                      <span className="btn-spinner" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    editingTxId ? 'Update Entry' : 'Save Transaction'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: WEEKLY FINANCE REIMBURSEMENT REPORT */}
      {isFinanceReportOpen && (
        <div className="modal-overlay" onClick={() => setIsFinanceReportOpen(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px', padding: '1.75rem', borderRadius: '20px' }}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                    Weekly Finance Reimbursement Report
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    Report for submitting company expenses to your finance team
                  </p>
                </div>
              </div>
            </div>

            {/* Total Highlight */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.05))',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '14px',
              padding: '1.25rem',
              marginBottom: '1.25rem',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
                Total Reimbursable Amount Owed
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b', marginTop: '0.2rem' }}>
                {formatCurrency(totalPendingAmount, currency)}
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '0.35rem 0 0 0' }}>
                {pendingCompanyExpenses.length} pending receipt(s) to claim from company
              </p>
            </div>

            {/* Line Items */}
            <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '10px', background: 'var(--bg-input)' }}>
              {pendingCompanyExpenses.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  ✓ All company expenses have been reimbursed!
                </div>
              ) : (
                pendingCompanyExpenses.map((tx, idx) => (
                  <div 
                    key={tx.id} 
                    style={{ 
                      padding: '0.75rem 1rem', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      borderBottom: idx < pendingCompanyExpenses.length - 1 ? '1px solid var(--border-color)' : 'none'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>{tx.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{tx.date} • {tx.category}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f59e0b' }}>
                        {formatCurrency(tx.amount, currency)}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleReimbursementStatus(tx.id)}
                        style={{ fontSize: '0.68rem', color: 'var(--primary-light)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        Mark Reimbursed
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Actions: Copy Summary & Close */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsFinanceReportOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCopyFinanceSummary}
                disabled={pendingCompanyExpenses.length === 0}
                style={{ fontWeight: 700, gap: '0.4rem' }}
              >
                {copiedSuccess ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Report Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copy for Finance</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

