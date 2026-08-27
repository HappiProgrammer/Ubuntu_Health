'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { AuthHeader } from '@/components/auth/AuthHeader'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  ArrowRight,
  ShieldCheck,
  Info
} from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
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
        setSuccess('Welcome back! Redirecting to your dashboard...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        throw new Error('Login failed — no user data returned.')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please check your credentials.')
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

      {/* Main Authentication Centerstage */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 z-10">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-soft-lg p-6 sm:p-9 backdrop-blur-xl animate-fade-in">
            {/* Card Header Badge & Titles */}
            <div className="mb-6 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-100 dark:border-primary-900/40 text-xs font-bold text-primary-700 dark:text-primary-300 mb-3">
                <ShieldCheck className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                <span>Secure Patient & Provider Portal</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                Welcome back
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Sign in to your BridgeCare account below.
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
                    You can use your registered credentials or demo accounts to test the platform.
                  </p>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div
                role="alert"
                className="mb-5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 px-4 py-3.5 rounded-2xl flex items-start gap-3 text-sm animate-fade-in"
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
                className="mb-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 px-4 py-3.5 rounded-2xl flex items-center gap-3 text-sm animate-fade-in"
                tabIndex={0}
              >
                <div className="bg-emerald-100 dark:bg-emerald-900/50 rounded-xl p-1.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-4 w-4" />
                </div>
                <span className="font-medium">{success}</span>
              </div>
            )}

            {/* Form */}
            <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Email Address */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Email Address
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
                    placeholder="name@example.com"
                  />
                </div>
                {errors.email && (
                  <p role="alert" className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 h-5 w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    {...register('password')}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`w-full pl-11 pr-12 py-3 rounded-2xl border ${
                      errors.password
                        ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-slate-300 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-500/20'
                    } bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-sm transition focus:outline-none focus:ring-2`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition"
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2.5 cursor-pointer group select-none">
                  <input
                    {...register('rememberMe')}
                    id="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 rounded-md border-slate-300 dark:border-slate-700 text-primary-600 focus:ring-primary-500/20 transition cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition">
                    Remember me
                  </span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs sm:text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Primary CTA Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3.5 px-5 text-sm sm:text-base font-bold shadow-soft flex items-center justify-center gap-2 group transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium">
                    or continue with
                  </span>
                </div>
              </div>

              {/* Social Login Options */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setError('Google single sign-on will connect in production.')}
                  className="btn-secondary py-2.5 px-4 text-xs font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-soft-sm hover:border-primary-300 dark:hover:border-primary-700 transition"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => setError('GitHub single sign-on will connect in production.')}
                  className="btn-secondary py-2.5 px-4 text-xs font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-soft-sm hover:border-primary-300 dark:hover:border-primary-700 transition"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>
            </form>

            {/* Footer Registration Link */}
            <div className="mt-7 text-center pt-5 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Don't have an account?{' '}
                <Link
                  href="/auth/register"
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-bold transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          {/* Legal / Policy Footer */}
          <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-500 leading-relaxed px-4">
            By signing in, you agree to BridgeCare's{' '}
            <Link href="/terms" className="underline hover:text-slate-700 dark:hover:text-slate-300 transition">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-slate-700 dark:hover:text-slate-300 transition">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>

      {/* Bottom spacing helper */}
      <div className="h-6" />
    </div>
  )
}
