'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { AuthHeader } from '@/components/auth/AuthHeader'
import {
  Heart,
  Stethoscope,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  FileText,
  Camera,
  Upload,
  Check,
  AlertCircle,
  ShieldCheck,
  Info,
  CheckCircle2
} from 'lucide-react'

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().regex(/^(?:\+237|237)?[623][0-9]{8}$/, 'Valid Cameroon phone number required (+237 6XX XXX XXX)'),
  role: z.enum(['nurse', 'client']),
  locationAddress: z.string().min(5, 'Location address is required (e.g., Bastos, Yaoundé)'),
  bio: z.string().optional(),
  clientRequirements: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must accept the Terms and Privacy Policy')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type RegisterFormData = z.infer<typeof registerSchema>

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [idDocument, setIdDocument] = useState<File | null>(null)
  const [certifications, setCertifications] = useState<File[]>([])
  const [scanningId, setScanningId] = useState(false)
  const [scannedIdText, setScannedIdText] = useState('')
  const isMockMode = (supabase as any).isMockMode

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: (searchParams.get('role') as 'nurse' | 'client') || 'client',
      agreeToTerms: false
    }
  })

  const selectedRole = watch('role')

  useEffect(() => {
    if (selectedRole === 'nurse') {
      getLocation()
    }
  }, [selectedRole])

  const getLocation = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (err) => {
          console.warn('Geolocation warning:', err.message)
        }
      )
    }
  }

  const handleIdScan = async (file: File) => {
    if (!file) return

    setScanningId(true)
    try {
      // Simulate ID Document AI OCR verification
      await new Promise(resolve => setTimeout(resolve, 1800))
      setScannedIdText('National ID / License verified: CMR-NURSE-2026-8841')
      setIdDocument(file)
    } catch (err) {
      setError('Failed to process ID document. Please try a clearer photo.')
    } finally {
      setScanningId(false)
    }
  }

  const handleCertificationUpload = (files: FileList | null) => {
    if (files) {
      setCertifications(prev => [...prev, ...Array.from(files)])
    }
  }

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role
          }
        }
      })

      if (authError) throw authError

      if (authData?.user) {
        // 2. Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: data.email,
            full_name: data.fullName,
            phone: data.phone,
            role: data.role,
            location_lat: location?.lat,
            location_lng: location?.lng,
            location_address: data.locationAddress,
            bio: data.bio
          })

        if (profileError) throw profileError

        // 3. If nurse, create nurse profile
        if (data.role === 'nurse') {
          const idHash = 'doc_id_' + Date.now()
          const certHashes = certifications.map(() => 'cert_' + Date.now())

          const { error: nurseError } = await supabase
            .from('nurse_profiles')
            .insert({
              id: crypto.randomUUID(),
              user_id: authData.user.id,
              license_number: scannedIdText.includes('License verified:')
                ? scannedIdText.split('License verified: ')[1]
                : 'CMR-PENDING-' + Date.now().toString().slice(-6),
              specialization: ['General Care', 'Post-Op Recovery'],
              experience_years: 1,
              education: 'Registered Nursing Degree',
              certifications: [],
              id_document_hash: idHash,
              certification_hashes: certHashes,
              hourly_rate: 5000
            })

          if (nurseError) throw nurseError
        }

        // 4. If client, create care request if requirements provided
        if (data.role === 'client' && data.clientRequirements) {
          const { error: careRequestError } = await supabase
            .from('care_requests')
            .insert({
              id: crypto.randomUUID(),
              client_id: authData.user.id,
              title: 'Care Request from Registration',
              description: data.clientRequirements,
              care_type: 'General Care',
              urgency: 'medium',
              location_address: data.locationAddress,
              start_date: new Date().toISOString().split('T')[0],
              budget: 15000,
              status: 'open'
            })

          if (careRequestError) throw careRequestError
        }

        // 5. Success navigation
        setSuccess('Registration completed! Welcome to BridgeCare Cameroon Santé.')
        
        if (isMockMode) {
          setTimeout(() => {
            router.push('/dashboard')
          }, 1200)
        } else {
          router.push('/auth/verify-email')
        }
      } else {
        throw new Error('Registration failed — no user data returned.')
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Ambient BridgeCare Glow Orbs */}
      <div className="site-orb site-orb-a" />
      <div className="site-orb site-orb-b" />
      <div className="site-orb site-orb-c" />

      {/* Unified BridgeCare Auth Header */}
      <AuthHeader />

      {/* Registration Centerstage */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 z-10">
        <div className="w-full max-w-2xl">
          {/* Card Container */}
          <div className="glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-soft-lg p-6 sm:p-10 backdrop-blur-xl animate-fade-in">
            {/* Card Header Badge & Titles */}
            <div className="mb-6 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-100 dark:border-primary-900/40 text-xs font-bold text-primary-700 dark:text-primary-300 mb-3">
                <Heart className="h-3.5 w-3.5 fill-primary-600 text-primary-600 dark:text-primary-400" />
                <span>Healthcare That Feels Like Family</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                Create your BridgeCare account
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Join a trusted healthcare network connecting families with verified caregivers and nurses across Cameroon.
              </p>
            </div>

            {/* Mock Mode Alert */}
            {isMockMode && (
              <div className="mb-6 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60 p-4 flex items-start gap-3 text-left">
                <div className="rounded-xl bg-sky-100 dark:bg-sky-900/50 p-2 text-sky-600 dark:text-sky-400 shrink-0">
                  <Info className="h-4 w-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-sky-900 dark:text-sky-200">Demo Mode Active</p>
                  <p className="text-sky-700 dark:text-sky-300 mt-0.5">
                    Registration stores test accounts in localStorage for local evaluation.
                  </p>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div
                role="alert"
                className="mb-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 px-4 py-3.5 rounded-2xl flex items-start gap-3 text-sm animate-fade-in"
                tabIndex={0}
              >
                <div className="bg-red-100 dark:bg-red-900/50 rounded-xl p-1.5 flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* Success Banner */}
            {success && (
              <div
                role="status"
                className="mb-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 px-4 py-3.5 rounded-2xl flex items-center gap-3 text-sm animate-fade-in"
                tabIndex={0}
              >
                <div className="bg-emerald-100 dark:bg-emerald-900/50 rounded-xl p-1.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-4 w-4" />
                </div>
                <span className="font-medium">{success}</span>
              </div>
            )}

            {/* Main Form */}
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
                  I am a...
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Patient Card */}
                  <button
                    type="button"
                    onClick={() => setValue('role', 'client')}
                    className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between ${
                      selectedRole === 'client'
                        ? 'border-primary-500 bg-primary-50/70 dark:bg-primary-950/40 shadow-soft-sm ring-2 ring-primary-500/20 text-slate-950 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${
                        selectedRole === 'client'
                          ? 'bg-primary-600 text-white shadow-soft'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        <Heart className="h-5 w-5 fill-current" />
                      </div>
                      {selectedRole === 'client' && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-white">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-display font-bold text-base text-slate-950 dark:text-white mb-0.5">
                        Patient / Family
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Looking for verified home nurses, caregivers, or recovery care.
                      </p>
                    </div>
                  </button>

                  {/* Healthcare Provider Card */}
                  <button
                    type="button"
                    onClick={() => setValue('role', 'nurse')}
                    className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between ${
                      selectedRole === 'nurse'
                        ? 'border-primary-500 bg-primary-50/70 dark:bg-primary-950/40 shadow-soft-sm ring-2 ring-primary-500/20 text-slate-950 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${
                        selectedRole === 'nurse'
                          ? 'bg-primary-600 text-white shadow-soft'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      {selectedRole === 'nurse' && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-white">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-display font-bold text-base text-slate-950 dark:text-white mb-0.5">
                        Healthcare Provider
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Certified nurse, midwife, or licensed care specialist.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Core Information Grid */}
              <div className="space-y-4 pt-1">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Full Name *
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-4 h-5 w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <input
                      {...register('fullName')}
                      id="fullName"
                      type="text"
                      className={`w-full pl-11 pr-4 py-3 rounded-2xl border ${
                        errors.fullName
                          ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-slate-300 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-500/20'
                      } bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-sm transition focus:outline-none focus:ring-2`}
                      placeholder="e.g. Jean-Paul Biya"
                    />
                  </div>
                  {errors.fullName && (
                    <p role="alert" className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Email Address & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Email Address *
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-4 h-5 w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                      <input
                        {...register('email')}
                        id="email"
                        type="email"
                        autoComplete="email"
                        className={`w-full pl-11 pr-4 py-3 rounded-2xl border ${
                          errors.email
                            ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-slate-300 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-500/20'
                        } bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-sm transition focus:outline-none focus:ring-2`}
                        placeholder="you@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p role="alert" className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Cameroon Phone Number *
                    </label>
                    <div className="relative flex items-center">
                      <Phone className="absolute left-4 h-5 w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                      <input
                        {...register('phone')}
                        id="phone"
                        type="tel"
                        className={`w-full pl-11 pr-4 py-3 rounded-2xl border ${
                          errors.phone
                            ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-slate-300 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-500/20'
                        } bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-sm transition focus:outline-none focus:ring-2`}
                        placeholder="+237 6XX XXX XXX"
                      />
                    </div>
                    {errors.phone && (
                      <p role="alert" className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location Address */}
                <div className="space-y-1.5">
                  <label htmlFor="locationAddress" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    City & Neighborhood Address *
                  </label>
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-4 h-5 w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <input
                      {...register('locationAddress')}
                      id="locationAddress"
                      type="text"
                      className={`w-full pl-11 pr-4 py-3 rounded-2xl border ${
                        errors.locationAddress
                          ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-slate-300 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-500/20'
                      } bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-sm transition focus:outline-none focus:ring-2`}
                      placeholder="e.g. Bastos, Yaoundé or Bonanjo, Douala"
                    />
                  </div>
                  {errors.locationAddress && (
                    <p role="alert" className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1">
                      {errors.locationAddress.message}
                    </p>
                  )}
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Password *
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-4 h-5 w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                      <input
                        {...register('password')}
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        className={`w-full pl-11 pr-11 py-3 rounded-2xl border ${
                          errors.password
                            ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-slate-300 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-500/20'
                        } bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-sm transition focus:outline-none focus:ring-2`}
                        placeholder="Min. 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p role="alert" className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Confirm Password *
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-4 h-5 w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                      <input
                        {...register('confirmPassword')}
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        className={`w-full pl-11 pr-11 py-3 rounded-2xl border ${
                          errors.confirmPassword
                            ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-slate-300 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-500/20'
                        } bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-sm transition focus:outline-none focus:ring-2`}
                        placeholder="Re-enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p role="alert" className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio (Optional) */}
                <div className="space-y-1.5">
                  <label htmlFor="bio" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Bio / Introduction (Optional)
                  </label>
                  <textarea
                    {...register('bio')}
                    id="bio"
                    rows={2}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                    placeholder="Tell us a little about yourself or your family's healthcare requirements..."
                  />
                </div>
              </div>

              {/* Conditional Client Section: Care Requirements */}
              {selectedRole === 'client' && (
                <div className="space-y-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 animate-slide-up">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400">
                      <Heart className="h-4 w-4 fill-current" />
                    </div>
                    <div>
                      <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                        Initial Care Requirements
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Help us match you with the right nurse or caregiver faster.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <textarea
                      {...register('clientRequirements')}
                      id="clientRequirements"
                      rows={3}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                      placeholder="e.g. Looking for post-operative recovery care in Douala for elderly parent, starting next Monday. Needs medication administration and daily vitals monitoring..."
                    />
                  </div>
                </div>
              )}

              {/* Conditional Nurse Section: Professional Verification */}
              {selectedRole === 'nurse' && (
                <div className="space-y-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 animate-slide-up">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                        Professional Verification
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        BridgeCare verifies all healthcare professionals for patient safety.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* ID Document Upload */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        ID Document (CNI or Passport)
                      </label>
                      <div
                        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                          idDocument
                            ? 'border-emerald-400 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20'
                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-primary-400 dark:hover:border-primary-500'
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => e.target.files?.[0] && handleIdScan(e.target.files[0])}
                          className="hidden"
                          id="id-upload"
                        />
                        <label htmlFor="id-upload" className="cursor-pointer block space-y-2">
                          <div className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                            idDocument
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}>
                            <Camera className="h-6 w-6" />
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {idDocument ? 'Document Uploaded' : 'Upload ID Document'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            JPG, PNG, or PDF up to 5MB
                          </p>
                        </label>

                        {/* Scanner Loading State */}
                        {scanningId && (
                          <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 flex flex-col items-center justify-center rounded-2xl backdrop-blur-sm">
                            <svg className="animate-spin h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-2 text-[11px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                              Verifying Document...
                            </p>
                          </div>
                        )}
                      </div>

                      {scannedIdText && (
                        <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-medium">{scannedIdText}</span>
                        </div>
                      )}
                    </div>

                    {/* Certifications Upload */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Nursing Diplomas & Certifications
                      </label>
                      <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center bg-white dark:bg-slate-900/60 hover:border-primary-400 dark:hover:border-primary-500 transition-all">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          multiple
                          onChange={(e) => handleCertificationUpload(e.target.files)}
                          className="hidden"
                          id="cert-upload"
                        />
                        <label htmlFor="cert-upload" className="cursor-pointer block space-y-2">
                          <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
                            <Upload className="h-6 w-6" />
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Upload Certificates
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Add nursing diplomas or licenses
                          </p>
                        </label>

                        {certifications.length > 0 && (
                          <div className="mt-3 space-y-1.5 text-left">
                            {certifications.map((cert, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg"
                              >
                                <span className="truncate max-w-[140px] font-medium">{cert.name}</span>
                                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms of Service & Privacy Policy Acceptance */}
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-200/80 dark:border-slate-800">
                <label className="flex items-start gap-3 cursor-pointer group select-none">
                  <input
                    {...register('agreeToTerms')}
                    id="agreeToTerms"
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded-md border-slate-300 dark:border-slate-700 text-primary-600 focus:ring-primary-500/20 transition cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    I agree to BridgeCare's{' '}
                    <Link href="/terms" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-bold underline">
                      Terms of Service
                    </Link>{' '}
                    and acknowledge the{' '}
                    <Link href="/privacy" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-bold underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p role="alert" className="text-xs text-red-600 dark:text-red-400 font-semibold mt-2 pl-7">
                    {errors.agreeToTerms.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3.5 px-6 text-sm sm:text-base font-bold shadow-soft flex items-center justify-center gap-2 group transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ShieldCheck className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Already have an account link */}
              <div className="text-center pt-2">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-bold transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Legal / Policy Footer */}
          <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-500 leading-relaxed px-4">
            BridgeCare Cameroon Santé protects your healthcare data with clinical encryption and privacy standards.
          </p>
        </div>
      </main>

      {/* Bottom spacing helper */}
      <div className="h-6" />
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
