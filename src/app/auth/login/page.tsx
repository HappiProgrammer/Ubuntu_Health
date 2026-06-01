'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { Camera, Eye, EyeOff, AlertCircle, Check } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
  rememberMe: z.boolean().optional()
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const isMockMode = (supabase as any).isMockMode

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false
    }
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signIn({
        email: data.email,
        password: data.password
      })

      if (authError) throw authError

      if (authData?.user) {
        setSuccess('Login successful! Redirecting...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        throw new Error('Login failed - no user data returned')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding with #FF6044 */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#FF6044] via-[#FF7A5C] to-[#FF9474]">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          {/* Decorative circles */}
          <div className="absolute top-40 right-40 w-32 h-32 border-4 border-white/20 rounded-full"></div>
          <div className="absolute bottom-60 left-32 w-24 h-24 border-4 border-white/20 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-white rounded-lg p-2.5 shadow-lg">
              <Camera className="h-6 w-6 text-[#FF6044]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">CareTaker</h1>
              <p className="text-xs text-white/80">Healthcare Management</p>
            </div>
          </Link>

          {/* Center Content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            {/* Medical Illustration */}
            <div className="relative mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                    <div className="bg-white/30 rounded-full w-12 h-12 flex items-center justify-center mb-3 mx-auto">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-xs text-white text-center font-medium">Doctors</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                    <div className="bg-white/30 rounded-full w-12 h-12 flex items-center justify-center mb-3 mx-auto">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-xs text-white text-center font-medium">Appointments</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                    <div className="bg-white/30 rounded-full w-12 h-12 flex items-center justify-center mb-3 mx-auto">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <p className="text-xs text-white text-center font-medium">Secure</p>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-white mb-4">
              Welcome Back to
              <span className="block">
                CareTaker Health
              </span>
            </h2>
            <p className="text-base text-white/90 leading-relaxed">
              Access your healthcare dashboard, manage appointments, and connect with medical professionals seamlessly.
            </p>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">500+</p>
                <p className="text-xs text-white/80 mt-1">Doctors</p>
              </div>
              <div className="text-center border-x border-white/30">
                <p className="text-3xl font-bold text-white">10k+</p>
                <p className="text-xs text-white/80 mt-1">Patients</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">50+</p>
                <p className="text-xs text-white/80 mt-1">Hospitals</p>
              </div>
            </div>
          </div>

          {/* Bottom - Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <p className="text-sm text-white italic mb-3">
              "CareTaker transformed how we manage patient care. The platform is intuitive and efficient."
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#FF6044] font-bold text-sm">
                DR
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Dr. Rachel M.</p>
                <p className="text-xs text-white/80">Chief Medical Officer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form with cream background */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#FFF2E1]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="bg-gradient-to-br from-[#A79277] to-[#8B7355] rounded-lg p-2.5 shadow-lg shadow-[#A79277]/30">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#5C4B37]">CareTaker</h1>
              <p className="text-xs text-[#8B7355]">Healthcare Management</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-[#E8DCC8] shadow-xl shadow-[#A79277]/10 p-8">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#5C4B37] mb-2">Sign In</h2>
              <p className="text-sm text-[#8B7355]">Enter your credentials to access your account</p>
            </div>

            {/* Mock Mode Alert */}
            {isMockMode && (
              <div className="mb-6 bg-[#A79277]/10 border border-[#A79277]/20 rounded-lg p-4 flex items-start space-x-3">
                <div className="bg-[#A79277]/20 rounded-full p-1.5 flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-[#A79277]" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-[#A79277] mb-1">Demo Mode Active</p>
                  <p className="text-[#8B7355] text-xs">Use the credentials you registered with to sign in.</p>
                </div>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Error/Success Messages */}
              {error && (
                <div 
                  role="alert" 
                  className="bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-lg flex items-center space-x-3"
                  tabIndex={0}
                >
                  <div className="bg-red-500/20 rounded-full p-1.5 flex-shrink-0">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <span className="text-sm">{error}</span>
                </div>
              )}
              {success && (
                <div 
                  role="status" 
                  className="bg-[#A79277]/10 border border-[#A79277]/20 text-[#A79277] px-4 py-3 rounded-lg flex items-center space-x-3"
                  tabIndex={0}
                >
                  <div className="bg-[#A79277]/20 rounded-full p-1.5 flex-shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="text-sm">{success}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-[#5C4B37]">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-[#A79277]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    {...register('email')}
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`w-full pl-12 pr-4 py-3 bg-white border ${errors.email ? 'border-red-500' : 'border-[#D4C4B0]'} rounded-lg text-[#5C4B37] placeholder:text-[#A79277] focus:outline-none focus:border-[#A79277] focus:ring-2 focus:ring-[#A79277]/20 transition-all`}
                    placeholder="name@example.com"
                  />
                </div>
                {errors.email && (
                  <p role="alert" className="text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-[#5C4B37]">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-[#A79277]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    {...register('password')}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`w-full pl-12 pr-12 py-3 bg-white border ${errors.password ? 'border-red-500' : 'border-[#D4C4B0]'} rounded-lg text-[#5C4B37] placeholder:text-[#A79277] focus:outline-none focus:border-[#A79277] focus:ring-2 focus:ring-[#A79277]/20 transition-all`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#A79277] hover:text-[#8B7355] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p role="alert" className="text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      {...register('rememberMe')}
                      id="rememberMe"
                      type="checkbox"
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-[#D4C4B0] rounded bg-white peer-checked:bg-[#A79277] peer-checked:border-[#A79277] transition-all"></div>
                    <Check className="absolute inset-0 h-5 w-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity p-0.5" />
                  </div>
                  <span className="text-sm text-[#8B7355] group-hover:text-[#5C4B37]">Remember me</span>
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-[#A79277] hover:text-[#8B7355] transition-colors">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#A79277] to-[#8B7355] hover:from-[#9A8469] hover:to-[#A79277] text-white font-bold py-3.5 px-4 rounded-lg shadow-lg shadow-[#A79277]/30 hover:shadow-[#A79277]/40 transform hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E8DCC8]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-[#8B7355]">or continue with</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-2.5 bg-white border border-[#E8DCC8] rounded-lg text-[#5C4B37] hover:bg-[#F7E7CE] hover:border-[#D4C4B0] transition-all"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-2.5 bg-white border border-[#E8DCC8] rounded-lg text-[#5C4B37] hover:bg-[#F7E7CE] hover:border-[#D4C4B0] transition-all"
                >
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  GitHub
                </button>
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center pt-6 border-t border-[#E8DCC8]">
              <span className="text-sm text-[#8B7355]">
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-[#A79277] hover:text-[#8B7355] font-semibold transition-colors">
                  Create Account
                </Link>
              </span>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-[#A79277]">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-[#8B7355] hover:text-[#5C4B37]">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-[#8B7355] hover:text-[#5C4B37]">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
