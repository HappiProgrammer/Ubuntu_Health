'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check, AlertCircle, Info, Calendar, UserCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'emergency'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

interface NotificationBellProps {
  userId: string
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    loadNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [userId])

  const loadNotifications = async () => {
    try {
      // Mock notifications
      const mockNotifications: Notification[] = [
        {
          id: 'n1',
          type: 'success',
          title: 'Nurse Approved',
          message: 'Your profile has been approved by admin. You can now receive care requests.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false
        },
        {
          id: 'n2',
          type: 'warning',
          title: 'New Care Request',
          message: 'You have a new care request matching your specialties. Review it now.',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: false,
          actionUrl: '/dashboard/care-requests'
        },
        {
          id: 'n3',
          type: 'info',
          title: 'Appointment Reminder',
          message: 'You have an appointment tomorrow at 10:00 AM with patient John M.',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          read: true
        },
        {
          id: 'n4',
          type: 'emergency',
          title: 'Emergency Request',
          message: 'High priority care request in your area. Immediate response needed.',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          read: false,
          actionUrl: '/dashboard/care-requests'
        }
      ]

      setNotifications(mockNotifications)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'emergency':
        return <AlertCircle className="h-5 w-5 text-red-600 animate-pulse" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'emergency':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const timeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
    
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-[#8B7355] hover:text-[#5C4B37] transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF6044] text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          {/* Notification Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-md border border-[#E8DCC8] shadow-xl z-50 max-h-[600px] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#A79277] to-[#8B7355] p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-white/80">{unreadCount} unread</p>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs px-3 py-1 bg-white/20 rounded-md hover:bg-white/30 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[500px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-[#E8DCC8] mx-auto mb-3" />
                  <p className="text-[#8B7355]">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E8DCC8]">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 transition-colors ${
                        notification.read ? 'bg-white' : getNotificationBg(notification.type)
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-bold text-[#5C4B37] mb-1">
                                {notification.title}
                              </p>
                              <p className="text-xs text-[#8B7355] leading-relaxed">
                                {notification.message}
                              </p>
                              <p className="text-xs text-[#8B7355] mt-2">
                                {timeAgo(notification.timestamp)}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 hover:bg-white/50 rounded"
                                  title="Mark as read"
                                >
                                  <Check className="h-3 w-3 text-[#A79277]" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1 hover:bg-white/50 rounded"
                                title="Delete"
                              >
                                <X className="h-3 w-3 text-[#8B7355]" />
                              </button>
                            </div>
                          </div>

                          {/* Action Button */}
                          {notification.actionUrl && (
                            <a
                              href={notification.actionUrl}
                              className="inline-block mt-2 px-3 py-1.5 bg-[#A79277] text-white text-xs font-semibold rounded-md hover:bg-[#9A8469] transition-colors"
                            >
                              View Details
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#E8DCC8] p-3 bg-[#F7E7CE]">
              <button
                onClick={() => setShowDropdown(false)}
                className="w-full py-2 text-sm text-[#8B7355] hover:text-[#5C4B37] transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Send notification (for use in other components)
 */
export async function sendNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  actionUrl?: string
) {
  const isMockMode = (supabase as any).isMockMode

  if (isMockMode) {
    const notification: Notification = {
      id: `notif_${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl
    }

    const notifications = JSON.parse(localStorage.getItem(`notifications_${userId}`) || '[]')
    notifications.unshift(notification)
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications.slice(0, 50)))
    return notification
  }

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      action_url: actionUrl,
      is_read: false
    })
    .select()
    .single()

  if (error) throw error
  return data
}
