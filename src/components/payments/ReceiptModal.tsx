'use client'

import React, { useRef } from 'react'
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Heart, 
  Calendar, 
  Phone, 
  CreditCard,
  Building2,
  Share2
} from 'lucide-react'
import { PaymentReceipt } from '@/lib/payments/types'
import { formatXAF } from '@/lib/payments/helpers'

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  receipt: PaymentReceipt | null
}

export function ReceiptModal({ isOpen, onClose, receipt }: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null)

  if (!isOpen || !receipt) return null

  const handlePrint = () => {
    window.print()
  }

  const isMtn = receipt.provider === 'mtn'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
              <Heart className="h-5 w-5 fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Official Payment Receipt</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{receipt.receiptNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div ref={printRef} className="p-6 sm:p-8 space-y-6">
          {/* Status Banner */}
          <div className="flex items-center justify-between rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="font-extrabold text-emerald-900 dark:text-emerald-300 text-sm">PAYMENT CONFIRMED</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">Processed via Cameroon Mobile Money</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              isMtn 
                ? 'bg-amber-400 text-slate-950' 
                : 'bg-orange-500 text-white'
            }`}>
              {isMtn ? 'MTN MoMo' : 'Orange Money'}
            </div>
          </div>

          {/* Amount Paid Box */}
          <div className="text-center py-4 border-y border-dashed border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Paid</span>
            <div className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white mt-1">
              {formatXAF(receipt.totalPaid)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Zero extra booking surcharges</p>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Service / Reason:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-right">{receipt.description}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Payer Name:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{receipt.payerName}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Payer Phone:</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{receipt.phoneNumber}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Date & Time:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {new Date(receipt.paidAt).toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Transaction Ref:</span>
              <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">{receipt.transactionId}</span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 dark:text-slate-400">Platform & Operator Fee (1%):</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{formatXAF(receipt.fee)} (Included)</span>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 flex items-center gap-3 border border-slate-200/60 dark:border-slate-700/60">
            <ShieldCheck className="h-5 w-5 text-primary-600 dark:text-primary-400 shrink-0" />
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              Verified by CAMIHN (Cameroon Innovative Health Network). Caregiver will be dispatched to your coordinates upon confirmation.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between border-t border-slate-200/80 px-6 py-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-primary-700 transition"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save Receipt</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
