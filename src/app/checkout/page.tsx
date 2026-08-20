'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Heart, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Smartphone, 
  Calendar, 
  MapPin, 
  User, 
  Clock,
  Sparkles,
  PhoneCall,
  Lock
} from 'lucide-react'
import { PaymentModal } from '@/components/payments/PaymentModal'
import { ReceiptModal } from '@/components/payments/ReceiptModal'
import { PaymentReceipt } from '@/lib/payments/types'
import { formatXAF } from '@/lib/payments/helpers'

const servicesData: Record<string, { title: string; price: number; duration: string; description: string }> = {
  senior: {
    title: 'Senior & Elder Care in Cameroon',
    price: 25000,
    duration: 'Full Day / Visit',
    description: 'Vitals tracking, medication reminders, hygiene support, and continuous family updates.'
  },
  post_op: {
    title: 'Post-Operative & Wound Care',
    price: 35000,
    duration: 'Visit + Dressing',
    description: 'Sterile surgical wound dressing, catheter care, recovery milestones, and infection prevention.'
  },
  chronic: {
    title: 'Chronic Illness Management (Diabetes / BP)',
    price: 20000,
    duration: 'Weekly Monitoring',
    description: 'Blood sugar, blood pressure log, nutrition guidance, and emergency triage.'
  },
  maternal: {
    title: 'Maternal & Newborn Postpartum Care',
    price: 30000,
    duration: 'Home Visit',
    description: 'Newborn health checks, lactation assistance, mother recovery monitoring.'
  },
  doctor_consultation: {
    title: 'Hospital Doctor Consultation Pass',
    price: 10000,
    duration: 'Queue Bypass Pass',
    description: 'Direct priority consultation booking at top partner hospital with queue pass.'
  },
  quick_care: {
    title: 'On-Demand Verified Caregiver Dispatch',
    price: 15000,
    duration: 'Immediate 2-Hour Dispatch',
    description: 'Rapid match with top verified local nurse within your neighborhood.'
  }
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const serviceParam = searchParams.get('service') || searchParams.get('care') || 'senior'
  const cityParam = searchParams.get('city') || 'Douala'
  const doctorName = searchParams.get('doctor') || ''
  const customAmountParam = searchParams.get('amount')

  const serviceInfo = servicesData[serviceParam] || servicesData.senior
  const amount = customAmountParam ? parseInt(customAmountParam, 10) : serviceInfo.price

  const [patientName, setPatientName] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [address, setAddress] = useState(cityParam)
  const [notes, setNotes] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [completedReceipt, setCompletedReceipt] = useState<PaymentReceipt | null>(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)

  const handleOpenPayment = (e: React.FormEvent) => {
    e.preventDefault()
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = (receipt: PaymentReceipt) => {
    setCompletedReceipt(receipt)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary-600 transition">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-600 text-white shadow-soft">
              <Heart className="h-4 w-4 fill-white" />
            </div>
            <span className="font-display font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              CAMIHN BridgeCare Checkout
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" /> Verified
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        
        {completedReceipt ? (
          /* SUCCESS STATE AFTER PAYMENT */
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-soft-lg space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                Booking Confirmed
              </span>
              <h2 className="text-3xl font-black text-slate-950 dark:text-white">
                Payment Successfully Received!
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Your payment of <strong className="text-primary-600 dark:text-primary-400">{formatXAF(completedReceipt.totalPaid)}</strong> via {completedReceipt.provider.toUpperCase()} has been authorized and recorded.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 text-xs space-y-2 text-left border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Receipt Ref:</span>
                <span className="font-mono font-bold">{completedReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Service:</span>
                <span className="font-semibold">{completedReceipt.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Location:</span>
                <span className="font-semibold">{address}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
              <button
                onClick={() => setShowReceiptModal(true)}
                className="rounded-2xl bg-primary-600 px-6 py-3.5 text-xs font-bold text-white shadow-soft hover:bg-primary-700 transition"
              >
                View / Download Official Receipt
              </button>
              <Link
                href="/dashboard"
                className="rounded-2xl border border-slate-300 dark:border-slate-700 px-6 py-3.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Go to Care Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM */
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            
            {/* Left Column: Patient & Location Details */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-soft">
              <h2 className="text-xl font-bold text-slate-950 dark:text-white mb-1">
                Patient & Booking Details
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Please provide your contact details for caregiver matching and payment receipt.
              </p>

              <form onSubmit={handleOpenPayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Patient / Family Contact Name
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Papa Roger / Marie Claire"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Phone Number (MoMo / Orange)
                    </label>
                    <input
                      type="tel"
                      required
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="67X XXX XXX or 69X XXX XXX"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      City / Neighborhood
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Douala (Akwa / Bonapriso)"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Special Health Notes / Requirements (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Patient needs insulin administration at 8am, mobility assistance."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 text-sm font-semibold text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-primary-600 py-4 text-sm font-extrabold text-white shadow-soft-lg hover:bg-primary-700 transition flex items-center justify-center gap-2 mt-4"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Proceed to Mobile Money Payment ({formatXAF(amount)})</span>
                </button>
              </form>
            </div>

            {/* Right Column: Order Summary & Guarantee */}
            <div className="space-y-6">
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-soft">
                <h3 className="font-bold text-slate-950 dark:text-white text-base mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Selected Care Plan</span>
                </h3>

                <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-5 mb-5">
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {doctorName ? `Doctor Appointment with ${doctorName}` : serviceInfo.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {serviceInfo.description}
                  </p>
                  <span className="inline-block rounded-md bg-primary-50 dark:bg-primary-950/60 px-2.5 py-1 text-xs font-bold text-primary-700 dark:text-primary-300">
                    ⏱ Duration: {serviceInfo.duration}
                  </span>
                </div>

                {/* Price Calculation */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Base Service Fee:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatXAF(amount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Verification & Matching Fee:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">FREE (0 FCFA)</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Mobile Money Operator Fee (1%):</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatXAF(Math.round(amount * 0.01))} (Included)</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-4 border-t border-slate-200/80 dark:border-slate-800 text-sm font-bold">
                    <span className="text-slate-900 dark:text-white">Total Amount Due:</span>
                    <span className="text-2xl font-black text-primary-600 dark:text-primary-400">
                      {formatXAF(amount)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 p-4 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
                  <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" /> 100% Satisfaction Guarantee
                  </p>
                  <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-400">
                    If your matched caregiver does not meet CAMIHN clinical quality standards, you receive an immediate replacement or full refund.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Payment Processing Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={amount}
        description={doctorName ? `Doctor Appointment: ${doctorName}` : serviceInfo.title}
        serviceType={serviceParam}
        defaultPhone={patientPhone}
        defaultName={patientName}
        onSuccess={handlePaymentSuccess}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        receipt={completedReceipt}
      />

    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
