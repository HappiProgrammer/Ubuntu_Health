'use client'

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  Hospital, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  X,
  Star,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { Doctor, getMockDoctors } from '@/services/mockDoctors';
import { DoctorCard } from '@/components/DoctorCard';
import BookingModal from '@/components/BookingModal';
import { useAppointmentQueue } from '@/context/AppointmentQueueContext';
import { useQueueSimulator } from '@/services/queueSimulator';

export default function HospitalAppointmentsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [bookingDoctorId, setBookingDoctorId] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  const { currentQueue, bookAppointment, leaveQueue } = useAppointmentQueue();
  
  // Start the queue simulator
  useQueueSimulator();

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setDoctors(getMockDoctors());
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const specialties = useMemo(() => {
    const s = new Set(doctors.map(d => d.specialty));
    return ['All', ...Array.from(s)];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors
      .filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            doc.hospital.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
        return matchesSearch && matchesSpecialty;
      })
      .sort((a, b) => {
        // Sort by Distance, then Queue, then Availability
        if (a.distance !== b.distance) return a.distance - b.distance;
        if (a.queueLength !== b.queueLength) return a.queueLength - b.queueLength;
        return a.availability === b.availability ? 0 : (a.availability ? -1 : 1);
      });
  }, [doctors, searchTerm, selectedSpecialty]);

  const handleBook = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      setSelectedDoctor(doctor);
      setShowBookingModal(true);
    }
  };

  const handleBookingConfirm = (bookingData: any) => {
    if (selectedDoctor) {
      bookAppointment(selectedDoctor.id, selectedDoctor.name, selectedDoctor.queueLength);
      setShowBookingModal(false);
      setSelectedDoctor(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-500">
      {/* Header */}
      <header className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 shadow-soft-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard" 
                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <ChevronLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center space-x-2">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-xl">
                  <Hospital className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Hospital Doctors</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by doctor or hospital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-slate-900 dark:text-white font-medium"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-4 min-w-[200px]">
                <Filter className="h-5 w-5 text-slate-400" />
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 dark:text-slate-300 focus:outline-none uppercase tracking-widest text-xs w-full"
                >
                  {specialties.map(s => (
                    <option key={s} value={s}>{s} Specialty</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card animate-pulse h-80 bg-slate-200/50 dark:bg-slate-800/50 border-none"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
            {filteredDoctors.map(doctor => (
              <DoctorCard 
                key={doctor.id} 
                doctor={doctor} 
                onBook={handleBook}
                isBooking={bookingDoctorId === doctor.id}
              />
            ))}
            
            {filteredDoctors.length === 0 && (
              <div className="col-span-full card py-20 text-center bg-slate-50/50 dark:bg-slate-900/30 border-dashed">
                <div className="bg-slate-100 dark:bg-slate-800 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-10 w-10 text-slate-400" />
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">No doctors found matching your criteria</p>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Queue Status Panel */}
      {currentQueue && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl z-50 animate-slide-up">
          <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-2xl border-2 border-green-500/30 overflow-hidden glass-morphism">
            <div className="bg-green-600 px-6 py-2 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Active Queue Session</span>
              </div>
              <button onClick={leaveQueue} className="hover:bg-green-700 p-1 rounded-lg transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-2xl">
                  <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{currentQueue.doctorName}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      currentQueue.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      currentQueue.status === 'in_consultation' ? 'bg-green-100 text-green-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {currentQueue.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">• Position: #{currentQueue.currentUserPosition}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Wait</p>
                  <div className="flex items-center justify-end space-x-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{currentQueue.estimatedWaitTime} min</span>
                  </div>
                </div>
                
                {currentQueue.status === 'completed' ? (
                  <button 
                    onClick={leaveQueue}
                    className="btn-primary bg-blue-600 hover:bg-blue-700 px-6 py-3 flex items-center space-x-2"
                  >
                    <span>Rate Doctor</span>
                    <Star className="h-4 w-4" />
                  </button>
                ) : (
                  <button className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-green-600 transition-colors shadow-soft-sm">
                    <MessageCircle className="h-6 w-6" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
              <div 
                className="h-full bg-green-500 transition-all duration-1000"
                style={{ 
                  width: `${currentQueue.status === 'completed' ? 100 : Math.max(5, (1 - (currentQueue.currentUserPosition / 10)) * 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedDoctor && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedDoctor(null);
          }}
          doctorName={selectedDoctor.name}
          doctorSpecialty={selectedDoctor.specialty}
          hospital={selectedDoctor.hospital}
          onConfirm={handleBookingConfirm}
        />
      )}
    </div>
  );
}
