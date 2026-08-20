'use client'

import React, { useState } from 'react'
import { PhoneCall, MessageCircle, X, Sparkles, ShieldCheck, Heart } from 'lucide-react'

export function FloatingSupportWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Expanded Quick Support Menu */}
      {isOpen && (
        <div className="w-72 rounded-3xl border border-white/80 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 p-5 shadow-2xl backdrop-blur-2xl animate-slide-up space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-soft">
                <Heart className="h-4 w-4 fill-white" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-xs">BridgeCare Support</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Online in Cameroon</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Need help matching with a nurse or paying via MoMo? Talk directly with a Cameroonian care coordinator.
          </p>

          <div className="space-y-2">
            <a
              href="tel:+237671159461"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 py-2.5 px-4 text-xs font-black text-white shadow-soft hover:brightness-110 active:scale-95 transition"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              <span>Call Emergency Hotline (+237)</span>
            </a>

            <a
              href="https://wa.me/237671159461?text=Hello%20BridgeCare,%20I%20need%20assistance%20booking%20care%20for%20my%20family."
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 px-4 text-xs font-extrabold text-white shadow-soft hover:bg-emerald-700 active:scale-95 transition"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>WhatsApp Coordinator</span>
            </a>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 pt-1">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            <span>24/7 Human Assistance Guarantee</span>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 via-sky-500 to-emerald-500 text-white shadow-glow-cyan transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Contact Support"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
        </span>
        {isOpen ? <X className="h-6 w-6" /> : <PhoneCall className="h-6 w-6" />}
      </button>
    </div>
  )
}
