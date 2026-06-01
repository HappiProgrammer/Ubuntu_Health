import React from 'react';
import { Star, MapPin, Clock, Users, ShieldCheck, AlertCircle } from 'lucide-react';
import { Doctor } from '@/services/mockDoctors';

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (doctorId: string) => void;
  isBooking?: boolean;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBook, isBooking = false }) => {
  return (
    <div className="card group hover:border-green-500/50 dark:hover:border-green-500/30 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
            {doctor.name}
          </h3>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {doctor.specialty}
          </p>
        </div>
        <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
          <span className="text-sm font-bold text-yellow-700 dark:text-yellow-500">{doctor.rating}</span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-slate-600 dark:text-slate-400">
          <ShieldCheck className="h-4 w-4 mr-2 text-primary-500" />
          <span className="text-sm font-medium">{doctor.hospital}</span>
        </div>
        <div className="flex items-center text-slate-600 dark:text-slate-400">
          <MapPin className="h-4 w-4 mr-2 text-primary-500" />
          <span className="text-sm font-medium">{doctor.distance} km away</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Users className="h-3 w-3 mr-1" />
            Queue
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white">{doctor.queueLength} Patients</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Clock className="h-3 w-3 mr-1" />
            Wait Time
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white">~{doctor.estimatedWaitTime} min</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className={`flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
          doctor.availability 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {doctor.availability ? 'Available' : 'Busy'}
        </div>
        
        <button
          onClick={() => onBook(doctor.id)}
          disabled={!doctor.availability || isBooking}
          className={`btn-primary px-6 py-2.5 text-sm font-bold shadow-soft-lg ${
            !doctor.availability ? 'opacity-50 cursor-not-allowed bg-slate-400' : 'hover:shadow-green-500/20'
          }`}
        >
          {isBooking ? 'Booking...' : 'Book Appointment'}
        </button>
      </div>
    </div>
  );
};
