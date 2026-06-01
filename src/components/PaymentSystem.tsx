'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { momoService } from '@/services/momoApi'
import { CreditCard, Smartphone, Banknote, Check, Clock, AlertCircle, DollarSign, TrendingUp, Receipt, Phone, Download, ExternalLink } from 'lucide-react'

interface Payment {
  id: string
  match_id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_method: 'momo' | 'cash' | 'bank'
  transaction_id: string | null
  momo_phone: string | null
  sender_phone: string | null
  receiver_phone: string | null
  momo_provider: 'mtn' | 'orange' | null
  receipt: any | null
  created_at: string
  completed_at: string | null
}

interface PaymentSystemProps {
  userId: string
  userRole: 'nurse' | 'client'
}

export default function PaymentSystem({ userId, userRole }: PaymentSystemProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null)
  const [selectedMatch, setSelectedMatch] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'cash' | 'bank'>('momo')
  const [momoPhone, setMomoPhone] = useState('')
  const [senderPhone, setSenderPhone] = useState('')
  const [receiverPhone, setReceiverPhone] = useState('')
  const [momoProvider, setMomoProvider] = useState<'mtn' | 'orange'>('mtn')
  const [processing, setProcessing] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const isMockMode = (supabase as any).isMockMode

  useEffect(() => {
    loadPayments()
  }, [userId])

  const loadPayments = async () => {
    try {
      if (isMockMode) {
        // ... (keep existing mock for now but improve it)
        const storedPayments = localStorage.getItem('mock_payments')
        if (storedPayments) {
          setPayments(JSON.parse(storedPayments))
        } else {
          const initialPayments: Payment[] = [
            {
              id: 'pay1',
              match_id: 'match1',
              amount: 25000,
              currency: 'XAF',
              status: 'completed',
              payment_method: 'momo',
              transaction_id: 'TXN123456',
              momo_phone: '+237 677 123 456',
              sender_phone: '+237 677 123 456',
              receiver_phone: '+237 699 789 012',
              momo_provider: 'mtn',
              receipt: null,
              created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
              completed_at: new Date(Date.now() - 86400000).toISOString()
            }
          ]
          setPayments(initialPayments)
          localStorage.setItem('mock_payments', JSON.stringify(initialPayments))
        }
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          match:matches(
            id,
            care_request:care_requests(client_id),
            nurse_id
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Filter based on user role (though RLS should handle this, let's be safe)
      const filteredPayments = data.filter((p: any) => 
        p.match?.care_request?.client_id === userId || p.match?.nurse_id === userId
      )

      setPayments(filteredPayments || [])
    } catch (error) {
      console.error('Error loading payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!selectedMatch || amount <= 0) {
      alert('Please fill in all required fields')
      return
    }

    if (paymentMethod === 'momo') {
      if (!senderPhone || !receiverPhone) {
        setPhoneError('Both sender and receiver phone numbers are required')
        return
      }
      
      if (!momoService.validatePhoneNumber(senderPhone)) {
        setPhoneError('Invalid sender phone number format. Use +237 6XX XXX XXX')
        return
      }
    }

    setPhoneError('')
    setProcessing(true)
    try {
      let transactionResult: any = null
      let receipt: any = null

      if (paymentMethod === 'momo') {
        transactionResult = await momoService.requestPayment({
          amount,
          currency: 'XAF',
          senderPhone: momoService.formatPhoneNumber(senderPhone),
          receiverPhone: momoService.formatPhoneNumber(receiverPhone),
          description: `CareTaker Service Match: ${selectedMatch}`,
          provider: momoProvider
        })

        // Simulate waiting for payment confirmation
        await new Promise(resolve => setTimeout(resolve, 2000))
        const status = await momoService.checkPaymentStatus(transactionResult.transactionId, momoProvider)
        
        if (status.status === 'success') {
          receipt = momoService.generateReceipt(status)
        }
      }

      const paymentData = {
        id: crypto.randomUUID(),
        match_id: selectedMatch,
        amount: amount,
        currency: 'XAF',
        payment_method: paymentMethod,
        momo_phone: paymentMethod === 'momo' ? senderPhone : null,
        transaction_id: transactionResult?.transactionId || (paymentMethod === 'momo' ? `TXN${Date.now()}` : null),
        status: (paymentMethod === 'momo' && receipt) || paymentMethod === 'bank' ? 'completed' : 'pending',
        completed_at: (paymentMethod === 'momo' && receipt) || paymentMethod === 'bank' ? new Date().toISOString() : null
      }

      if (isMockMode) {
        const updatedPayments = [{ ...paymentData, created_at: new Date().toISOString(), receipt }, ...payments]
        setPayments(updatedPayments as Payment[])
        localStorage.setItem('mock_payments', JSON.stringify(updatedPayments))
        setShowPaymentModal(false)
        resetForm()
        if (receipt) {
          setSelectedReceipt(receipt)
          setShowReceiptModal(true)
        }
        return
      }

      const { error } = await supabase
        .from('payments')
        .insert(paymentData)

      if (error) throw error

      await loadPayments()
      setShowPaymentModal(false)
      resetForm()
      
      if (receipt) {
        setSelectedReceipt(receipt)
        setShowReceiptModal(true)
      } else {
        alert('Payment request submitted!')
      }
    } catch (error: any) {
      console.error('Error processing payment:', error)
      alert(error.message || 'Failed to process payment')
    } finally {
      setProcessing(false)
    }
  }

  const resetForm = () => {
    setSelectedMatch('')
    setAmount(0)
    setPaymentMethod('momo')
    setMomoPhone('')
    setSenderPhone('')
    setReceiverPhone('')
    setMomoProvider('mtn')
    setPhoneError('')
  }

  const handleViewReceipt = (payment: Payment) => {
    if (payment.receipt) {
      setSelectedReceipt(payment.receipt)
      setShowReceiptModal(true)
    }
  }

  const totalEarnings = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingPayments = payments.filter(p => p.status === 'pending')
  const completedPayments = payments.filter(p => p.status === 'completed')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading payments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 translate-y-24 -translate-x-24"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black text-white mb-2">Payment Dashboard</h2>
              <p className="text-white/80 text-sm">Manage your transactions and earnings</p>
            </div>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="group bg-white text-blue-600 px-6 py-3 font-bold hover:bg-gray-50 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <DollarSign className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span>New Payment</span>
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-white/20 p-2">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-bold bg-green-400/20 text-green-100 px-3 py-1">Total</span>
              </div>
              <p className="text-3xl font-black text-white mb-1">XAF {totalEarnings.toLocaleString()}</p>
              <p className="text-xs text-white/70">{completedPayments.length} completed</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-white/20 p-2">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-bold bg-yellow-400/20 text-yellow-100 px-3 py-1">Pending</span>
              </div>
              <p className="text-3xl font-black text-white mb-1">{pendingPayments.length}</p>
              <p className="text-xs text-white/70">Awaiting confirmation</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-white/20 p-2">
                  <Receipt className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-bold bg-blue-400/20 text-blue-100 px-3 py-1">Monthly</span>
              </div>
              <p className="text-3xl font-black text-white mb-1">
                XAF {payments
                  .filter(p => {
                    const date = new Date(p.created_at)
                    const now = new Date()
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                  })
                  .reduce((sum, p) => sum + p.amount, 0)
                  .toLocaleString()}
              </p>
              <p className="text-xs text-white/70">This month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Section */}
      <div className="bg-white shadow-xl overflow-hidden border-2 border-gray-200">
        <div className="bg-gray-50 px-8 py-6 border-b-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Transaction History</h3>
                <p className="text-xs text-gray-500 mt-0.5">{payments.length} total transactions</p>
              </div>
            </div>
          </div>
        </div>
        {payments.length === 0 ? (
          <div className="p-16 text-center">
            <div className="bg-gray-100 w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <DollarSign className="h-12 w-12 text-gray-400" />
            </div>
            <p className="text-gray-700 font-bold text-lg mb-2">No transactions yet</p>
            <p className="text-sm text-gray-500">Your payment history will appear here</p>
          </div>
        ) : (
          <div className="divide-y-2 divide-gray-200">
            {payments.map((payment, index) => (
              <div key={payment.id} className="group p-6 hover:bg-gray-50 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`relative p-4 shadow-sm group-hover:shadow-md transition-all duration-300 ${
                      payment.status === 'completed' ? 'bg-green-50' :
                      payment.status === 'pending' ? 'bg-yellow-50' :
                      'bg-red-50'
                    }`}>
                      {payment.payment_method === 'momo' ? (
                        <Smartphone className={`h-6 w-6 ${
                          payment.status === 'completed' ? 'text-green-600' :
                          payment.status === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }`} />
                      ) : payment.payment_method === 'bank' ? (
                        <Banknote className={`h-6 w-6 ${
                          payment.status === 'completed' ? 'text-green-600' :
                          payment.status === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }`} />
                      ) : (
                        <CreditCard className={`h-6 w-6 ${
                          payment.status === 'completed' ? 'text-green-600' :
                          payment.status === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }`} />
                      )}
                      {payment.status === 'completed' && (
                        <div className="absolute -top-1 -right-1 bg-green-500 p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <p className="text-2xl font-black text-gray-900">
                          XAF {payment.amount.toLocaleString()}
                        </p>
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <p className="text-gray-600 font-medium">
                          {payment.payment_method === 'momo' ? '📱 Mobile Money' : 
                           payment.payment_method === 'bank' ? '🏦 Bank Transfer' : '💵 Cash Payment'}
                        </p>
                        {payment.momo_provider && (
                          <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1">
                            {payment.momo_provider === 'mtn' ? 'MTN' : 'Orange'}
                          </span>
                        )}
                        {payment.sender_phone && (
                          <p className="text-xs text-gray-500 font-mono">
                            From: {payment.sender_phone}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2 flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(payment.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {payment.transaction_id && (
                      <div className="text-right">
                        <p className="text-xs text-gray-400 mb-1">TXN ID</p>
                        <p className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1">
                          {payment.transaction_id}
                        </p>
                      </div>
                    )}
                    {payment.receipt && (
                      <button
                        onClick={() => handleViewReceipt(payment)}
                        className="flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-2"
                      >
                        <Receipt className="h-3 w-3" />
                        <span>View Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-gray-200 animate-slideUp">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-white mb-1">New Payment</h3>
                <p className="text-sm text-white/80">Complete your transaction securely</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Amount Input */}
              <div className="bg-gray-50 p-4 border-2 border-gray-200">
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                  Payment Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-400">
                    XAF
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-16 pr-4 py-4 text-2xl font-black border-2 border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                    placeholder="0"
                    min="1000"
                  />
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'momo' as const, label: 'Mobile Money', icon: Smartphone, emoji: '📱' },
                    { value: 'cash' as const, label: 'Cash', icon: CreditCard, emoji: '💵' },
                    { value: 'bank' as const, label: 'Bank', icon: Banknote, emoji: '🏦' }
                  ].map(method => (
                    <button
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value)}
                      className={`relative p-4 border-2 transition-all duration-300 transform hover:scale-105 ${
                        paymentMethod === method.value
                          ? 'border-blue-600 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{method.emoji}</div>
                      <method.icon className={`h-5 w-5 mx-auto mb-1 ${
                        paymentMethod === method.value ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <p className={`text-xs font-bold ${
                        paymentMethod === method.value ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {method.label}
                      </p>
                      {paymentMethod === method.value && (
                        <div className="absolute -top-2 -right-2 bg-blue-600 p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Money Provider & Phone Numbers */}
              {paymentMethod === 'momo' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Provider Selection */}
                  <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-700/50 dark:to-slate-700/30 p-4 rounded-2xl border border-slate-200 dark:border-slate-600">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wide">
                      Select Provider
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setMomoProvider('mtn')}
                        className={`relative p-4 border-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                          momoProvider === 'mtn'
                            ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 shadow-lg'
                            : 'border-slate-200 dark:border-slate-700 hover:border-yellow-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">🟡</div>
                        <p className={`text-sm font-black ${momoProvider === 'mtn' ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          MTN MoMo
                        </p>
                        {momoProvider === 'mtn' && (
                          <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                      <button
                        onClick={() => setMomoProvider('orange')}
                        className={`relative p-4 border-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                          momoProvider === 'orange'
                            ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 shadow-lg'
                            : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">🟠</div>
                        <p className={`text-sm font-black ${momoProvider === 'orange' ? 'text-orange-600 dark:text-orange-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          Orange Money
                        </p>
                        {momoProvider === 'orange' && (
                          <div className="absolute -top-2 -right-2 bg-orange-500 rounded-full p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sender Phone */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-2xl border border-blue-200 dark:border-blue-800">
                    <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 mb-2 uppercase tracking-wide">
                      👤 Sender Phone (Payer)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500 dark:text-blue-400" />
                      <input
                        type="tel"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-2 border-blue-200 dark:border-blue-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all font-mono"
                        placeholder="+237 677 123 456"
                      />
                    </div>
                  </div>

                  {/* Receiver Phone */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-2xl border border-green-200 dark:border-green-800">
                    <label className="block text-xs font-bold text-green-700 dark:text-green-300 mb-2 uppercase tracking-wide">
                      🏪 Receiver Phone (Merchant)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500 dark:text-green-400" />
                      <input
                        type="tel"
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-2 border-green-200 dark:border-green-700 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 dark:bg-slate-900 dark:text-white transition-all font-mono"
                        placeholder="+237 699 789 012"
                      />
                    </div>
                  </div>

                  {phoneError && (
                    <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800 animate-shake">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <span className="text-sm text-red-700 dark:text-red-300 font-medium">{phoneError}</span>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start space-x-2">
                      <span className="text-lg">💡</span>
                      <span className="font-medium">A payment request will be sent to the sender's phone. They will receive a USSD prompt to approve the transaction.</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Match ID */}
              <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-700/50 dark:to-slate-700/30 p-4 rounded-2xl border border-slate-200 dark:border-slate-600">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
                  Match/Service ID
                </label>
                <input
                  type="text"
                  value={selectedMatch}
                  onChange={(e) => setSelectedMatch(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:bg-slate-900 dark:text-white transition-all font-mono"
                  placeholder="Enter match or service ID"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 rounded-b-3xl">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-4 border-2 border-slate-300 dark:border-slate-600 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={processing || !amount || !selectedMatch}
                  className="flex-1 px-4 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      <span>Confirm Payment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Receipt Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Receipt className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Payment Receipt</h3>
                    <p className="text-sm opacity-90">Transaction Completed</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowReceiptModal(false)
                    setSelectedReceipt(null)
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Receipt Content */}
            <div className="p-6 space-y-4">
              {/* Success Badge */}
              <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <span className="text-lg font-bold text-green-700 dark:text-green-300">
                    Payment Successful
                  </span>
                </div>
              </div>

              {/* Receipt Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Receipt ID</span>
                  <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                    {selectedReceipt.receiptId}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Transaction ID</span>
                  <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                    {selectedReceipt.transactionId}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Amount</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    XAF {selectedReceipt.amount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Service Fee (1%)</span>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">
                    - XAF {selectedReceipt.fee.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 bg-green-50 dark:bg-green-900/20 px-4 rounded-lg">
                  <span className="text-base font-bold text-slate-900 dark:text-white">Net Amount</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    XAF {selectedReceipt.netAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Provider</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white uppercase">
                    {selectedReceipt.provider === 'mtn' ? 'MTN MoMo' : 'Orange Money'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Sender</span>
                  <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                    {selectedReceipt.senderPhone}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Receiver</span>
                  <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                    {selectedReceipt.receiverPhone}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Date & Time</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {new Date(selectedReceipt.timestamp).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Reference</span>
                  <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                    {selectedReceipt.reference}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    // Download receipt as text file
                    const receiptText = `
PAYMENT RECEIPT
===============
Receipt ID: ${selectedReceipt.receiptId}
Transaction ID: ${selectedReceipt.transactionId}
Amount: XAF ${selectedReceipt.amount.toLocaleString()}
Service Fee: XAF ${selectedReceipt.fee.toLocaleString()}
Net Amount: XAF ${selectedReceipt.netAmount.toLocaleString()}
Provider: ${selectedReceipt.provider.toUpperCase()}
Sender: ${selectedReceipt.senderPhone}
Receiver: ${selectedReceipt.receiverPhone}
Date: ${new Date(selectedReceipt.timestamp).toLocaleString()}
Reference: ${selectedReceipt.reference}
Status: ${selectedReceipt.status.toUpperCase()}
                    `.trim()
                    
                    const blob = new Blob([receiptText], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `receipt_${selectedReceipt.receiptId}.txt`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 border-2 border-primary-600 text-primary-600 rounded-xl font-bold hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => {
                    setShowReceiptModal(false)
                    setSelectedReceipt(null)
                  }}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
