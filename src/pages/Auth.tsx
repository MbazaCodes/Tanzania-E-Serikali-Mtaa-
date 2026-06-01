import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Globe2, 
  Building2, 
  MapPin, 
  Phone 
} from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { supabase, UserProfile } from '@/lib/supabase';
import { IS_SUPABASE_CONFIGURED } from '@/lib/config';
import { cn } from '@/lib/utils';
import { TANZANIA_LOGO_URL } from '@/constants/services';

import { COUNTRIES } from '@/constants/countries';
import { TANZANIA_ADDRESS_DATA } from '@/lib/addressData';

interface AuthProps {
  mode: 'login' | 'signup';
  onClose: () => void;
  setMode: (mode: 'login' | 'signup') => void;
  isDiaspora?: boolean;
}

export function Auth({ mode, onClose, setMode, isDiaspora = false }: AuthProps) {
  const { fetchUserProfile } = useAuth();
  const { lang, t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: "",
    nidaNumber: "",
    phone: "",
    firstName: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [regStep, setRegStep] = useState(1);
  const [nidaVerifying, setNidaVerifying] = useState(false);
  const [nidaVerified, setNidaVerified] = useState(false);
  const [nidaError, setNidaError] = useState<string | null>(null);

  const [regForm, setRegForm] = useState({
    firstName: "", middleName: "", lastName: "", sex: "M", nationality: "Mtanzania", nidaNumber: "",
    country: isDiaspora ? "" : "Tanzania", region: "", district: "", ward: "", street: "", phone: "", email: "", password: "", confirmPassword: "",
    lat: null as number | null, lng: null as number | null,
    isDiaspora: isDiaspora, countryOfResidence: "", passportNumber: "", countryOfCitizenship: "Tanzania",
    hasNida: true, idType: "" as string, idNumber: "" as string,
    dateOfBirth: "", placeOfBirth: "", maritalStatus: "", occupation: "", educationLevel: ""
  });

  const formatNIDA = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 20);
    const groups = digits.match(/.{1,4}/g) || [];
    return groups.join('-');
  };

  const handleLocationSelect = (location: Partial<{ region: string; district: string; ward: string; street: string }>) => {
    setRegForm(prev => ({
      ...prev,
      region: location.region || prev.region,
      district: location.district || prev.district,
      ward: location.ward || prev.ward,
      street: location.street || prev.street,
    }));
  };

  const updateRegForm = (key: string, value: unknown) => setRegForm((p) => ({ ...p, [key]: value } as typeof p));

  const isSupabaseConfigured = IS_SUPABASE_CONFIGURED;

  const verifyNIDA = async () => {
    const cleanNida = regForm.nidaNumber.replace(/\D/g, '');
    if (cleanNida.length !== 20) {
      setNidaError(lang === 'sw' ? "Namba ya NIDA lazima iwe na tarakimu 20" : "NIDA number must be 20 digits");
      return;
    }

    setNidaVerifying(true);
    setNidaError(null);
    setNidaVerified(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (cleanNida.startsWith('000')) {
        throw new Error(lang === 'sw' ? "Namba ya NIDA haijapatikana" : "NIDA number not found");
      }

      setNidaVerified(true);
      // NOTE: In production, replace this with a real NIDA API call.
      // The API response should return verified name fields to pre-fill below.
      // setRegForm(prev => ({ ...prev, firstName: res.first_name, ... }));
    } catch (err: unknown) {
      const _e = err as { message?: string };
      setNidaError(_e.message ?? null);
    } finally {
      setNidaVerifying(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      showToast(
        lang === 'sw'
          ? 'Mfumo wa Supabase haujasanidiwa. Weka VITE_SUPABASE_URL na VITE_SUPABASE_ANON_KEY kwenye .env.'
          : 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.',
        'error'
      );
      return;
    }

    setLoading(true);
    try {
      // --- Fast-fail if .env wasn't loaded (avoids confusing 20s timeout) ---
      const cfgUrl = import.meta.env.VITE_SUPABASE_URL;
      const cfgKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!cfgUrl || !cfgKey || cfgUrl.includes('placeholder')) {
        throw new Error(
          lang === 'sw'
            ? 'Mfumo haujasanidiwa: faili ya .env haijapakiwa. Hakikisha .env ina VITE_SUPABASE_URL na VITE_SUPABASE_ANON_KEY, kisha anzisha upya seva (Ctrl+C, npm run dev).'
            : 'Not configured: .env was not loaded. Ensure .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then FULLY restart the dev server (Ctrl+C, npm run dev).'
        );
      }

      // --- Auth call with 20 s timeout — no preflight request needed ---
      const unreachableError = new Error(
        lang === 'sw'
          ? 'Seva ya Supabase haipatikani. Mradi wako unaweza kuwa umesimamishwa — tembelea dashibodi ya Supabase kuuanzisha tena, au angalia muunganisho wa intaneti yako.'
          : 'Cannot reach Supabase server. Your project may be paused — visit app.supabase.com to resume it, or check your internet connection.'
      );
      (unreachableError as any).__isTimeout = true;

      const { data, error } = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        new Promise<never>((_, reject) =>
          setTimeout(() => {
            console.error('[Auth Debug] TIMEOUT: 20s exceeded');
            reject(unreachableError);
          }, 20000)
        ),
      ]);

      // --- Handle auth response ---

      if (error) {
        console.error('Auth error:', (error as { message?: string }).message);
        // 404/503/0 = project paused or infrastructure down
        if (error.status === 503 || error.status === 0) {
          throw unreachableError;
        }
        // 401 means wrong API key — show a clearer message
        if (error.status === 401) {
          throw new Error(
            lang === 'sw'
              ? 'Hitilafu ya usanidi: API key si sahihi. Angalia faili yako ya .env.'
              : 'Configuration error: Invalid API key. Check your .env file.'
          );
        }
        if ((error.message ?? '').includes('Email not confirmed')) {
          throw new Error(lang === 'sw' ? 'Barua pepe yako bado haijathibitishwa. Tafadhali kagua barua pepe yako.' : 'Your email is not confirmed yet. Please check your inbox.');
        }
        if ((error.message ?? '').includes('Invalid login credentials')) {
          throw new Error(lang === 'sw' ? 'Barua pepe au nywila si sahihi.' : 'Incorrect email or password.');
        }
        throw error;
      }

      if (data.user) {
        const adminEmails = ['mbazzacodes@gmail.com'];
        const userEmail = data.user.email?.toLowerCase() || '';
        const isAdminEmail = adminEmails.includes(userEmail);

        // Non-blocking: ensure profile exists and admin emails get admin role
        (async () => {
          try {
            // Check if profile already exists (direct query, no RPC dependency)
            const { data: existingProfile } = await supabase
              .from('users')
              .select('id, role')
              .eq('id', data.user!.id)
              .maybeSingle();

            if (!existingProfile) {
              // Auto-create a minimal profile (e.g. for staff created by admin)
              await supabase.from('users').upsert({
                id: data.user!.id,
                email: userEmail,
                first_name: data.user!.user_metadata?.first_name || userEmail.split('@')[0] || 'User',
                last_name: data.user!.user_metadata?.last_name || '',
                middle_name: data.user!.user_metadata?.middle_name || '',
                phone: data.user!.user_metadata?.phone || '',
                role: isAdminEmail ? 'admin' : (data.user!.user_metadata?.role as string || 'citizen'),
                is_verified: false,
                nationality: 'Tanzanian',
                country_of_citizenship: 'Tanzania',
              }, { onConflict: 'id' });
            } else if (isAdminEmail && existingProfile.role !== 'admin') {
              // Auto-promote admin emails
              await supabase.from('users').update({ role: 'admin' }).eq('id', data.user!.id);
            }
          } catch {
            // Profile init is non-blocking — login still succeeds
          }
        })();

        // Do not block login UX on profile refresh.
        // Non-blocking profile refresh — fully silent, never throws
        fetchUserProfile(data.user.id).catch(() => {});
      }

      onClose();
    } catch (err: unknown) {
      const _e = err as { message?: string };
      console.error('Login error:', _e.message);
      
      const isTimeout = !!(err as any).__isTimeout;
      const isNetworkError = isTimeout
        || _e.message?.includes('Failed to fetch')
        || _e.message?.includes('NetworkError')
        || _e.message?.includes('ERR_NAME_NOT_RESOLVED');
      
      console.log('[Auth Debug] isTimeout:', isTimeout, 'isNetworkError:', isNetworkError);
      
      if (isNetworkError) {
        showToast(
          lang === 'sw'
            ? 'Seva ya Supabase haipatikani. Angalia muunganisho wa intaneti yako au uanzishe tena mradi wako kwenye app.supabase.com.'
            : 'Cannot reach Supabase. Check your internet connection or resume your project at app.supabase.com.',
          'error'
        );
      } else {
        showToast(_e.message ?? (lang === 'sw' ? 'Imeshindwa. Jaribu tena.' : 'Login failed. Please try again.'), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) showToast((error as { message?: string }).message ?? 'Error', 'error');
  };

  const handleVerifySecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Verify security details against the database (clean NIDA by removing dashes)
      const cleanNida = forgotPasswordForm.nidaNumber.replace(/-/g, '');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', forgotPasswordForm.email)
        .eq('nida_number', cleanNida)
        .eq('phone', forgotPasswordForm.phone)
        .eq('first_name', forgotPasswordForm.firstName.toUpperCase())
        .single();

      if (error || !data) {
        throw new Error(lang === 'sw' ? "Taarifa hazijalingana na rekodi zetu" : "Information does not match our records");
      }

      setForgotPasswordStep(2);
    } catch (err: unknown) {
      const _e = err as { message?: string };
      showToast(_e.message ?? 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotPasswordForm.newPassword !== forgotPasswordForm.confirmNewPassword) {
      showToast(lang === 'sw' ? "Nywila hazifanani" : "Passwords do not match", 'error');
      return;
    }

    setLoading(true);
    try {
      // In a real app, we'd use supabase.auth.updateUser or a secure edge function
      // For this demo, we'll simulate the success
      const { error } = await supabase.auth.updateUser({
        password: forgotPasswordForm.newPassword
      });

      if (error) throw error;

      showToast(lang === 'sw' ? "Nywila imebadilishwa kikamilifu!" : "Password reset successfully!", 'success');
      setShowForgotPassword(false);
      setMode('login');
    } catch (err: unknown) {
      const _e = err as { message?: string };
      showToast(_e.message ?? 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (regForm.password !== regForm.confirmPassword) {
      showToast(lang === 'sw' ? "Nywila hazifanani" : "Passwords do not match", 'error');
      return;
    }

    if (regForm.nationality === 'Mtanzania' && regForm.hasNida && regForm.nidaNumber.replace(/\D/g, '').length !== 20) {
      showToast(lang === 'sw' ? "Namba ya NIDA lazima iwe na tarakimu 20" : "NIDA number must be 20 digits", 'error');
      return;
    }

    if (regForm.nationality === 'Mtanzania' && !regForm.hasNida && (!regForm.idType || !regForm.idNumber)) {
      showToast(lang === 'sw' ? "Tafadhali chagua aina ya kitambulisho na ingiza namba" : "Please select ID type and enter ID number", 'error');
      return;
    }

    if (!regForm.phone || !isValidPhoneNumber(regForm.phone)) {
      showToast(lang === 'sw' ? "Namba ya simu haijakamilika au si sahihi" : "Phone number is incomplete or invalid", 'error');
      return;
    }

    if (!regForm.dateOfBirth) {
      showToast(lang === 'sw' ? "Tafadhali ingiza tarehe ya kuzaliwa" : "Please enter your date of birth", 'error');
      return;
    }

    setLoading(true);

    try {
      // Check if email already exists in our users table
      const { data: existingEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', regForm.email)
        .maybeSingle();

      if (existingEmail) {
        throw new Error(lang === 'sw' ? "Barua pepe hii tayari imeshasajiliwa. Tafadhali ingia." : "This email is already registered. Please login.");
      }

      // Check if NIDA already exists (only for Tanzanians with NIDA)
      if (regForm.nationality === 'Mtanzania' && regForm.hasNida && regForm.nidaNumber) {
        const cleanNida = regForm.nidaNumber.replace(/-/g, '');
        const { data: existingNida } = await supabase
          .from('users')
          .select('id')
          .eq('nida_number', cleanNida)
          .maybeSingle();

        if (existingNida) {
          throw new Error(lang === 'sw' ? "Namba hii ya NIDA tayari imeshasajiliwa." : "This NIDA number is already registered.");
        }
      }

      const { data, error } = await supabase.auth.signUp({ 
        email: regForm.email, 
        password: regForm.password 
      });

      if (error) throw error;

      if (data.user) {
        const isDiaspora = regForm.country !== 'Tanzania';
        const { error: profileError } = await supabase.from('users').insert({
          id: data.user.id,
          first_name: regForm.firstName.toUpperCase(),
          middle_name: regForm.middleName.toUpperCase(),
          last_name: regForm.lastName.toUpperCase(),
          email: regForm.email,
          phone: regForm.phone ? regForm.phone.replace(/[\s\-().]/g, '') : null,
          sex: regForm.sex,
          gender: regForm.sex,
          date_of_birth: regForm.dateOfBirth || null,
          place_of_birth: regForm.placeOfBirth ? regForm.placeOfBirth.toUpperCase() : null,
          marital_status: regForm.maritalStatus || null,
          occupation: regForm.occupation || null,
          education_level: regForm.educationLevel || null,
          nationality: regForm.nationality === 'Mtanzania' ? 'Tanzanian' : 'Foreigner',
          country_of_citizenship: regForm.nationality === 'Mtanzania' ? 'Tanzania' : regForm.countryOfCitizenship,
          nida_number: regForm.hasNida ? regForm.nidaNumber.replace(/-/g, '') : null,
          id_type: regForm.idType || null,
          id_number: regForm.idNumber || null,
          region: regForm.region,
          district: regForm.district,
          ward: regForm.ward,
          street: regForm.street,
          is_diaspora: isDiaspora,
          country_of_residence: regForm.country,
          passport_number: regForm.passportNumber,
          role: 'citizen',
          is_verified: nidaVerified || isDiaspora || regForm.nationality === 'Mwingine'
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error(lang === 'sw' ? "Akaunti imeundwa lakini wasifu haukuweza kuhifadhiwa. Tafadhali wasiliana na msaada." : "Account created but profile could not be saved. Please contact support.");
        }
      }
      
      showToast(lang === 'sw' ? 'Usajili umekamilika! Tafadhali kagua barua pepe yako kwa ajili ya uthibitisho.' : 'Signup successful! Please check your email for confirmation.', 'success');
      setMode('login');
      onClose();
    } catch (err: unknown) {
      const _e = err as { message?: string };
      showToast(_e.message ?? 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-0 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full h-full sm:h-auto sm:max-w-2xl bg-white sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-screen sm:max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 sm:px-8 py-4 sm:py-6 border-b border-stone-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 flex items-center justify-center">
              <img src={TANZANIA_LOGO_URL} alt="Coat of Arms" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-stone-900">
                {mode === 'login' ? t('nav.login') : t('nav.signup')}
              </h2>
              <p className="text-[8px] sm:text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none">E-MTAA PORTAL</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400"
            title="Close"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {mode === 'login' ? (
            <div className="max-w-md mx-auto py-4">
              <AnimatePresence mode="wait">
                {!showForgotPassword ? (
                  <motion.div
                    key="login-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <form onSubmit={handleLogin} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Barua pepe' : 'Email'}</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                          <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
                            placeholder="juma@example.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">{lang === 'sw' ? 'Nenosiri' : 'Password'}</label>
                          <button 
                            type="button" 
                            onClick={() => setShowForgotPassword(true)}
                            className="text-xs font-bold text-emerald-600 hover:underline"
                          >
                            {lang === 'sw' ? 'Umesahau Nywila?' : 'Forgot Password?'}
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                          <input 
                            type={showPassword ? "text" : "password"} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-14 pl-12 pr-12 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
                            placeholder="••••••••"
                            required
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                            title={showPassword ? 'Hide password' : 'Show password'}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      <button 
                        disabled={loading}
                        className="w-full h-14 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        type="submit"
                      >
                        {loading ? <Loader2 className="animate-spin" /> : t('nav.login')}
                      </button>

                      <div className="text-center">
                        <p className="text-sm text-stone-500">
                          {lang === 'sw' ? 'Hauna akaunti?' : "Don't have an account?"} <button type="button" onClick={() => setMode('signup')} className="text-emerald-600 font-bold hover:underline">{t('nav.signup')}</button>
                        </p>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="forgot-password-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <button 
                        onClick={() => {
                          setShowForgotPassword(false);
                          setForgotPasswordStep(1);
                        }}
                        className="p-2 hover:bg-stone-100 rounded-full text-stone-400"
                        title="Back"
                        aria-label="Back to login"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <h3 className="text-lg font-bold text-stone-900">{lang === 'sw' ? 'Rudisha Nywila' : 'Reset Password'}</h3>
                    </div>

                    {forgotPasswordStep === 1 ? (
                      <form onSubmit={handleVerifySecurity} className="space-y-4">
                        <p className="text-sm text-stone-500 mb-4">
                          {lang === 'sw' ? 'Tafadhali jibu maswali yafuatayo ili kuthibitisha utambulisho wako.' : 'Please answer the following questions to verify your identity.'}
                        </p>
                        
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Barua pepe' : 'Email'}</label>
                          <input 
                            type="email"
                            required
                            value={forgotPasswordForm.email}
                            onChange={(e) => setForgotPasswordForm({...forgotPasswordForm, email: e.target.value})}
                            className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
                            placeholder="Email"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Namba ya NIDA' : 'NIDA Number'}</label>
                          <input 
                            type="text"
                            required
                            value={forgotPasswordForm.nidaNumber}
                            onChange={(e) => setForgotPasswordForm({...forgotPasswordForm, nidaNumber: e.target.value})}
                            className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
                            placeholder="NIDA Number"
                            aria-label="NIDA Number"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Jina la Kwanza' : 'First Name'}</label>
                          <input 
                            type="text"
                            required
                            value={forgotPasswordForm.firstName}
                            onChange={(e) => setForgotPasswordForm({...forgotPasswordForm, firstName: e.target.value})}
                            className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
                            placeholder="First Name"
                            aria-label="First Name"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Namba ya Simu' : 'Phone Number'}</label>
                          <input 
                            type="text"
                            required
                            value={forgotPasswordForm.phone}
                            onChange={(e) => setForgotPasswordForm({...forgotPasswordForm, phone: e.target.value})}
                            className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
                            placeholder="Phone Number"
                            aria-label="Phone Number"
                          />
                        </div>

                        <button 
                          disabled={loading}
                          className="w-full h-14 bg-stone-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                          type="submit"
                        >
                          {loading ? <Loader2 className="animate-spin" /> : (lang === 'sw' ? 'Thibitisha' : 'Verify Identity')}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Nywila Mpya' : 'New Password'}</label>
                          <input 
                            type="password"
                            required
                            value={forgotPasswordForm.newPassword}
                            onChange={(e) => setForgotPasswordForm({...forgotPasswordForm, newPassword: e.target.value})}
                            className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Thibitisha Nywila Mpya' : 'Confirm New Password'}</label>
                          <input 
                            type="password"
                            required
                            value={forgotPasswordForm.confirmNewPassword}
                            onChange={(e) => setForgotPasswordForm({...forgotPasswordForm, confirmNewPassword: e.target.value})}
                            className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                        <button 
                          disabled={loading}
                          className="w-full h-14 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                          type="submit"
                        >
                          {loading ? <Loader2 className="animate-spin" /> : (lang === 'sw' ? 'Badilisha Nywila' : 'Reset Password')}
                        </button>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Signup Progress */}
              <div className="hidden sm:flex items-center justify-between mb-12 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-100 -translate-y-1/2 -z-10"></div>
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex flex-col items-center gap-2 bg-white px-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-2",
                      regStep === step ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200" : 
                      regStep > step ? "bg-emerald-100 border-emerald-100 text-emerald-600" : "bg-white border-stone-200 text-stone-400"
                    )}>
                      {regStep > step ? <CheckCircle2 size={20} /> : step}
                    </div>
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest", regStep === step ? "text-emerald-600" : "text-stone-400")}>
                      {step === 1 ? (lang === 'sw' ? 'Binafsi' : 'Personal') : 
                       step === 2 ? (lang === 'sw' ? 'Mahali' : 'Location') : 
                       (lang === 'sw' ? 'Akaunti' : 'Account')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mobile Progress Bar */}
              <div className="sm:hidden mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                    {regStep === 1 ? (lang === 'sw' ? 'Hatua ya 1: Binafsi' : 'Step 1: Personal') : 
                     regStep === 2 ? (lang === 'sw' ? 'Hatua ya 2: Mahali' : 'Step 2: Location') : 
                     (lang === 'sw' ? 'Hatua ya 3: Akaunti' : 'Step 3: Account')}
                  </span>
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{regStep}/3</span>
                </div>
                <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-emerald-600 transition-all duration-500 ${regStep === 1 ? 'w-1/3' : regStep === 2 ? 'w-2/3' : 'w-full'}`}
                  ></div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {regStep === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Uraia' : 'Nationality'}</label>
                        <select 
                          value={regForm.nationality}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateRegForm('nationality', val);
                            if (val === 'Mtanzania') {
                              updateRegForm('countryOfCitizenship', 'Tanzania');
                              updateRegForm('country', 'Tanzania');
                            } else {
                              updateRegForm('nidaNumber', '');
                              setNidaVerified(false);
                            }
                          }}
                          className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                          aria-label="Nationality"
                        >
                          <option value="Mtanzania">{lang === 'sw' ? 'Mtanzania' : 'Tanzanian'}</option>
                          <option value="Mwingine">{lang === 'sw' ? 'Mgeni / Mkaazi' : 'Foreigner / Resident'}</option>
                        </select>
                      </div>
                      
                      {regForm.nationality === 'Mwingine' && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Nchi ya Uraia' : 'Country of Citizenship'}</label>
                          <select 
                            value={regForm.countryOfCitizenship}
                            onChange={(e) => updateRegForm('countryOfCitizenship', e.target.value)}
                            className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                            aria-label="Country of Citizenship"
                          >
                            <option value="">{lang === 'sw' ? 'Chagua Nchi' : 'Select Country'}</option>
                            {COUNTRIES.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {regForm.nationality === 'Mtanzania' ? (
                      <div className="space-y-4">
                        {/* Toggle: Has NIDA or Not */}
                        <div className="flex gap-4 items-center">
                          <button
                            type="button"
                            onClick={() => updateRegForm('hasNida', true)}
                            className={`flex-1 h-12 rounded-xl font-bold transition-all ${regForm.hasNida ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600'}`}
                          >
                            {lang === 'sw' ? 'Nina NIDA' : 'I have NIDA'}
                          </button>
                          <button
                            type="button"
                            onClick={() => updateRegForm('hasNida', false)}
                            className={`flex-1 h-12 rounded-xl font-bold transition-all ${!regForm.hasNida ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600'}`}
                          >
                            {lang === 'sw' ? 'Sina NIDA' : "I don't have NIDA"}
                          </button>
                        </div>

                        {regForm.hasNida ? (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Namba ya NIDA' : 'NIDA Number'}</label>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                value={regForm.nidaNumber}
                                onChange={(e) => updateRegForm('nidaNumber', formatNIDA(e.target.value))}
                                className="flex-1 h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                                placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
                                aria-label="NIDA Number"
                              />
                              <button 
                                type="button"
                                onClick={verifyNIDA}
                                disabled={nidaVerifying || regForm.nidaNumber.replace(/\D/g, '').length !== 20}
                                className="px-6 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all disabled:opacity-50"
                              >
                                {nidaVerifying ? <Loader2 className="animate-spin" /> : (lang === 'sw' ? 'Hakiki' : 'Verify')}
                              </button>
                            </div>
                            {nidaError && <p className="text-xs text-red-500 font-bold flex items-center gap-1"><AlertCircle size={12} /> {nidaError}</p>}
                            {nidaVerified && <p className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={12} /> {lang === 'sw' ? 'NIDA imehakikiwa kikamilifu' : 'NIDA verified successfully'}</p>}
                          </div>
                        ) : (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                            <p className="text-xs text-amber-700">
                              <AlertCircle size={12} className="inline mr-1" />
                              {lang === 'sw' 
                                ? 'Akaunti bila NIDA itahitaji uthibitisho wa ziada. Huduma zingine zinaweza kuwa na vikwazo.' 
                                : 'Accounts without NIDA require additional verification. Some services may be restricted.'}
                            </p>
                          </div>
                        )}

                        {/* ID Type & ID Number — always visible */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                              {lang === 'sw' ? 'Aina ya Kitambulisho' : 'ID Type'}
                              {!regForm.hasNida && <span className="text-red-400 ml-0.5">*</span>}
                            </label>
                            <select
                              value={regForm.idType}
                              onChange={(e) => updateRegForm('idType', e.target.value)}
                              className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                              aria-label="ID Type"
                            >
                              <option value="">{lang === 'sw' ? 'Chagua Aina ya Kitambulisho' : 'Select ID Type'}</option>
                              <option value="birth_certificate">{lang === 'sw' ? 'Cheti cha Kuzaliwa' : 'Birth Certificate'}</option>
                              <option value="voter_id">{lang === 'sw' ? 'Kadi ya Mpiga Kura (E-NEC)' : 'Voter ID (E-NEC)'}</option>
                              <option value="driving_license">{lang === 'sw' ? 'Leseni ya Udereva' : 'Driving License'}</option>
                              <option value="zanzibar_id">{lang === 'sw' ? 'Kitambulisho cha Zanzibar' : 'Zanzibar ID'}</option>
                              <option value="student_id">{lang === 'sw' ? 'Kitambulisho cha Mwanafunzi' : 'Student ID'}</option>
                              <option value="employer_id">{lang === 'sw' ? 'Kitambulisho cha Kazi' : 'Employer ID'}</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                              {lang === 'sw' ? 'Namba ya Kitambulisho' : 'ID Number'}
                              {!regForm.hasNida && <span className="text-red-400 ml-0.5">*</span>}
                            </label>
                            <input 
                              type="text"
                              value={regForm.idNumber}
                              onChange={(e) => updateRegForm('idNumber', e.target.value)}
                              className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                              placeholder={lang === 'sw' ? 'Ingiza Namba ya Kitambulisho' : 'Enter ID Number'}
                              aria-label="ID Number"
                            />
                          </div>
                        </div>

                        {/* Phone number — collected early in Step 1 */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                            {lang === 'sw' ? 'Namba ya Simu' : 'Phone Number'} <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 z-10" size={20} />
                            <PhoneInput
                              international
                              defaultCountry="TZ"
                              value={regForm.phone}
                              onChange={(val) => updateRegForm('phone', val)}
                              className="w-full h-14 pl-12 pr-4 bg-stone-50 border border-stone-200 rounded-2xl focus-within:ring-2 focus-within:ring-emerald-500 transition-all font-medium"
                              aria-label="Phone Number"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Namba ya Pasipoti' : 'Passport Number'}</label>
                        <input 
                          type="text"
                          value={regForm.passportNumber}
                          onChange={(e) => updateRegForm('passportNumber', e.target.value)}
                          className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                          placeholder={lang === 'sw' ? 'Ingiza Namba ya Pasipoti' : 'Enter Passport Number'}
                          aria-label="Passport Number"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Jina la Kwanza' : 'First Name'}</label>
                        <input 
                          type="text"
                          value={regForm.firstName}
                          onChange={(e) => updateRegForm('firstName', e.target.value)}
                          readOnly={nidaVerified}
                          className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium disabled:opacity-70"
                          aria-label="First Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Jina la Kati' : 'Middle Name'}</label>
                        <input 
                          type="text"
                          value={regForm.middleName}
                          onChange={(e) => updateRegForm('middleName', e.target.value)}
                          readOnly={nidaVerified}
                          className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium disabled:opacity-70"
                          aria-label="Middle Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Jina la Mwisho' : 'Last Name'}</label>
                        <input 
                          type="text"
                          value={regForm.lastName}
                          onChange={(e) => updateRegForm('lastName', e.target.value)}
                          readOnly={nidaVerified}
                          className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium disabled:opacity-70"
                          aria-label="Last Name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Jinsia' : 'Gender'}</label>
                      <div className="flex gap-4">
                        {['M', 'F'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => !nidaVerified && updateRegForm('sex', s)}
                            className={cn(
                              "flex-1 h-14 rounded-2xl font-bold border-2 transition-all",
                              regForm.sex === s ? "bg-emerald-50 border-emerald-600 text-emerald-600" : "bg-white border-stone-100 text-stone-400"
                            )}
                          >
                            {s === 'M' ? (lang === 'sw' ? 'Mwanaume' : 'Male') : (lang === 'sw' ? 'Mwanamke' : 'Female')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                          {lang === 'sw' ? 'Tarehe ya Kuzaliwa' : 'Date of Birth'} <span className="text-red-400">*</span>
                        </label>
                        <input 
                          type="date"
                          value={regForm.dateOfBirth}
                          onChange={(e) => updateRegForm('dateOfBirth', e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                          aria-label="Date of Birth"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                          {lang === 'sw' ? 'Mahali pa Kuzaliwa' : 'Place of Birth'}
                        </label>
                        <input 
                          type="text"
                          value={regForm.placeOfBirth}
                          onChange={(e) => updateRegForm('placeOfBirth', e.target.value)}
                          className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                          placeholder={lang === 'sw' ? 'Mfano: Dar es Salaam' : 'e.g. Dar es Salaam'}
                          aria-label="Place of Birth"
                        />
                      </div>
                    </div>

                    {/* Marital Status, Occupation, Education */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                          {lang === 'sw' ? 'Hali ya Ndoa' : 'Marital Status'}
                        </label>
                        <select 
                          value={regForm.maritalStatus}
                          onChange={(e) => updateRegForm('maritalStatus', e.target.value)}
                          className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                          aria-label="Marital Status"
                        >
                          <option value="">{lang === 'sw' ? 'Chagua' : 'Select'}</option>
                          <option value="single">{lang === 'sw' ? 'Sijaoa/Sijaolewa' : 'Single'}</option>
                          <option value="married">{lang === 'sw' ? 'Nimeoa/Nimeolewa' : 'Married'}</option>
                          <option value="divorced">{lang === 'sw' ? 'Nimetaliki' : 'Divorced'}</option>
                          <option value="widowed">{lang === 'sw' ? 'Mjane' : 'Widowed'}</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                          {lang === 'sw' ? 'Kazi / Shughuli' : 'Occupation'}
                        </label>
                        <input 
                          type="text"
                          value={regForm.occupation}
                          onChange={(e) => updateRegForm('occupation', e.target.value)}
                          className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                          placeholder={lang === 'sw' ? 'Mfano: Mfanyabiashara' : 'e.g. Business Owner'}
                          aria-label="Occupation"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">
                          {lang === 'sw' ? 'Kiwango cha Elimu' : 'Education Level'}
                        </label>
                        <select 
                          value={regForm.educationLevel}
                          onChange={(e) => updateRegForm('educationLevel', e.target.value)}
                          className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                          aria-label="Education Level"
                        >
                          <option value="">{lang === 'sw' ? 'Chagua' : 'Select'}</option>
                          <option value="none">{lang === 'sw' ? 'Hakuna' : 'None'}</option>
                          <option value="primary">{lang === 'sw' ? 'Msingi' : 'Primary'}</option>
                          <option value="secondary">{lang === 'sw' ? 'Sekondari' : 'Secondary'}</option>
                          <option value="diploma">{lang === 'sw' ? 'Diploma' : 'Diploma'}</option>
                          <option value="degree">{lang === 'sw' ? 'Shahada' : 'Degree'}</option>
                          <option value="masters">{lang === 'sw' ? 'Uzamili' : 'Masters'}</option>
                          <option value="phd">{lang === 'sw' ? 'Uzamivu' : 'PhD'}</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      onClick={() => setRegStep(2)}
                      className="w-full h-16 bg-stone-900 text-white rounded-2xl font-bold text-lg hover:bg-stone-800 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      {lang === 'sw' ? 'Endelea' : 'Continue'} <ArrowRight size={20} />
                    </button>
                  </motion.div>
                )}

                {regStep === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Nchi' : 'Country'}</label>
                        <select 
                          value={regForm.country}
                          onChange={(e) => {
                            updateRegForm('country', e.target.value);
                            if (e.target.value !== 'Tanzania') {
                              updateRegForm('region', '');
                              updateRegForm('district', '');
                              updateRegForm('ward', '');
                            }
                          }}
                          className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                          aria-label="Country"
                        >
                          <option value="">{lang === 'sw' ? 'Chagua Nchi' : 'Select Country'}</option>
                          {COUNTRIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      {regForm.country === 'Tanzania' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Mkoa' : 'Region'}</label>
                            <select 
                              value={regForm.region}
                              onChange={(e) => {
                                updateRegForm('region', e.target.value);
                                updateRegForm('district', '');
                                updateRegForm('ward', '');
                              }}
                              className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                              aria-label="Region"
                            >
                              <option value="">{lang === 'sw' ? 'Chagua Mkoa' : 'Select Region'}</option>
                              {TANZANIA_ADDRESS_DATA.map(r => (
                                <option key={r.name} value={r.name}>{r.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Wilaya' : 'District'}</label>
                            <select 
                              value={regForm.district}
                              onChange={(e) => {
                                updateRegForm('district', e.target.value);
                                updateRegForm('ward', '');
                              }}
                              disabled={!regForm.region}
                              className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium disabled:opacity-50"
                              aria-label="District"
                            >
                              <option value="">{lang === 'sw' ? 'Chagua Wilaya' : 'Select District'}</option>
                              {TANZANIA_ADDRESS_DATA.find(r => r.name === regForm.region)?.districts.map(d => (
                                <option key={d.name} value={d.name}>{d.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Kata' : 'Ward'}</label>
                            <select 
                              value={regForm.ward}
                              onChange={(e) => updateRegForm('ward', e.target.value)}
                              disabled={!regForm.district}
                              className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium disabled:opacity-50"
                              aria-label="Ward"
                            >
                              <option value="">{lang === 'sw' ? 'Chagua Kata' : 'Select Ward'}</option>
                              {TANZANIA_ADDRESS_DATA.find(r => r.name === regForm.region)
                                ?.districts.find(d => d.name === regForm.district)
                                ?.wards.map(w => (
                                  <option key={w} value={w}>{w}</option>
                                ))}
                              <option value="Mengineyo">{lang === 'sw' ? 'Mengineyo' : 'Other'}</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Mtaa' : 'Street'}</label>
                            <input 
                              type="text"
                              value={regForm.street}
                              onChange={(e) => updateRegForm('street', e.target.value)}
                              className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                              placeholder={lang === 'sw' ? 'Ingiza Mtaa' : 'Enter Street'}
                              aria-label="Street"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Anwani' : 'Address'}</label>
                          <textarea 
                            value={regForm.street}
                            onChange={(e) => updateRegForm('street', e.target.value)}
                            className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium min-h-24"
                            placeholder={lang === 'sw' ? 'Ingiza anwani yako kamili' : 'Enter your full address'}
                            aria-label="Address"
                          />
                        </div>
                      )}

                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-3">
                        <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
                        <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                          {lang === 'sw' 
                            ? 'Tafadhali hakikisha anwani yako ni sahihi kwa ajili ya mawasiliano.' 
                            : 'Please ensure your address is accurate for communication purposes.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => setRegStep(1)}
                        className="flex-1 h-16 bg-white border border-stone-200 text-stone-600 rounded-2xl font-bold text-lg hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
                      >
                        <ArrowLeft size={20} /> {lang === 'sw' ? 'Rudi' : 'Back'}
                      </button>
                      <button 
                        onClick={() => setRegStep(3)}
                        className="flex-2 h-16 bg-stone-900 text-white rounded-2xl font-bold text-lg hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
                      >
                        {lang === 'sw' ? 'Endelea' : 'Continue'} <ArrowRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {regStep === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <form onSubmit={handleSignup} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Barua pepe' : 'Email'}</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                          <input 
                            type="email" 
                            value={regForm.email}
                            onChange={(e) => updateRegForm('email', e.target.value)}
                            className="w-full h-14 pl-12 pr-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                            placeholder="juma@example.com"
                            required
                            aria-label="Email Address"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Nenosiri' : 'Password'}</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                            <input 
                              type="password" 
                              value={regForm.password}
                              onChange={(e) => updateRegForm('password', e.target.value)}
                              className="w-full h-14 pl-12 pr-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                              placeholder="••••••••"
                              required
                              aria-label="Password"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Thibitisha Nywila' : 'Confirm Password'}</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                            <input 
                              type="password" 
                              value={regForm.confirmPassword}
                              onChange={(e) => updateRegForm('confirmPassword', e.target.value)}
                              className="w-full h-14 pl-12 pr-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                              placeholder="••••••••"
                              required
                              aria-label="Confirm Password"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4">
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input type="checkbox" required className="mt-1 h-5 w-5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-xs text-stone-500 leading-relaxed font-medium group-hover:text-stone-700 transition-colors">
                            {lang === 'sw' 
                              ? "Ninakubali Vigezo na Masharti ya E-Mtaa na Sera ya Faragha ya Serikali ya Tanzania." 
                              : "I agree to the E-Mtaa Terms and Conditions and the Government of Tanzania Privacy Policy."}
                          </span>
                        </label>

                        <div className="flex gap-4">
                          <button 
                            className="flex-1 h-16 bg-white border border-stone-200 text-stone-600 rounded-2xl font-bold text-lg hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
                            type="button" 
                            onClick={() => setRegStep(2)}
                          >
                            <ArrowLeft size={20} /> {lang === 'sw' ? 'Rudi' : 'Back'}
                          </button>
                          <button 
                            disabled={loading}
                            className="flex-2 h-16 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 disabled:opacity-50 group"
                            type="submit"
                          >
                            {loading ? <Loader2 className="animate-spin" /> : (
                              <>
                                {lang === 'sw' ? 'Kamilisha Usajili' : 'Complete Registration'} 
                                <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
