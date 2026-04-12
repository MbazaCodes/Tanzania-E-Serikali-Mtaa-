import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  CheckCircle2, 
  AlertCircle, 
  Building2,
  RefreshCw,
  Search
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PendingApprovals } from '@/components/PendingApprovals';
import { Application } from '@/lib/supabase';

interface DashboardProps {
  applications: Application[];
  setView: (view: any) => void;
  onRefresh?: () => void;
}

export function Dashboard({ applications, setView, onRefresh }: DashboardProps) {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-stone-900">{lang === 'sw' ? 'Dashibodi' : 'Dashboard'}</h1>
        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-semibold text-sm hover:bg-emerald-100 transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            {lang === 'sw' ? 'Onyesha Upya' : 'Refresh'}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard 
          icon={<FileText className="text-blue-500" />} 
          label={lang === 'sw' ? "Jumla ya Maombi" : "Total Applications"} 
          value={applications.length} 
        />
        <StatCard 
          icon={<Clock className="text-amber-500" />} 
          label={lang === 'sw' ? "Yanasubiri Uhakiki" : "Pending Verification"} 
          value={applications.filter(a => a.status === 'submitted').length} 
        />
        <StatCard 
          icon={<CheckCircle className="text-emerald-500" />} 
          label={lang === 'sw' ? "Hati Zilizoidhinishwa" : "Approved Documents"} 
          value={applications.filter(a => a.status === 'approved' || a.status === 'issued').length} 
        />
      </div>

      {user && (
        <div className="bg-emerald-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-200">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-heading font-extrabold">
                  {lang === 'sw' ? `Karibu, ${user.first_name || 'Mtumiaji'}` : `Welcome, ${user.first_name || 'User'}`}
                </h2>
                {user.is_verified && (
                  <div className="bg-white/20 backdrop-blur-md p-1 rounded-full border border-white/30" title={lang === 'sw' ? 'Imethibitishwa' : 'Verified'}>
                    <CheckCircle2 size={18} className="text-emerald-300" />
                  </div>
                )}
              </div>
              <p className="text-emerald-50 opacity-90 font-medium text-sm sm:text-base">
                {lang === 'sw' 
                  ? `Umeingia kama ${user.role === 'citizen' ? 'Mwananchi' : user.role === 'admin' ? 'Msimamizi' : 'Mtumishi'}.`
                  : `Logged in as ${user.role}.`
                }
                <span className="block sm:inline sm:ml-2">
                  {lang === 'sw' ? 'Eneo lako:' : 'Your Location:'} {
                    user.role === 'citizen' 
                      ? `${user.region || '-'}${user.district ? ` / ${user.district}` : ''}`
                      : `${user.assigned_region || '-'}${user.assigned_district ? ` / ${user.assigned_district}` : ' (Ofisi ya Mkoa)'}`
                  }
                </span>
              </p>
            </div>
            
            {user.role === 'citizen' && !user.is_verified && (
              <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 flex items-center gap-3 w-fit">
                <AlertCircle size={20} className="text-amber-300 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold">{lang === 'sw' ? 'Akaunti Inasubiri Uhakiki' : 'Account Pending Verification'}</p>
                  <p className="opacity-80">{lang === 'sw' ? 'Tafadhali subiri uhakiki kutoka ofisi ya mtaa.' : 'Please wait for verification from the local government office.'}</p>
                </div>
              </div>
            )}
          </div>
          <Building2 className="absolute -right-5 -bottom-5 h-32 sm:h-48 w-32 sm:w-48 text-white/10 rotate-12" />
        </div>
      )}

      {/* Pending Approvals Section - Show only for citizens */}
      {user?.role === 'citizen' && (
        <PendingApprovals lang={lang} />
      )}

      {/* Verify Documents Card */}
      <div 
        onClick={() => setView('verify_documents')}
        className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200 cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all group"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Search size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-heading font-extrabold">
                  {lang === 'sw' ? 'Hakiki Hati' : 'Verify Documents'}
                </h3>
                <p className="text-blue-100 opacity-90 font-medium text-sm">
                  {lang === 'sw' 
                    ? 'Thibitisha uhalali wa hati za serikali'
                    : 'Verify authenticity of government documents'}
                </p>
              </div>
            </div>
          </div>
          
          <button
            className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2 group-hover:gap-3"
          >
            {lang === 'sw' ? 'Hakiki Sasa' : 'Verify Now'}
            <Search size={18} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
        <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <h2 className="font-bold text-stone-800">{lang === 'sw' ? 'Maombi ya Karibuni' : 'Recent Applications'}</h2>
          <button onClick={() => setView('applications')} className="text-sm text-emerald-600 font-semibold hover:underline">{lang === 'sw' ? 'Tazama Yote' : 'View All'}</button>
        </div>
        <div className="divide-y divide-stone-100">
          {applications.slice(0, 5).map(app => (
            <div key={app.id} className="px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="font-semibold text-stone-800">{(app as any).services?.name}</p>
                  <p className="text-xs text-stone-500">{app.application_number}</p>
                </div>
              </div>
              <StatusBadge status={app.status} lang={lang} />
            </div>
          ))}
          {applications.length === 0 && (
            <div className="px-6 py-12 text-center text-stone-400">
              {lang === 'sw' ? 'Hakuna maombi yaliyopatikana.' : 'No applications found.'}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
