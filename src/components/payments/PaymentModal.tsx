'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  X, 
  ShieldCheck, 
  Smartphone, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Loader2, 
  Sparkles,
  PhoneCall,
  Lock,
  ArrowDownRight,
  Receipt
} from 'lucide-react'
import { PaymentProvider, PaymentReceipt } from '@/lib/payments/types'
import { detectCarrier, formatCameroonPhone, validateCameroonPhone, formatXAF } from '@/lib/payments/helpers'
import { MERCHANT_ACCOUNT } from '@/lib/payments/config'
import { ReceiptModal } from './ReceiptModal'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  description: string
  serviceType?: string
  defaultPhone?: string
  defaultName?: string
  onSuccess?: (receipt: PaymentReceipt) => void
}

export function PaymentModal({
  isOpen,
  onClose,
  amount,
  description,
  serviceType = 'general_care',
  defaultPhone = '',
  defaultName = '',
  onSuccess
}: PaymentModalProps) {
  const [provider, setProvider] = useState<PaymentProvider>('mtn')
  const [phone, setPhone] = useState(defaultPhone)
  const [name, setName] = useState(defaultName)
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'input' | 'processing' | 'waiting_pin' | 'success' | 'failed'>('input')
  const [errorMessage, setErrorMessage] = useState('')
  const [validationError, setValidationError] = useState('')
  const [transactionId, setTransactionId] = useState<string>('')
  const [countdown, setCountdown] = useState<number>(120)
  const [validationCode, setValidationCode] = useState<string>('')
  const [isValidating, setIsValidating] = useState<boolean>(false)
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null)
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false)

  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-carrier detection on phone change
  const handlePhoneChange = (val: string) => {
    setPhone(val)
    const detected = detectCarrier(val)
    if (detected) {
      setProvider(detected)
    }
  }

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  if (!isOpen) return null

  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setValidationError('')

    if (!validateCameroonPhone(phone)) {
      setErrorMessage('Please enter a valid 9-digit Cameroon phone number (e.g. 677 123 456 or 699 123 456)')
      return
    }

    if (amount < 100) {
      setErrorMessage('Minimum payment is 100 FCFA')
      return
    }

    setStep('processing')

    try {
      const formattedPhone = formatCameroonPhone(phone)
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          amount,
          currency: 'XAF',
          phoneNumber: formattedPhone,
          receiverPhone: MERCHANT_ACCOUNT.phone,
          payerName: name || 'Valued Patient',
          payerEmail: email || undefined,
          description,
          serviceType
        })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Payment initiation failed')
        setStep('failed')
        return
      }

      setTransactionId(data.transactionId)
      setStep('waiting_pin')
      setCountdown(120)

      // Start countdown timer for user guidance
      if (countdownRef.current) clearInterval(countdownRef.current)
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // Polling checks status, but strictly waits for validation
      startPolling(data.transactionId)
    } catch (err: any) {
      console.error(err)
      setErrorMessage(err.message || 'Network error initiating payment')
      setStep('failed')
    }
  }

  const startPolling = (txnId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current)

    let attempts = 0
    pollingRef.current = setInterval(async () => {
      attempts++
      try {
        const res = await fetch(`/api/payments/status?id=${txnId}`)
        const data = await res.json()

        // Only transition if backend confirms transaction is successful (after validation or live callback)
        if (data.success && data.status === 'successful') {
          if (pollingRef.current) clearInterval(pollingRef.current)
          if (countdownRef.current) clearInterval(countdownRef.current)

          setReceipt(data.receipt)
          setStep('success')
          if (onSuccess && data.receipt) {
            onSuccess(data.receipt)
          }
        } else if (data.status === 'failed') {
          if (pollingRef.current) clearInterval(pollingRef.current)
          if (countdownRef.current) clearInterval(countdownRef.current)
          setErrorMessage(data.failureReason || 'Payment declined or cancelled on phone')
          setStep('failed')
        }
      } catch (err) {
        console.error('Polling error:', err)
      }

      if (attempts >= 40) {
        if (pollingRef.current) clearInterval(pollingRef.current)
      }
    }, 3000)
  }

  // Mandatory sender payment validation before success popup
  const handleValidatePayment = async () => {
    setValidationError('')
    setIsValidating(true)

    try {
      const res = await fetch('/api/payments/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          validationCode: validationCode.trim() || undefined
        })
      })

      const data = await res.json()

      if (data.success && data.status === 'successful') {
        if (pollingRef.current) clearInterval(pollingRef.current)
        if (countdownRef.current) clearInterval(countdownRef.current)

        setReceipt(data.receipt)
        setStep('success')
        if (onSuccess && data.receipt) {
          onSuccess(data.receipt)
        }
      } else {
        setValidationError(data.message || 'Payment not yet confirmed on your phone. Please approve the prompt and try again.')
      }
    } catch (err: any) {
      console.error('Validation error:', err)
      setValidationError('Network error validating payment. Please check your connection and try again.')
    } finally {
      setIsValidating(false)
    }
  }

  const handleRetry = () => {
    setStep('input')
    setErrorMessage('')
    setValidationError('')
    setValidationCode('')
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
        <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-cyan-500 text-white shadow-soft">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Mobile Money Checkout</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">MTN MoMo & Orange Money Cameroon</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 sm:p-8">
            
            {/* STEP 1: FORM INPUT */}
            {step === 'input' && (
              <form onSubmit={handleStartPayment} className="space-y-5">
                
                {/* Official Linked Merchant Account Badge */}
                <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-primary-500/10 to-emerald-500/10 dark:from-amber-950/20 dark:to-emerald-950/20 p-3.5 border border-amber-500/30 dark:border-amber-400/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-sm">
                      MoMo
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Linked Receiving Account
                      </span>
                      <p className="text-sm font-black text-slate-950 dark:text-white font-mono tracking-wide">
                        {MERCHANT_ACCOUNT.phone}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {MERCHANT_ACCOUNT.businessName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Verified Payee
                    </span>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200/70 dark:border-slate-700/60">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    <span>Service:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{description}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Amount Due:</span>
                    <span className="text-2xl font-black text-primary-600 dark:text-primary-400">{formatXAF(amount)}</span>
                  </div>
                </div>

                {/* Provider Selector Tabs */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Select Payment Network
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* MTN MoMo Button */}
                    <button
                      type="button"
                      onClick={() => setProvider('mtn')}
                      className={`relative flex flex-col items-center justify-center rounded-2xl p-4 border-2 transition-all ${
                        provider === 'mtn'
                          ? 'border-amber-400 bg-amber-50/60 dark:bg-amber-950/30 shadow-md'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-sm mb-1.5">
                        MoMo
                      </div>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">MTN MoMo</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">67x, 68x, 650-654</span>
                      {provider === 'mtn' && (
                        <div className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-amber-500" />
                      )}
                    </button>

                    {/* Orange Money Button */}
                    <button
                      type="button"
                      onClick={() => setProvider('orange')}
                      className={`relative flex flex-col items-center justify-center rounded-2xl p-4 border-2 transition-all ${
                        provider === 'orange'
                          ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-950/30 shadow-md'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white font-black text-xs shadow-sm mb-1.5">
                        OM
                      </div>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">Orange Money</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">69x, 655-659</span>
                      {provider === 'orange' && (
                        <div className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-orange-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Sender Phone Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Your {provider === 'mtn' ? 'MTN MoMo' : 'Orange Money'} Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      🇨🇲 +237
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="67X XXX XXX or 69X XXX XXX"
                      required
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 pl-20 pr-4 text-sm font-semibold text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    A secure push prompt will be sent to this phone to transfer to <strong>{MERCHANT_ACCOUNT.phone}</strong>.
                  </p>
                </div>

                {/* Payer Name (Optional) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Full Name (for Official Receipt)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jean-Paul Mbarga"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 p-3 text-xs font-medium text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  className={`w-full rounded-2xl py-4 text-sm font-black shadow-soft-lg flex items-center justify-center gap-2 transition ${
                    provider === 'mtn'
                      ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  <Lock className="h-4 w-4" />
                  <span>Send {formatXAF(amount)} to {MERCHANT_ACCOUNT.phone}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Direct Encrypted Mobile Money Escrow Transfer</span>
                </div>
              </form>
            )}

            {/* STEP 2: PROCESSING INITIATION */}
            {step === 'processing' && (
              <div className="py-12 text-center space-y-4">
                <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Connecting to {provider.toUpperCase()} Gateway...</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Initiating payment request from <strong>{phone}</strong> to merchant <strong>{MERCHANT_ACCOUNT.phone}</strong>.
                </p>
              </div>
            )}

            {/* STEP 3: WAITING FOR PIN & MANDATORY SENDER VALIDATION */}
            {step === 'waiting_pin' && (
              <div className="py-4 text-center space-y-5 animate-fade-in">
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 dark:bg-slate-800 border-2 border-primary-500 shadow-soft">
                  <Smartphone className="h-8 w-8 text-primary-600 dark:text-primary-400 animate-bounce" />
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Approve Prompt on Your Phone
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                    A push authorization request for <strong className="text-primary-600 dark:text-primary-400">{formatXAF(amount)}</strong> has been sent to <strong className="font-mono">{phone}</strong>.
                  </p>
                </div>

                {/* Transfer Route Overview */}
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 p-3 text-xs border border-slate-200 dark:border-slate-700/60 flex items-center justify-between font-mono">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">From (Sender):</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{phone}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 mx-2" />
                  <div className="text-right">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-sans font-bold">To (Merchant):</span>
                    <p className="font-bold text-amber-600 dark:text-amber-400">{MERCHANT_ACCOUNT.phone}</p>
                  </div>
                </div>

                {/* Visual USSD Instructions */}
                <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 p-4 text-left space-y-2">
                  <p className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <span>{provider === 'mtn' ? 'MTN MoMo Confirmation:' : 'Orange Money Confirmation:'}</span>
                  </p>
                  <ol className="list-decimal list-inside text-xs text-amber-800 dark:text-amber-400 space-y-1">
                    <li>Approve popup or dial <strong>{provider === 'mtn' ? '*126#' : '#150*50#'}</strong> on your phone</li>
                    <li>Enter your secret <strong>PIN</strong> to authorize transfer to <strong>{MERCHANT_ACCOUNT.phone}</strong></li>
                    <li>Then click <strong>&quot;Validate Payment&quot;</strong> below to confirm</li>
                  </ol>
                </div>

                {/* MANDATORY VALIDATION FORM */}
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/90 border-2 border-primary-500/40 p-4 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
                      <Lock className="h-3.5 w-3.5 text-primary-500" />
                      <span>Step 2: Validate Payment</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {transactionId.substring(0, 12)}...</span>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={validationCode}
                      onChange={(e) => setValidationCode(e.target.value)}
                      placeholder="Carrier Txn Reference or Authorization Code (Optional)"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Once you enter your PIN on your phone, click below to validate. Success message will only show after validation.
                    </p>
                  </div>

                  {validationError && (
                    <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 p-2.5 text-xs font-medium text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleValidatePayment}
                    disabled={isValidating}
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-3.5 px-4 text-xs font-black text-white shadow-soft flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Validating Transfer to {MERCHANT_ACCOUNT.phone}...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>I Have Approved on Phone — Validate Now</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Countdown display */}
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-1">
                  <Clock className="h-3.5 w-3.5 animate-spin" />
                  <span>Session valid for {countdown} seconds</span>
                </div>
              </div>
            )}

            {/* STEP 4: SUCCESS (ONLY AFTER VALIDATION) */}
            {step === 'success' && (
              <div className="py-6 text-center space-y-6 animate-fade-in">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-500 shadow-soft-lg">
                  <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Payment Validated &amp; Received
                  </span>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                    {formatXAF(amount)} Confirmed
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                    Successfully transferred to merchant <strong>{MERCHANT_ACCOUNT.phone}</strong>. Your healthcare request is confirmed.
                  </p>
                </div>

                {/* Quick Receipt Summary Box */}
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 text-xs space-y-2 text-left border border-slate-200/80 dark:border-slate-700/60">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Merchant Recipient:</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{MERCHANT_ACCOUNT.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Sender Phone:</span>
                    <span className="font-mono font-semibold">{phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Transaction ID:</span>
                    <span className="font-mono text-[11px]">{receipt?.transactionId || transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Status:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">VALIDATED &amp; CONFIRMED</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReceiptModal(true)}
                    className="flex-1 rounded-2xl bg-primary-600 py-3.5 text-xs font-bold text-white shadow-soft hover:bg-primary-700 transition flex items-center justify-center gap-1.5"
                  >
                    <Receipt className="h-4 w-4" />
                    <span>View &amp; Print Official Receipt</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-2xl border border-slate-300 dark:border-slate-700 py-3.5 px-6 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: FAILED */}
            {step === 'failed' && (
              <div className="py-6 text-center space-y-6 animate-fade-in">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-100 dark:bg-red-950/60 border-2 border-red-500 shadow-soft-lg">
                  <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                    Payment Could Not Be Completed
                  </h4>
                  <p className="text-xs text-red-600 dark:text-red-400 max-w-sm mx-auto">
                    {errorMessage || 'The payment request timed out or was declined on your phone.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="flex-1 rounded-2xl bg-primary-600 py-3.5 text-xs font-bold text-white shadow-soft hover:bg-primary-700 transition"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-2xl border border-slate-300 dark:border-slate-700 py-3.5 px-6 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Official Receipt Sub-Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        receipt={receipt}
      />
    </>
  )
}
