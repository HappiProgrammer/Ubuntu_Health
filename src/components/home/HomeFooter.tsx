import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import type { HomeCopy } from '@/lib/home-content'

export function HomeFooter({ content }: { content: HomeCopy['footer'] }) {
  return (
    <footer className="border-t border-white/50 px-4 py-10 sm:px-6 lg:px-8 dark:border-white/10">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl text-slate-950 dark:text-white">BridgeCare</p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Care platform</p>
            </div>
          </div>
          <p className="max-w-md text-slate-600 dark:text-slate-300">{content.description}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {content.columns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                {column.title}
              </h3>
              <div className="space-y-2">
                {column.links.map((link) => (
                  <Link key={link} href="#" className="block text-sm text-slate-700 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
                    {link}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
