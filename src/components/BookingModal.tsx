'use client'

import { useState } from 'react'
import { X, Calendar, Clock, User, Phone, Mail, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Smartphone, ShieldCheck } from 'lucide-react'
import { PaymentModal } from '@/components/payments/PaymentModal'
import { PaymentReceipt } from '@/lib/payments/types'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  doctorName: string
  doctorSpecialty: string
  hospital: string
  onConfirm: (bookingData: BookingData) => void
}

export interface BookingData {
  patientName: string
  patientPhone: string
  patientEmail: string
  appointmentDate: string
  appointmentTime: string
  reason: string
}

export default function BookingModal({
  isOpen,
  onClose,
  doctorName,
  doctorSpecialty,
  hospital,
  onConfirm
}: BookingModalProps) {
  const [step, setStep] = useState(1)
  const [bookingData, setBookingData] = useState<BookingData>({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: ''
  })
  const [errors, setErrors] = useState<Partial<BookingData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  if (!isOpen) return null

  const validateStep1 = () => {
    const newErrors: Partial<BookingData> = {}
    
    if (!bookingData.patientName.trim()) {
      newErrors.patientName = 'Name is required'
    }
    
    if (!bookingData.patientPhone.trim()) {
      newErrors.patientPhone = 'Phone number is required'
    } else if (!/^(?:\+237|237)?[623][0-9]{8}$/.test(bookingData.patientPhone.replace(/\s/g, ''))) {
      newErrors.patientPhone = 'Enter a valid Cameroon phone number'
    }
    
    if (bookingData.patientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.patientEmail)) {
      newErrors.patientEmail = 'Enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Partial<BookingData> = {}
    
    if (!bookingData.appointmentDate) {
      newErrors.appointmentDate = 'Please select a date'
    }
    
    if (!bookingData.appointmentTime) {
      newErrors.appointmentTime = 'Please select a time slot'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onConfirm(bookingData)
    setIsSubmitting(false)
    setStep(1)
    setBookingData({
      patientName: '',
      patientPhone: '',
      patientEmail: '',
      appointmentDate: '',
      appointmentTime: '',
      reason: ''
    })
  }

  const timeSlots = {
    morning: ['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM'],
    afternoon: ['11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM'],
    evening: ['03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM']
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day)
      const isPast = dateObj < today
      const isToday = dateObj.getTime() === today.getTime()
      const isSelected = bookingData.appointmentDate === dateObj.toISOString().split('T')[0]
      
      days.push({
        day,
        date: dateObj.toISOString().split('T')[0],
        isPast,
        isToday,
        isSelected
      })
    }
    
    return days
  }

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1))
  }

  const selectDate = (date: string) => {
    setBookingData({ ...bookingData, appointmentDate: date })
    setErrors({ ...errors, appointmentDate: undefined })
  }

  const selectTime = (time: string) => {
    setBookingData({ ...bookingData, appointmentTime: time })
    setErrors({ ...errors, appointmentTime: undefined })
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December']
  const calendarDays = getDaysInMonth(currentMonth)

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#A79277] to-[#9A8469] p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">Book Appointment</h3>
              <p className="text-sm opacity-90">{doctorName} - {doctorSpecialty}</p>
              <p className="text-xs opacity-75 mt-1">{hospital}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= s ? 'bg-white text-[#A79277]' : 'bg-white/30 text-white'
                }`}>
                  {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded transition-all ${
                    step > s ? 'bg-white' : 'bg-white/30'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs opacity-75">
            <span>Personal Info</span>
            <span>Date & Time</span>
            <span>Confirm</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Personal Information
              </h4>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={bookingData.patientName}
                    onChange={(e) => setBookingData({ ...bookingData, patientName: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A79277] dark:bg-slate-900 ${
                      errors.patientName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.patientName && (
                  <p className="text-xs text-red-500 mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.patientName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="tel"
                    value={bookingData.patientPhone}
                    onChange={(e) => setBookingData({ ...bookingData, patientPhone: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A79277] dark:bg-slate-900 ${
                      errors.patientPhone ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                    placeholder="+237 6XX XXX XXX"
                  />
                </div>
                {errors.patientPhone && (
                  <p className="text-xs text-red-500 mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.patientPhone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    value={bookingData.patientEmail}
                    onChange={(e) => setBookingData({ ...bookingData, patientEmail: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A79277] dark:bg-slate-900 ${
                      errors.patientEmail ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                    placeholder="your@email.com"
                  />
                </div>
                {errors.patientEmail && (
                  <p className="text-xs text-red-500 mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.patientEmail}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Select Date & Time
              </h4>

              {/* Visual Calendar */}
              <div className="bg-gradient-to-br from-[#F7E7CE] to-[#E8DCC8] rounded-xl p-4 border border-[#A79277]/20">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-[#5C4B37]" />
                  </button>
                  <h5 className="text-base font-bold text-[#5C4B37]">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h5>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-[#5C4B37]" />
                  </button>
                </div>

                {/* Week Days */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-[#8B7355] py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((dayObj, index) => (
                    <div key={index} className="aspect-square">
                      {dayObj ? (
                        <button
                          onClick={() => !dayObj.isPast && selectDate(dayObj.date)}
                          disabled={dayObj.isPast}
                          className={`w-full h-full rounded-lg text-sm font-semibold transition-all ${
                            dayObj.isPast
                              ? 'text-slate-300 cursor-not-allowed'
                              : dayObj.isSelected
                              ? 'bg-[#A79277] text-white shadow-lg scale-105'
                              : dayObj.isToday
                              ? 'bg-white border-2 border-[#A79277] text-[#A79277] hover:bg-[#A79277]/10'
                              : 'bg-white/70 text-[#5C4B37] hover:bg-white hover:shadow-md'
                          }`}
                        >
                          {dayObj.day}
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>

                {errors.appointmentDate && (
                  <p className="text-xs text-red-500 mt-2 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.appointmentDate}
                  </p>
                )}
              </div>

              {/* Selected Date Display */}
              {bookingData.appointmentDate && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    <strong>Selected:</strong> {new Date(bookingData.appointmentDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {/* Time Slots */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Available Time Slots *
                </label>

                {/* Morning */}
                <div>
                  <p className="text-xs font-semibold text-[#8B7355] mb-2 uppercase tracking-wider">Morning</p>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.morning.map((time) => (
                      <button
                        key={time}
                        onClick={() => selectTime(time)}
                        className={`py-2.5 rounded-lg text-xs font-semibold transition-all ${
                          bookingData.appointmentTime === time
                            ? 'bg-[#A79277] text-white shadow-lg scale-105'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Afternoon */}
                <div>
                  <p className="text-xs font-semibold text-[#8B7355] mb-2 uppercase tracking-wider">Afternoon</p>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.afternoon.map((time) => (
                      <button
                        key={time}
                        onClick={() => selectTime(time)}
                        className={`py-2.5 rounded-lg text-xs font-semibold transition-all ${
                          bookingData.appointmentTime === time
                            ? 'bg-[#A79277] text-white shadow-lg scale-105'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Evening */}
                <div>
                  <p className="text-xs font-semibold text-[#8B7355] mb-2 uppercase tracking-wider">Evening</p>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.evening.map((time) => (
                      <button
                        key={time}
                        onClick={() => selectTime(time)}
                        className={`py-2.5 rounded-lg text-xs font-semibold transition-all ${
                          bookingData.appointmentTime === time
                            ? 'bg-[#A79277] text-white shadow-lg scale-105'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {errors.appointmentTime && (
                  <p className="text-xs text-red-500 mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.appointmentTime}
                  </p>
                )}
              </div>

              {/* Reason for Visit */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Reason for Visit (Optional)
                </label>
                <textarea
                  value={bookingData.reason}
                  onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A79277] dark:bg-slate-900 resize-none"
                  placeholder="Briefly describe your symptoms or reason for consultation..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Confirm Booking
              </h4>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Doctor:</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Specialty:</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{doctorSpecialty}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700" />
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Patient:</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{bookingData.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Phone:</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{bookingData.patientPhone}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700" />
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Date:</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {new Date(bookingData.appointmentDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Time:</span>
                  <span className="text-sm font-semibold text-[#A79277]">{bookingData.appointmentTime}</span>
                </div>
                {bookingData.reason && (
                  <>
                    <div className="border-t border-slate-200 dark:border-slate-700" />
                    <div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">Reason:</span>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{bookingData.reason}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Note:</strong> You will receive a confirmation message shortly. Please arrive 15 minutes before your appointment time.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex space-x-3">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          )}
          
          {step < 3 ? (
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-3 bg-[#A79277] text-white rounded-xl font-bold hover:bg-[#9A8469] transition-colors"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-[#A79277] text-white rounded-xl font-bold hover:bg-[#9A8469] transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Booking...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Confirm Booking</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
