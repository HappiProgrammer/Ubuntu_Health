'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, Paperclip, Smile, Image, FileText, Check, CheckCheck, Search, ArrowLeft } from 'lucide-react'

interface Message {
  id: string
  match_id: string
  sender_id: string
  receiver_id: string
  content: string
  message_type: 'text' | 'image' | 'document'
  file_url: string | null
  is_read: boolean
  created_at: string
}

interface Match {
  id: string
  full_name: string
  role: string
  last_message?: string
  last_message_time?: string
  unread_count?: number
  user_id?: string
}

interface MessageSystemProps {
  currentUserId: string
  currentUserRole: 'nurse' | 'client'
}

export default function MessageSystem({ currentUserId, currentUserRole }: MessageSystemProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMockMode = (supabase as any).isMockMode

  useEffect(() => {
    loadMatches()
    
    // Set up real-time subscription for messages
    let subscription: any = null
    
    if (!isMockMode) {
      subscription = supabase
        .channel('public:messages')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `match_id=eq.${selectedMatch}` 
        }, (payload: any) => {
          setMessages(prev => [...prev, payload.new])
        })
        .subscribe()
    } else {
      // Set up polling for mock mode
      const pollInterval = setInterval(() => {
        loadMatches()
        if (selectedMatch) {
          loadMessages(selectedMatch)
        }
      }, 3000)
      return () => clearInterval(pollInterval)
    }
    
    return () => {
      if (subscription) supabase.removeChannel(subscription)
    }
  }, [currentUserId, selectedMatch])

  useEffect(() => {
    if (selectedMatch) {
      loadMessages(selectedMatch)
      markAsRead(selectedMatch)
    }
  }, [selectedMatch])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMatches = async () => {
    try {
      if (isMockMode) {
        // ... (existing mock implementation is fine for now)
        const storedMessages = localStorage.getItem('mock_messages')
        const allMessages: Message[] = storedMessages ? JSON.parse(storedMessages) : []
        
        const conversationMap = new Map<string, Message[]>()
        
        allMessages.forEach(msg => {
          if (msg.sender_id === currentUserId || msg.receiver_id === currentUserId) {
            const otherUserId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id
            if (!conversationMap.has(otherUserId)) {
              conversationMap.set(otherUserId, [])
            }
            conversationMap.get(otherUserId)!.push(msg)
          }
        })
        
        const mockMatches: Match[] = []
        const userNames: Record<string, string> = {
          'user1': 'John Doe',
          'user2': 'Dr. Sarah Mbarga',
          'user3': 'Jean Dupont',
          'user4': 'Marie Ekotto'
        }
        
        conversationMap.forEach((messages, userId) => {
          const sortedMessages = messages.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          const lastMessage = sortedMessages[0]
          const unreadCount = messages.filter(m => m.receiver_id === currentUserId && !m.is_read).length
          
          mockMatches.push({
            id: `conv_${userId}`,
            full_name: userNames[userId] || `User ${userId}`,
            role: userId.startsWith('user') ? (userId === 'user1' || userId === 'user3' ? 'client' : 'nurse') : 'client',
            last_message: lastMessage?.content || '',
            last_message_time: lastMessage?.created_at || new Date().toISOString(),
            unread_count: unreadCount,
            user_id: userId
          })
        })
        
        if (mockMatches.length === 0) {
          mockMatches.push(
            {
              id: 'conv_user2',
              full_name: 'Dr. Sarah Mbarga',
              role: 'nurse',
              last_message: 'Hello! How can I help you?',
              last_message_time: new Date().toISOString(),
              unread_count: 2,
              user_id: 'user2'
            }
          )
        }
        
        setMatches(mockMatches.sort((a, b) => 
          new Date(b.last_message_time!).getTime() - new Date(a.last_message_time!).getTime()
        ))
        setLoading(false)
        return
      }

      // Load real matches with profile data
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          nurse_id,
          care_request_id,
          status,
          nurse_profile:profiles!matches_nurse_id_fkey(id, full_name, role),
          care_request:care_requests(id, client_id, profiles!care_requests_client_id_fkey(id, full_name, role))
        `)
        .or(`nurse_id.eq.${currentUserId},care_request.client_id.eq.${currentUserId}`)
        .in('status', ['accepted', 'approved', 'in_progress'])

      if (error) throw error

      // Transform and fetch last messages for each match
      const matchList = await Promise.all((data || []).map(async (match: any) => {
        const otherParty = match.nurse_id === currentUserId 
          ? match.care_request.profiles 
          : match.nurse_profile

        // Fetch last message for this match
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content, created_at, is_read, sender_id')
          .eq('match_id', match.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('match_id', match.id)
          .eq('receiver_id', currentUserId)
          .eq('is_read', false)

        return {
          id: match.id,
          full_name: otherParty?.full_name || 'Unknown',
          role: otherParty?.role || 'client',
          user_id: otherParty?.id,
          last_message: lastMsg?.content,
          last_message_time: lastMsg?.created_at,
          unread_count: unreadCount || 0
        }
      }))

      setMatches(matchList)
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (matchId: string) => {
    try {
      if (isMockMode) {
        // Load messages from localStorage
        const storedMessages = localStorage.getItem('mock_messages')
        const allMessages: Message[] = storedMessages ? JSON.parse(storedMessages) : []
        
        // Get the user_id from the match
        const match = matches.find(m => m.id === matchId)
        if (!match || !match.user_id) {
          setMessages([])
          return
        }
        
        // Filter messages for this conversation
        const conversationMessages = allMessages.filter(msg =>
          (msg.sender_id === currentUserId && msg.receiver_id === match.user_id) ||
          (msg.sender_id === match.user_id && msg.receiver_id === currentUserId)
        ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        
        setMessages(conversationMessages)
        return
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const markAsRead = async (matchId: string) => {
    const match = matches.find(m => m.id === matchId)
    if (!match || !match.user_id) return

    if (isMockMode) {
      // Load messages from localStorage
      const storedMessages = localStorage.getItem('mock_messages')
      const allMessages: Message[] = storedMessages ? JSON.parse(storedMessages) : []
      
      // Mark messages as read
      const updatedMessages = allMessages.map(msg => {
        if (msg.receiver_id === currentUserId && msg.sender_id === match.user_id && !msg.is_read) {
          return { ...msg, is_read: true }
        }
        return msg
      })
      
      // Save back to localStorage
      localStorage.setItem('mock_messages', JSON.stringify(updatedMessages))
      
      // Update unread count in matches
      setMatches(prev => prev.map(m => 
        m.id === matchId ? { ...m, unread_count: 0 } : m
      ))
      return
    }

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('match_id', matchId)
        .eq('receiver_id', currentUserId)
        .eq('is_read', false)
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch || sending) return

    setSending(true)
    try {
      const match = matches.find(m => m.id === selectedMatch)
      if (!match || !match.user_id) return

      const messageData: Message = {
        id: crypto.randomUUID(),
        match_id: selectedMatch,
        sender_id: currentUserId,
        receiver_id: match.user_id,
        content: newMessage.trim(),
        message_type: 'text',
        file_url: null,
        is_read: false,
        created_at: new Date().toISOString()
      }

      if (isMockMode) {
        // Load existing messages
        const storedMessages = localStorage.getItem('mock_messages')
        const allMessages: Message[] = storedMessages ? JSON.parse(storedMessages) : []
        
        // Add new message
        allMessages.push(messageData)
        
        // Save to localStorage
        localStorage.setItem('mock_messages', JSON.stringify(allMessages))
        
        // Update local state
        setMessages(prev => [...prev, messageData])
        setNewMessage('')
        
        // Update match's last message
        setMatches(prev => prev.map(m => 
          m.id === selectedMatch 
            ? { ...m, last_message: newMessage.trim(), last_message_time: new Date().toISOString() }
            : m
        ))
        return
      }

      const { error } = await supabase
        .from('messages')
        .insert(messageData)

      if (error) throw error

      setMessages(prev => [...prev, { ...messageData, created_at: new Date().toISOString() }])
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const filteredMatches = matches.filter(match =>
    match.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = diff / (1000 * 60 * 60)
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${Math.floor(hours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden h-[600px] flex">
      {/* Contacts Sidebar */}
      <div className={`${selectedMatch ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-slate-200 dark:border-slate-700`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3">Messages</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredMatches.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">No conversations yet</p>
            </div>
          ) : (
            filteredMatches.map(match => (
              <button
                key={match.id}
                onClick={() => setSelectedMatch(match.id)}
                className={`w-full p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left ${
                  selectedMatch === match.id ? 'bg-slate-50 dark:bg-slate-700' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                        {match.full_name}
                      </p>
                      {match.last_message_time && (
                        <span className="text-xs text-slate-400 ml-2">
                          {formatTime(match.last_message_time)}
                        </span>
                      )}
                    </div>
                    {match.last_message && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {match.last_message}
                      </p>
                    )}
                  </div>
                  {match.unread_count && match.unread_count > 0 ? (
                    <span className="ml-2 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {match.unread_count}
                    </span>
                  ) : null}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${!selectedMatch ? 'hidden md:flex' : 'flex'} flex-col flex-1`}>
        {selectedMatch ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {matches.find(m => m.id === selectedMatch)?.full_name}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900">
              {messages.map((message) => {
                const isOwnMessage = message.sender_id === currentUserId
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                        isOwnMessage
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      <div className={`flex items-center justify-end mt-1 space-x-1 ${
                        isOwnMessage ? 'text-white/70' : 'text-slate-400'
                      }`}>
                        <span className="text-xs">
                          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isOwnMessage && (
                          message.is_read ? (
                            <CheckCheck className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="flex items-end space-x-2">
                <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
                  <Paperclip className="h-5 w-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
                  <Image className="h-5 w-5" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-slate-100 dark:bg-slate-700 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
