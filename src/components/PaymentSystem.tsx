'use client'

import React, { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Check, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  TrendingUp, 
  Receipt, 
  Phone, 
  Download, 
  ExternalLink,
  Plus,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Filter,
  Search,
  Printer
} from 'lucide-react'
import { PaymentModal } from '@/components/payments/PaymentModal'
import { ReceiptModal } from '@/components/payments/ReceiptModal'
import { PaymentReceipt, TransactionRecord } from '@/lib/payments/types'
import { formatXAF } from '@/lib/payments/helpers'

interface PaymentSystemProps {
  userId: string
  userRole: 'nurse' | 'client'
}

export default function PaymentSystem({ userId, userRole }: PaymentSystemProps) {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null)
  
  const [filterProvider, setFilterProvider] = useState<'all' | 'mtn' | 'orange'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'successful' | 'pending' | 'failed'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const [customAmount, setCustomAmount] = useState<number>(15000)
  const [customDescription, setCustomDescription] = useState<string>('Home Care Session')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/payments/history')
      if (res.ok) {
        const data = await res.json()
        if (data.transactions) {
          setTransactions(data.transactions)
        }
      }
    } catch (err) {
      console.error('Error fetching transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenReceipt = (txn: TransactionRecord) => {
    const fee = Math.round(txn.amount * 0.01)
    const receipt: PaymentReceipt = {
      receiptNumber: `REC-${txn.provider.toUpperCase()}-${txn.id.substring(4)}`,
      transactionId: txn.id,
      referenceId: txn.referenceId,
      provider: txn.provider,
      payerName: txn.payerName || 'Patient / Client',
      phoneNumber: txn.phoneNumber,
      description: txn.description,
      amount: txn.amount,
      fee,
      totalPaid: txn.amount,
      currency: txn.currency,
      status: txn.status,
      paidAt: txn.completedAt || txn.updatedAt
    }
    setSelectedReceipt(receipt)
    setShowReceiptModal(true)
  }

  const handlePaymentSuccess = (receipt: PaymentReceipt) => {
    fetchTransactions()
  }

  const filteredTransactions = transactions.filter(t => {
    const matchProvider = filterProvider === 'all' || t.provider === filterProvider
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    const matchSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.phoneNumber?.includes(searchTerm) ||
                        t.id?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchProvider && matchStatus && matchSearch
  })

  // Quick stats
  const totalPaid = transactions
    .filter(t => t.status === 'successful')
    .reduce((acc, t) => acc + t.amount, 0)

  const successfulCount = transactions.filter(t => t.status === 'successful').length
  const pendingCount = transactions.filter(t => t.status === 'pending').length

  return (
    <div className="space-y-6">
      
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-primary-600" />
            <span>Mobile Money Billing & Payments</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Accept and send payments via MTN MoMo and Orange Money Cameroon
          </p>
        </div>

        <button
          onClick={() => setShowPaymentModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-cyan-500 px-5 py-3 text-xs font-bold text-white shadow-soft hover:brightness-110 transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Mobile Money Payment</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Processed</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {formatXAF(totalPaid)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Live verified mobile money</p>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Successful</span>
            <Check className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {successfulCount} Transactions
          </p>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">100% payout security</p>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Authorization</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {pendingCount} Pending
          </p>
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">Awaiting USSD PIN</p>
        </div>
      </div>

      {/* Transaction Filter Toolbar */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by phone, ref or service..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Provider Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterProvider('all')}
              className={`px-2.5 py-1 rounded-lg transition ${filterProvider === 'all' ? 'bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterProvider('mtn')}
              className={`px-2.5 py-1 rounded-lg transition ${filterProvider === 'mtn' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              MTN
            </button>
            <button
              onClick={() => setFilterProvider('orange')}
              className={`px-2.5 py-1 rounded-lg transition ${filterProvider === 'orange' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Orange
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-lg transition ${filterStatus === 'all' ? 'bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              All Status
            </button>
            <button
              onClick={() => setFilterStatus('successful')}
              className={`px-2.5 py-1 rounded-lg transition ${filterStatus === 'successful' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Paid
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-2.5 py-1 rounded-lg transition ${filterStatus === 'pending' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Pending
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
            <Clock className="h-6 w-6 animate-spin mx-auto mb-2 text-primary-500" />
            Loading Mobile Money records...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Smartphone className="h-10 w-10 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Mobile Money Transactions Found</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Click the "New Mobile Money Payment" button above to initiate a real test or payment with MTN MoMo or Orange Money.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3">Network</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredTransactions.map((txn) => {
                  const isMtn = txn.provider === 'mtn'
                  const isSuccess = txn.status === 'successful'
                  const isPending = txn.status === 'pending'

                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase ${
                          isMtn 
                            ? 'bg-amber-400 text-slate-950' 
                            : 'bg-orange-500 text-white'
                        }`}>
                          {isMtn ? 'MTN MoMo' : 'Orange'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                        {txn.description}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                        {txn.phoneNumber}
                      </td>
                      <td className="px-5 py-3.5 font-black text-slate-900 dark:text-white">
                        {formatXAF(txn.amount)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          isSuccess 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' 
                            : isPending 
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' 
                            : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                        }`}>
                          {isSuccess ? 'Paid' : isPending ? 'Pending' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                        {new Date(txn.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {isSuccess ? (
                          <button
                            onClick={() => handleOpenReceipt(txn)}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-primary-600 hover:text-white transition"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                            <span>Receipt</span>
                          </button>
                        ) : isPending ? (
                          <button
                            onClick={() => {
                              setSelectedReceipt(null)
                              setShowPaymentModal(true)
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-amber-600 transition"
                          >
                            <span>Verify</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={customAmount}
        description={customDescription}
        serviceType="dashboard_care"
        onSuccess={handlePaymentSuccess}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        receipt={selectedReceipt}
      />

    </div>
  )
}
