'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { Camera, Upload, MapPin, Eye, EyeOff, Check, X, Moon, Sun, Shield, AlertCircle } from 'lucide-react'

const registerSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name required'),
  phone: z.string().regex(/^(?:\+237|237)?[623][0-9]{8}$/, 'Valid Cameroon phone number required'),
  role: z.enum(['nurse', 'client']),
  locationAddress: z.string().min(5, 'Location address required'),
  bio: z.string().optional(),
  clientRequirements: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, 'Terms must be accepted')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const isMockMode = (supabase as any).isMockMode

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.theme = 'dark'
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.theme = 'light'
    }
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: searchParams.get('role') as 'nurse' | 'client' || 'client'
    }
  })

  const selectedRole = watch('role')

  useEffect(() => {
    if (selectedRole === 'nurse') {
      getLocation()
    }
  }, [selectedRole])

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Location error:', error)
          setError('Location access denied. Please enter your address manually.')
        }
      )
    }
  }

  const handleIdScan = async (file: File) => {
    if (!file) return

    setScanningId(true)
    try {
      // In a real app, you would use Tesseract.js here
      // For demo purposes, we'll simulate the scan
      await new Promise(resolve => setTimeout(resolve, 2000))
      setScannedIdText('ID Document scanned successfully. License: CMR-NURSE-2024-1234')
      setIdDocument(file)
    } catch (err) {
      setError('Failed to scan ID document')
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
      // Sign up user
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
        // Create profile
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

        // If nurse, create nurse profile
        if (data.role === 'nurse') {
          // In a real app, you would upload files and get hashes
          const idHash = 'hash_' + Date.now()
          const certHashes = certifications.map(() => 'hash_' + Date.now())

          const { error: nurseError } = await supabase
            .from('nurse_profiles')
            .insert({
              id: crypto.randomUUID(),
              user_id: authData.user.id,
              license_number: scannedIdText.includes('License:') 
                ? scannedIdText.split('License: ')[1] 
                : 'PENDING_VERIFICATION',
              specialization: ['General Care'],
              experience_years: 0,
              education: 'To be updated',
              certifications: [],
              id_document_hash: idHash,
              certification_hashes: certHashes,
              hourly_rate: 5000 // Default XAF 5000/hour
            })

          if (nurseError) throw nurseError
        }

        // If client, create care request from requirements
        if (data.role === 'client' && data.clientRequirements) {
          const { error: careRequestError } = await supabase
            .from('care_requests')
            .insert({
              id: crypto.randomUUID(),
              client_id: authData.user.id,
              title: 'Care Needed - New Registration',
              description: data.clientRequirements,
              care_type: 'General Care',
              urgency: 'medium',
              location_address: data.locationAddress,
              start_date: new Date().toISOString().split('T')[0],
              budget: 10000, // Default budget
              status: 'open'
            })

          if (careRequestError) throw careRequestError
        }

        // Success - redirect based on mode
        setSuccess('Registration successful! Redirecting...')
        
        if (isMockMode) {
          // In mock mode, redirect to dashboard after short delay
          setTimeout(() => {
            router.push('/dashboard')
          }, 1500)
        } else {
          // In production mode, redirect to email verification
          router.push('/auth/verify-email')
        }
      } else {
        throw new Error('Registration failed - no user data returned')
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF2E1] to-[#F7E7CE] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
          <div className="bg-[#A79277]/10 rounded-md p-2">
            <Camera className="h-6 w-6 text-[#A79277]" />
          </div>
          <h2 className="text-xl font-semibold text-[#5C4B37]">CAMIHN</h2>
        </Link>
        <h2 className="text-center text-2xl font-bold text-[#5C4B37]">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-[#8B7355]">
          Join Cameroon's trusted healthcare network
        </p>
        {isMockMode && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800">
              <p className="font-semibold">Demo Mode Active</p>
              <p>Registration uses local storage for testing.</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 sm:rounded-lg sm:px-8 border border-[#E8DCC8] shadow-sm">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            {error && (
              <div 
                role="alert" 
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md"
                tabIndex={0}
              >
                {error}
              </div>
            )}
            {success && (
              <div 
                role="status" 
                className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center space-x-2"
                tabIndex={0}
              >
                <Check className="h-4 w-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Role Selection - Simplified */}
            <div>
              <label className="block text-sm font-semibold text-[#5C4B37] mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('role', 'client')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedRole === 'client'
                      ? 'border-[#A79277] bg-[#A79277]/10'
                      : 'border-[#E8DCC8] hover:border-[#A79277]/50'
                  }`}
                >
                  <div className={`text-base font-bold mb-1 ${selectedRole === 'client' ? 'text-[#A79277]' : 'text-[#5C4B37]'}`}>
                    Patient
                  </div>
                  <div className="text-xs text-[#8B7355]">Looking for healthcare services</div>
                </button>
                <button
                  type="button"
                  onClick={() => setValue('role', 'nurse')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedRole === 'nurse'
                      ? 'border-[#A79277] bg-[#A79277]/10'
                      : 'border-[#E8DCC8] hover:border-[#A79277]/50'
                  }`}
                >
                  <div className={`text-base font-bold mb-1 ${selectedRole === 'nurse' ? 'text-[#A79277]' : 'text-[#5C4B37]'}`}>
                    Healthcare Provider
                  </div>
                  <div className="text-xs text-[#8B7355]">Offering professional care</div>
                </button>
              </div>
            </div>

            {/* Basic Information - Clean Layout */}
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-[#5C4B37] mb-1">
                  Full Name
                </label>
                <input
                  {...register('fullName')}
                  id="fullName"
                  type="text"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A79277] ${
                    errors.fullName ? 'border-red-500' : 'border-[#E8DCC8]'
                  }`}
                  placeholder="e.g. Jean-Paul Biya"
                />
                {errors.fullName && (
                  <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#5C4B37] mb-1">
                  Email Address
                </label>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A79277] ${
                    errors.email ? 'border-red-500' : 'border-[#E8DCC8]'
                  }`}
                  placeholder="email@example.cm"
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-[#5C4B37] mb-1">
                  Phone Number
                </label>
                <input
                  {...register('phone')}
                  id="phone"
                  type="tel"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A79277] ${
                    errors.phone ? 'border-red-500' : 'border-[#E8DCC8]'
                  }`}
                  placeholder="+237 6XX XXX XXX"
                />
                {errors.phone && (
                  <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="locationAddress" className="block text-sm font-semibold text-[#5C4B37] mb-1">
                  Location Address
                </label>
                <input
                  {...register('locationAddress')}
                  id="locationAddress"
                  type="text"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A79277] ${
                    errors.locationAddress ? 'border-red-500' : 'border-[#E8DCC8]'
                  }`}
                  placeholder="e.g. Bastos, Yaoundé"
                />
                {errors.locationAddress && (
                  <p className="text-xs text-red-600 mt-1">{errors.locationAddress.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-[#5C4B37] mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`w-full px-4 py-3 pr-11 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A79277] ${
                        errors.password ? 'border-red-500' : 'border-[#E8DCC8]'
                      }`}
                      placeholder="Min. 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7355] hover:text-[#5C4B37]"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#5C4B37] mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword')}
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`w-full px-4 py-3 pr-11 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A79277] ${
                        errors.confirmPassword ? 'border-red-500' : 'border-[#E8DCC8]'
                      }`}
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7355] hover:text-[#5C4B37]"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bio - Optional */}
            <div>
              <label htmlFor="bio" className="block text-sm font-semibold text-[#5C4B37] mb-1">
                Bio (Optional)
              </label>
              <textarea
                {...register('bio')}
                id="bio"
                rows={3}
                className="w-full px-4 py-3 border border-[#E8DCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A79277] resize-none"
                placeholder="Tell us about yourself or your care needs..."
              />
            </div>

            {/* Client-specific fields */}
            {selectedRole === 'client' && (
              <div className="space-y-6 border-t border-slate-200 dark:border-slate-800 pt-8">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Care Requirements</h3>
                </div>
                
                <div className="space-y-3">
                  <label htmlFor="clientRequirements" className="block text-sm font-semibold text-gray-100">
                    Describe Your Care Needs *
                  </label>
                  <textarea
                    {...register('clientRequirements')}
                    id="clientRequirements"
                    rows={5}
                    className="input-field"
                    placeholder="Please describe the type of care you need, specific requirements, schedule preferences, medical conditions, special needs, or any other important information that will help us match you with the right caregiver..."
                  />
                  <p className="text-xs text-gray-400">
                    This information will be used to create a job posting that qualified caregivers can see and apply to.
                  </p>
                </div>
              </div>
            )}

            {/* Nurse-specific fields */}
            {selectedRole === 'nurse' && (
              <div className="space-y-6 border-t border-slate-200 dark:border-slate-800 pt-8">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Professional Verification</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* ID Document Upload */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-100">
                      ID Document (CNI or Passport)
                    </label>
                    <div 
                      className={`relative group border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                        idDocument 
                          ? 'border-green-300 bg-green-50/30 dark:border-green-800 dark:bg-green-900/10' 
                          : 'border-slate-300 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-600 bg-slate-50/50 dark:bg-slate-900/20'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleIdScan(e.target.files[0])}
                        className="hidden"
                        id="id-upload"
                      />
                      <label htmlFor="id-upload" className="cursor-pointer block space-y-3">
                        <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                          idDocument ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        }`}>
                          <Camera className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {idDocument ? 'Document Uploaded' : 'Upload ID Document'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            JPG, PNG up to 5MB
                          </p>
                        </div>
                      </label>
                      {scanningId && (
                        <div role="status" className="absolute inset-0 bg-white/80 dark:bg-dark-surface/80 flex flex-col items-center justify-center rounded-2xl">
                          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="mt-2 text-xs font-bold text-primary-600 uppercase tracking-wider">Analyzing...</p>
                        </div>
                      )}
                    </div>
                    {scannedIdText && (
                      <div className="flex items-start space-x-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-900/30">
                        <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{scannedIdText}</span>
                      </div>
                    )}
                  </div>

                  {/* Certifications Upload */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-100">
                      Certifications & Licenses
                    </label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-900/20 hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-300">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        multiple
                        onChange={(e) => handleCertificationUpload(e.target.files)}
                        className="hidden"
                        id="cert-upload"
                      />
                      <label htmlFor="cert-upload" className="cursor-pointer block space-y-3">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                          <Upload className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Upload Certificates</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Add any professional diplomas</p>
                        </div>
                      </label>
                      {certifications.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {certifications.map((cert, index) => (
                            <div key={index} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-dark-surface p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                              <span className="truncate max-w-[150px]">{cert.name}</span>
                              <Check className="h-3 w-3 text-green-500" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="flex items-start bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center h-5">
                <input
                  {...register('agreeToTerms')}
                  id="agreeToTerms"
                  type="checkbox"
                  aria-invalid={errors.agreeToTerms ? "true" : "false"}
                  className="h-5 w-5 text-primary-600 border-slate-300 dark:border-slate-700 rounded-lg focus:ring-primary-500 transition-all cursor-pointer"
                />
              </div>
              <div className="ml-4">
                <label htmlFor="agreeToTerms" className="text-sm text-slate-600 dark:text-slate-400">
                  By checking this box, I agree to the{' '}
                  <Link href="/terms" className="text-primary-600 dark:text-primary-400 hover:underline font-bold">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline font-bold">
                    Privacy Policy
                  </Link>
                </label>
                {errors.agreeToTerms && (
                  <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-tight">{errors.agreeToTerms.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || (selectedRole === 'nurse' && !idDocument)}
                className="w-full btn-primary py-3 text-base font-semibold shadow-sm hover:shadow-md transform active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <Shield className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <span className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-green-500 hover:text-green-400">
                  Sign in
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
