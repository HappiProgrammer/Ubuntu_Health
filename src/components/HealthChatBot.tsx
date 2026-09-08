'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  MessageCircle, X, Send, Sparkles, Heart, PhoneCall,
  Minimize2, Maximize2, RotateCcw, ChevronRight,
  AlertTriangle, ExternalLink, Loader2
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ChatAction {
  label: string
  url: string
  type: 'primary' | 'secondary' | 'danger'
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  quickReplies?: string[]
  actions?: ChatAction[]
  isTyping?: boolean
}

// ─── Markdown-lite renderer ────────────────────────────────────────────────────
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Table row
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      const isSep = cells.every(c => /^[\s\-:]+$/.test(c))
      if (!isSep) {
        elements.push(
          <div key={key++} className="flex gap-2 text-xs py-0.5 border-b border-slate-200/60 dark:border-slate-700/60">
            {cells.map((cell, ci) => (
              <span key={ci} className="flex-1">{renderInline(cell.trim())}</span>
            ))}
          </div>
        )
      }
      continue
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={key++} className="border-slate-200 dark:border-slate-700 my-1" />)
      continue
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={key++} className="h-1.5" />)
      continue
    }

    elements.push(
      <div key={key++} className="leading-relaxed">
        {renderInline(line)}
      </div>
    )
  }

  return <>{elements}</>
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let remaining = text
  let k = 0

  // Bold **text**
  const boldRe = /\*\*(.+?)\*\*/g
  // Inline code `text`
  const codeRe = /`(.+?)`/g
  // Escape \* or \#
  const escRe = /\\([*#_`])/g

  // Process all patterns
  const tokens: Array<{ index: number; length: number; node: React.ReactNode }> = []

  let m: RegExpExecArray | null
  const tmpBold = new RegExp(boldRe.source, 'g')
  while ((m = tmpBold.exec(text)) !== null) {
    tokens.push({ index: m.index, length: m[0].length, node: <strong key={`b${k++}`} className="font-bold">{m[1]}</strong> })
  }
  const tmpCode = new RegExp(codeRe.source, 'g')
  while ((m = tmpCode.exec(text)) !== null) {
    tokens.push({ index: m.index, length: m[0].length, node: <code key={`c${k++}`} className="bg-slate-100 dark:bg-slate-800 rounded px-1 text-[11px] font-mono">{m[1]}</code> })
  }

  tokens.sort((a, b) => a.index - b.index)

  let cursor = 0
  for (const token of tokens) {
    if (token.index < cursor) continue
    if (token.index > cursor) parts.push(text.slice(cursor, token.index))
    parts.push(token.node)
    cursor = token.index + token.length
  }
  if (cursor < text.length) parts.push(text.slice(cursor))

  // Handle escaped chars in plain text segments
  return parts.length === 0 ? text : <>{parts}</>
}

// ─── Action Button ─────────────────────────────────────────────────────────────
function ActionButton({ action }: { action: ChatAction }) {
  const base = 'flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition active:scale-95 '
  const styles = {
    primary: base + 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white hover:brightness-110',
    secondary: base + 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700',
    danger: base + 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:brightness-110',
  }
  const isExternal = action.url.startsWith('http') || action.url.startsWith('tel:')
  return (
    <a
      href={action.url}
      target={isExternal && !action.url.startsWith('tel:') ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={styles[action.type]}
    >
      {action.label}
      {isExternal && !action.url.startsWith('tel:') && <ExternalLink className="w-3 h-3" />}
    </a>
  )
}

// ─── Typing Indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 shadow">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  if (msg.isTyping) return <TypingIndicator />

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 shadow">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      <div className={`max-w-[85%] space-y-2 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Bubble */}
        <div className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
          isUser
            ? 'rounded-br-sm bg-gradient-to-br from-cyan-500 to-sky-600 text-white'
            : 'rounded-bl-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
        }`}>
          {isUser ? msg.content : renderMarkdown(msg.content)}
        </div>

        {/* Action Buttons */}
        {!isUser && msg.actions && msg.actions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pl-1">
            {msg.actions.map((action, i) => (
              <ActionButton key={i} action={action} />
            ))}
          </div>
        )}

        {/* Quick Reply Chips */}
        {!isUser && msg.quickReplies && msg.quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pl-1">
            {msg.quickReplies.map((reply, i) => (
              <button
                key={i}
                data-quick-reply={reply}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/30 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition active:scale-95"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className={`text-[10px] text-slate-400 dark:text-slate-500 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

// ─── Main Widget ───────────────────────────────────────────────────────────────
const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `👋 **Welcome to BridgeCare!**\n\nI'm **Amara**, your AI healthcare assistant for Cameroon. I can help you:\n\n• 🏥 Find the right care services\n• 👩‍⚕️ Book a verified nurse or caregiver\n• 💳 Understand MTN MoMo & Orange Money payments\n• 🚨 Get emergency guidance\n\nHow can I assist you today?`,
  timestamp: new Date(),
  quickReplies: ['Find a nurse', 'View services', 'How to book?', 'Pricing'],
  actions: [{ label: '📋 Book Care Now', url: '/checkout', type: 'primary' }],
}

export function HealthChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasOpened, setHasOpened] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom()
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [messages, isOpen, isMinimized, scrollToBottom])

  // Show unread dot after 4s if not opened
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasOpened) setUnreadCount(1)
    }, 4000)
    return () => clearTimeout(timer)
  }, [hasOpened])

  const handleOpen = () => {
    setIsOpen(true)
    setIsMinimized(false)
    setUnreadCount(0)
    setHasOpened(true)
  }

  // Quick reply click delegation
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const btn = target.closest('[data-quick-reply]') as HTMLElement | null
      if (btn) {
        const reply = btn.getAttribute('data-quick-reply')
        if (reply) sendMessage(reply)
      }
    }
    chatRef.current?.addEventListener('click', handler)
    return () => chatRef.current?.removeEventListener('click', handler)
  }, [isLoading])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }
    const typingMsg: Message = {
      id: `typing-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    }

    setMessages(prev => [...prev, userMsg, typingMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      })
      const data = await res.json()
      const botMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.message || 'Sorry, I encountered an issue. Please try again.',
        timestamp: new Date(),
        quickReplies: data.quickReplies,
        actions: data.actions,
      }
      setMessages(prev => prev.filter(m => !m.isTyping).concat(botMsg))
    } catch {
      setMessages(prev => prev.filter(m => !m.isTyping).concat({
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ Connection issue. Please check your internet or call us at **+237 671 159 461**.',
        timestamp: new Date(),
        actions: [{ label: '📞 Call Now', url: 'tel:+237671159461', type: 'danger' }],
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleReset = () => {
    setMessages([{ ...WELCOME_MESSAGE, id: `welcome-${Date.now()}`, timestamp: new Date() }])
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {/* Chat Window */}
      {isOpen && (
        <div
          className={`flex flex-col rounded-3xl border border-white/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-2xl transition-all duration-300 origin-bottom-right ${
            isMinimized
              ? 'w-72 h-auto'
              : 'w-[360px] sm:w-[400px] h-[580px]'
          }`}
          style={{ boxShadow: '0 25px 60px -12px rgba(6,182,212,0.25), 0 8px 32px -8px rgba(0,0,0,0.3)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 rounded-t-3xl bg-gradient-to-r from-cyan-500/10 via-sky-500/10 to-emerald-500/10 dark:from-cyan-900/20 dark:via-sky-900/20 dark:to-emerald-900/20">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-lg">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">Amara</p>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">BridgeCare AI • Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="New conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                title="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Emergency Banner */}
          {!isMinimized && (
            <a
              href="tel:+237671159461"
              className="flex items-center gap-2 px-4 py-1.5 bg-red-50 dark:bg-red-950/30 border-b border-red-100 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-950/50 transition"
            >
              <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
              <span className="text-[10px] font-bold text-red-600 dark:text-red-400">EMERGENCY: Call 15 (SAMU) or +237 671 159 461</span>
              <ChevronRight className="h-3 w-3 text-red-400 ml-auto flex-shrink-0" />
            </a>
          )}

          {/* Messages */}
          {!isMinimized && (
            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(100,116,139,0.3) transparent' }}
            >
              {messages.map(msg => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input */}
          {!isMinimized && (
            <div className="px-3 pb-3 pt-2 border-t border-slate-200/80 dark:border-slate-800">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about care, booking, payments…"
                  disabled={isLoading}
                  className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 transition disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-lg hover:brightness-110 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
              <p className="text-center text-[9px] text-slate-400 dark:text-slate-600 mt-2">
                Powered by BridgeCare AI · Not a substitute for medical advice
              </p>
            </div>
          )}
        </div>
      )}

      {/* Floating Trigger */}
      <div className="relative">
        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full animate-ping bg-cyan-400/40 pointer-events-none" />
        )}

        {/* Unread badge */}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-lg">
            {unreadCount}
          </span>
        )}

        <button
          onClick={isOpen ? () => setIsOpen(false) : handleOpen}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 via-sky-500 to-emerald-500 text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-300"
          aria-label={isOpen ? 'Close chat' : 'Open BridgeCare AI chat'}
          style={{ boxShadow: '0 8px 30px -4px rgba(6,182,212,0.6)' }}
        >
          <div className={`transition-all duration-300 ${isOpen ? 'rotate-90 scale-90' : 'rotate-0 scale-100'}`}>
            {isOpen
              ? <X className="h-6 w-6" />
              : <MessageCircle className="h-6 w-6" />
            }
          </div>
        </button>

        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute bottom-16 right-0 whitespace-nowrap rounded-2xl bg-slate-900 dark:bg-white px-3 py-1.5 text-xs font-bold text-white dark:text-slate-900 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
            Chat with Amara 👋
            <div className="absolute -bottom-1 right-5 h-2 w-2 rotate-45 bg-slate-900 dark:bg-white" />
          </div>
        )}
      </div>
    </div>
  )
}
