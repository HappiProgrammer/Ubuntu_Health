'use client'

import { useState } from 'react'
import { Clock, Calendar, Users, ChevronRight } from 'lucide-react'

interface TimeSlot {
  id: string
  time: string
  type: 'general' | 'specialized'
  specialty?: string
  availableSpots: number
  totalSpots: number
  estimatedWait: number
}

interface QueueCalendarProps {
  slots: TimeSlot[]
  onBookSlot: (slotId: string) => void
}

export default function QueueCalendar({ slots, onBookSlot }: QueueCalendarProps) {
  const [selectedType, setSelectedType] = useState<'all' | 'general' | 'specialized'>('all')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const filteredSlots = slots.filter(slot =>
    selectedType === 'all' ? true : slot.type === selectedType
  )

  const groupedSlots = filteredSlots.reduce((acc, slot) => {
    const hour = slot.time.split(':')[0]
    if (!acc[hour]) acc[hour] = []
    acc[hour].push(slot)
    return acc
  }, {} as Record<string, TimeSlot[]>)

  return (
    <div className="bg-white border-2 border-gray-200">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-bold text-gray-900">Appointment Calendar</h3>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 bg-white text-gray-700 border-2 border-gray-300 text-sm focus:outline-none focus:border-gray-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b-2 border-gray-200 p-3 bg-gray-50">
        <div className="flex space-x-2">
          {(['all', 'general', 'specialized'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex-1 px-3 py-2 text-sm font-semibold transition-all border-2 ${
                selectedType === type
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {type === 'all' ? 'All Slots' : type === 'general' ? 'General' : 'Specialized'}
            </button>
          ))}
        </div>
      </div>

      {/* Time Slots */}
      <div className="divide-y-2 divide-gray-200 max-h-[500px] overflow-y-auto">
        {Object.keys(groupedSlots).length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No available slots</p>
          </div>
        ) : (
          Object.entries(groupedSlots).map(([hour, hourSlots]) => (
            <div key={hour} className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="h-4 w-4 text-gray-700" />
                <span className="text-sm font-bold text-gray-900">{hour}:00 Hour</span>
              </div>
              
              <div className="space-y-2">
                {hourSlots.map((slot) => {
                  const availability = (slot.availableSpots / slot.totalSpots) * 100
                  const isLowAvailability = availability < 30
                  
                  return (
                    <button
                      key={slot.id}
                      onClick={() => onBookSlot(slot.id)}
                      disabled={slot.availableSpots === 0}
                      className="w-full flex items-center justify-between p-3 bg-white border-2 border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="flex-1 text-left">
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="text-lg font-bold text-gray-900">{slot.time}</span>
                          {slot.type === 'specialized' && slot.specialty && (
                            <span className="px-2 py-0.5 bg-gray-900 text-white text-xs font-semibold">
                              {slot.specialty}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{slot.availableSpots}/{slot.totalSpots} spots</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>~{slot.estimatedWait} min wait</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* Availability Bar */}
                        <div className="w-16 h-2 bg-gray-200 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              isLowAvailability ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${availability}%` }}
                          />
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-700 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
