import Link from 'next/link'
import { Heart, PhoneCall, ShieldCheck, ArrowRight } from 'lucide-react'
import type { HomeCopy } from '@/lib/home-content'

const linkHrefs: Record<string, string> = {
  'Home Care': '/services/home-care',
  'Elder Support': '/services/elder-support',
  'Medical Assistance': '/services/medical-assistance',
  'How It Works': '/platform/how-it-works',
  'Safety': '/platform/safety',
  'Support': '/platform/support',
  'About': '/company/about',
  'Community': '/company/community',
  'Contact': '/company/contact',
}

export function HomeFooter({ content }: { content: HomeCopy['footer'] }) {
  return (
    <footer className="border-t border-slate-200/80 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl px-4 py-12 sm:px-6 lg:px-8 dark:border-white/10 mt-16">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.4fr]">
          
          {/* Brand Info */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-cyan-400 text-white shadow-soft">
                <Heart className="h-5 w-5 fill-white" />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-slate-950 dark:text-white">BridgeCare</p>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-600 dark:text-primary-400">
                  Cameroon Home Health
                </p>
              </div>
            </div>
            <p className="max-w-md text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {content.description}
            </p>
            <div className="rounded-2xl border border-red-200/80 dark:border-red-900/40 bg-red-50/70 dark:bg-red-950/30 p-3.5 text-xs text-red-700 dark:text-red-300 font-medium shadow-xs">
              {content.emergencyNotice}
            </div>
          </div>

          {/* Interactive Button Columns */}
          <div className="grid gap-6 sm:grid-cols-3">
            {content.columns.map((column) => (
              <div key={column.title} className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 px-1">
                  {column.title}
                </h3>
                <div className="flex flex-col gap-2">
                  {column.links.map((link) => {
                    const href = linkHrefs[link] || '#'

                    return (
                      <Link
                        key={link}
                        href={href}
                        target="_self"
                        className="group flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-white/70 px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-soft-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-400 hover:bg-white hover:text-primary-600 hover:shadow-soft active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-primary-500 dark:hover:bg-slate-800 dark:hover:text-primary-400"
                      >
                        <span>{link}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary-500" />
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="border-t border-slate-200/60 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} BridgeCare Cameroon. Built with ❤️ for our parents, families, and healthcare workers.</p>
          <div className="flex items-center gap-4">
            <a href="tel:+237671159461" target="_self" className="hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1.5 font-bold transition">
              <PhoneCall className="h-3.5 w-3.5 text-primary-500" /> (+237) 671 159 461
            </a>
            <span>•</span>
            <span className="font-medium">Douala · Yaoundé · Buea</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
